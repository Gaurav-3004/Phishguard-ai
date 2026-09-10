"""
main.py
-------------------------------------------------------------------
PhishGuard AI backend (Flask).

Run:
    pip install -r requirements.txt
    python main.py

Endpoints implement the API surface described in the project spec,
section 16. Every response is JSON; malformed input returns 400 with
a clear message rather than a stack trace.
"""

import logging
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

load_dotenv()

import ai_service
import database
import detection_engine
from simulator_questions import QUESTIONS, QUESTIONS_BY_ID

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("phishguard")

app = Flask(__name__)

CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "http://localhost:5173")
CORS(app, resources={r"/api/*": {"origins": CORS_ORIGIN}})

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=[f"{os.environ.get('RATE_LIMIT_PER_MINUTE', 30)} per minute"],
    storage_uri="memory://",
)

database.init_db()

MAX_INPUT_LEN = 8000


def error_response(message, status=400):
    return jsonify({"error": message}), status


def clip(text, max_len=MAX_INPUT_LEN):
    return (text or "")[:max_len]


def run_analysis(scan_type, score, indicators, positives, raw_text):
    """Shared post-processing: optionally enrich with AI, build the
    response payload, and persist a privacy-safe history entry."""
    classification = detection_engine.classify(score)
    summary = detection_engine.build_summary(classification, scan_type, indicators)
    actions = detection_engine.recommended_actions(classification, scan_type)
    ai_used = False
    confidence = 70 if indicators else 90

    if ai_service.is_configured():
        try:
            ai_result = ai_service.get_ai_explanation(raw_text)
            # Blend: trust the deterministic score as ground truth, but let
            # the AI enrich the explanation/summary/extra indicators.
            summary = ai_result["explanation"] or summary
            confidence = ai_result["confidence"]
            extra_indicator_names = {i["title"] for i in indicators}
            for name in ai_result["indicators"]:
                if name not in extra_indicator_names:
                    indicators.append({
                        "id": "ai_" + str(abs(hash(name)) % 10_000),
                        "title": name,
                        "severity": "medium",
                        "explanation": ai_result["explanation"],
                        "weight": 0,
                    })
            if ai_result["recommended_actions"]:
                actions = ai_result["recommended_actions"]
            ai_used = True
        except ai_service.AIUnavailable as exc:
            log.info("AI explanation unavailable, using rule-based fallback: %s", exc)
            ai_used = False

    scan_id = database.insert_scan(
        scan_type=scan_type,
        input_preview=raw_text,
        risk_score=score,
        classification=classification,
        summary=summary,
        indicators=indicators,
        recommended_actions=actions,
        ai_used=ai_used,
        confidence=confidence,
    )

    return {
        "id": scan_id,
        "scan_type": scan_type,
        "risk_score": score,
        "classification": classification,
        "summary": summary,
        "indicators": indicators,
        "positive_indicators": positives,
        "recommended_actions": actions,
        "ai_used": ai_used,
        "ai_note": None if ai_used else "AI explanation unavailable. Showing rule-based analysis.",
        "confidence": confidence,
    }


# ---------------------------------------------------------------------------
# Analysis endpoints
# ---------------------------------------------------------------------------
@app.post("/api/analyze/url")
def analyze_url():
    data = request.get_json(silent=True) or {}
    url = clip(data.get("url", "").strip())
    if not url:
        return error_response("Please enter a URL to analyze.")
    if " " in url or "." not in url:
        return error_response("Please enter a valid URL.")

    score, indicators, positives = detection_engine.analyze_url(url)
    result = run_analysis("URL", score, indicators, positives, url)
    return jsonify(result)


@app.post("/api/analyze/email")
def analyze_email():
    data = request.get_json(silent=True) or {}
    sender = clip(data.get("sender", "").strip())
    subject = clip(data.get("subject", "").strip())
    body = clip(data.get("content", data.get("body", "")).strip())

    if not (sender or subject or body):
        return error_response("Please enter content to analyze.")

    score, indicators, positives = detection_engine.analyze_email(sender, subject, body)
    preview = subject or body or sender
    result = run_analysis("EMAIL", score, indicators, positives,
                           f"From: {sender}\nSubject: {subject}\n\n{body}")
    result["preview"] = database.make_preview(preview)
    return jsonify(result)


@app.post("/api/analyze/message")
def analyze_message():
    data = request.get_json(silent=True) or {}
    text = clip(data.get("text", data.get("content", "")).strip())
    if not text:
        return error_response("Please enter content to analyze.")

    score, indicators, positives = detection_engine.analyze_message(text)
    result = run_analysis("MESSAGE", score, indicators, positives, text)
    return jsonify(result)


# ---------------------------------------------------------------------------
# History endpoints
# ---------------------------------------------------------------------------
@app.get("/api/history")
def get_history():
    return jsonify(database.get_history())


@app.get("/api/history/<int:scan_id>")
def get_history_item(scan_id):
    scan = database.get_scan(scan_id)
    if not scan:
        return error_response("Report not found.", 404)
    return jsonify(scan)


@app.delete("/api/history/<int:scan_id>")
def delete_history_item(scan_id):
    deleted = database.delete_scan(scan_id)
    if not deleted:
        return error_response("Report not found.", 404)
    return jsonify({"deleted": True, "id": scan_id})


@app.delete("/api/history")
def clear_all_history():
    database.clear_history()
    return jsonify({"cleared": True})


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
@app.get("/api/dashboard")
def dashboard():
    stats = database.dashboard_stats()
    stats["simulator"] = database.simulator_stats()
    return jsonify(stats)


# ---------------------------------------------------------------------------
# Simulator
# ---------------------------------------------------------------------------
@app.get("/api/simulator/questions")
def simulator_questions():
    # Never leak which option is correct or the explanation up-front.
    public = [
        {
            "id": q["id"],
            "category": q["category"],
            "sender": q["sender"],
            "subject": q["subject"],
            "body": q["body"],
            "options": q["options"],
        }
        for q in QUESTIONS
    ]
    return jsonify(public)


@app.post("/api/simulator/answer")
def simulator_answer():
    data = request.get_json(silent=True) or {}
    question_id = data.get("question_id")
    selected = data.get("selected_option")

    question = QUESTIONS_BY_ID.get(question_id)
    if not question:
        return error_response("Unknown question.", 404)
    if selected not in {opt["id"] for opt in question["options"]}:
        return error_response("Invalid option selected.")

    correct = selected == question["correct_option"]
    database.record_simulator_attempt(question_id, correct)

    return jsonify({
        "correct": correct,
        "correct_option": question["correct_option"],
        "explanation": question["explanation"],
        "points": 100 if correct else 0,
    })


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "ai_configured": ai_service.is_configured(),
        "detection_engine": "rule-based (deterministic)",
    })


# ---------------------------------------------------------------------------
# Error handling (never leak stack traces)
# ---------------------------------------------------------------------------
@app.errorhandler(404)
def not_found(_e):
    return error_response("Not found.", 404)


@app.errorhandler(429)
def rate_limited(_e):
    return error_response("Too many requests. Please slow down and try again shortly.", 429)


@app.errorhandler(Exception)
def handle_uncaught(e):
    log.exception("Unhandled error")
    return error_response("Analysis service is temporarily unavailable. Local detection is still available.", 500)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_ENV") == "development")
