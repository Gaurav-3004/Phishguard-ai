"""
database.py
-------------------------------------------------------------------
Thin SQLite persistence layer for PhishGuard AI.

Privacy note (see project spec, section 18): we deliberately only ever
persist a short, non-sensitive PREVIEW of submitted content, never the
full email body / message text / URL query strings. This keeps the
History feature useful for the user without turning the database into
a store of sensitive personal content.
"""

import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

DATABASE_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "phishguard.db"))

PREVIEW_MAX_LEN = 120


def _connect():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def get_db():
    conn = _connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                scan_type TEXT NOT NULL CHECK (scan_type IN ('URL', 'EMAIL', 'MESSAGE')),
                input_preview TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                classification TEXT NOT NULL,
                summary TEXT NOT NULL,
                indicators_json TEXT NOT NULL,
                recommended_actions_json TEXT NOT NULL,
                ai_used INTEGER NOT NULL DEFAULT 0,
                confidence INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS simulator_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                question_id TEXT NOT NULL,
                correct INTEGER NOT NULL
            )
            """
        )


def make_preview(text: str, max_len: int = PREVIEW_MAX_LEN) -> str:
    """Collapse whitespace and truncate. Never store the raw full text."""
    if not text:
        return ""
    collapsed = " ".join(text.split())
    if len(collapsed) <= max_len:
        return collapsed
    return collapsed[: max_len - 1].rstrip() + "…"


def insert_scan(scan_type, input_preview, risk_score, classification, summary,
                 indicators, recommended_actions, ai_used=False, confidence=0):
    with get_db() as conn:
        cur = conn.execute(
            """
            INSERT INTO scans
                (created_at, scan_type, input_preview, risk_score, classification,
                 summary, indicators_json, recommended_actions_json, ai_used, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                datetime.now(timezone.utc).isoformat(),
                scan_type,
                make_preview(input_preview),
                risk_score,
                classification,
                summary,
                json.dumps(indicators),
                json.dumps(recommended_actions),
                1 if ai_used else 0,
                confidence,
            ),
        )
        return cur.lastrowid


def row_to_dict(row: sqlite3.Row) -> dict:
    d = dict(row)
    d["indicators"] = json.loads(d.pop("indicators_json", "[]") or "[]")
    d["recommended_actions"] = json.loads(d.pop("recommended_actions_json", "[]") or "[]")
    d["ai_used"] = bool(d.get("ai_used"))
    return d


def get_history(limit=100):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM scans ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [row_to_dict(r) for r in rows]


def get_scan(scan_id):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM scans WHERE id = ?", (scan_id,)).fetchone()
        return row_to_dict(row) if row else None


def delete_scan(scan_id):
    with get_db() as conn:
        cur = conn.execute("DELETE FROM scans WHERE id = ?", (scan_id,))
        return cur.rowcount > 0


def clear_history():
    with get_db() as conn:
        conn.execute("DELETE FROM scans")


def dashboard_stats():
    with get_db() as conn:
        rows = conn.execute("SELECT risk_score, classification, created_at FROM scans ORDER BY id ASC").fetchall()

        total = len(rows)
        if total == 0:
            return {
                "total_scans": 0,
                "threats_detected": 0,
                "safe_messages": 0,
                "average_risk_score": 0,
                "distribution": {"SAFE": 0, "LOW RISK": 0, "SUSPICIOUS": 0, "HIGH RISK": 0},
                "trend": [],
            }

        distribution = {"SAFE": 0, "LOW RISK": 0, "SUSPICIOUS": 0, "HIGH RISK": 0}
        threats = 0
        safe = 0
        score_sum = 0
        trend = []
        for r in rows:
            distribution[r["classification"]] = distribution.get(r["classification"], 0) + 1
            score_sum += r["risk_score"]
            if r["classification"] in ("HIGH RISK", "SUSPICIOUS"):
                threats += 1
            if r["classification"] == "SAFE":
                safe += 1
            trend.append({"date": r["created_at"][:10], "score": r["risk_score"]})

        return {
            "total_scans": total,
            "threats_detected": threats,
            "safe_messages": safe,
            "average_risk_score": round(score_sum / total),
            "distribution": distribution,
            "trend": trend[-30:],
        }


def simulator_stats():
    with get_db() as conn:
        rows = conn.execute("SELECT correct FROM simulator_attempts").fetchall()
        total = len(rows)
        correct = sum(1 for r in rows if r["correct"])
        accuracy = round((correct / total) * 100) if total else 0
        return {
            "questions_completed": total,
            "correct": correct,
            "accuracy": accuracy,
            "cyber_awareness_score": correct * 100,
        }


def record_simulator_attempt(question_id: str, correct: bool):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO simulator_attempts (created_at, question_id, correct) VALUES (?, ?, ?)",
            (datetime.now(timezone.utc).isoformat(), question_id, 1 if correct else 0),
        )
