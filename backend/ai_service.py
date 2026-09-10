"""
ai_service.py
-------------------------------------------------------------------
Optional AI explanation layer.

PhishGuard AI is fully functional with AI_PROVIDER=none: the local
rule-based detection_engine.py is the source of truth for the risk
score. When an AI provider IS configured, we additionally ask it for
a natural-language explanation and let it propose its own indicators
list -- but we NEVER trust it blindly:

  * The response must be valid JSON matching the expected shape, or
    we discard it and fall back to the rule-based explanation.
  * risk_score / classification / confidence are clamped and
    re-validated.
  * The AI is never given credentials to execute or fetch URLs -- it
    only ever sees the analyzed text as a string.
"""

import json
import os
import requests

ALLOWED_CLASSIFICATIONS = {"SAFE", "LOW RISK", "SUSPICIOUS", "HIGH RISK"}

SYSTEM_INSTRUCTIONS = """You are a cybersecurity analyst inside a phishing-detection product.
You will be given the text of a URL, email, or message to analyze. You must NEVER visit,
fetch, or execute any URL you are given -- only analyze it as text.

Respond with ONLY a raw JSON object (no markdown fences, no prose) in exactly this shape:
{
  "risk_score": <integer 0-100>,
  "classification": "SAFE" | "LOW RISK" | "SUSPICIOUS" | "HIGH RISK",
  "summary": "<one sentence>",
  "indicators": ["<short indicator name>", ...],
  "explanation": "<2-4 sentences explaining WHY, in plain language>",
  "recommended_actions": ["<action>", ...],
  "confidence": <integer 0-100>
}
"""


class AIUnavailable(Exception):
    pass


def _provider():
    return os.environ.get("AI_PROVIDER", "none").strip().lower()


def is_configured() -> bool:
    provider = _provider()
    key = os.environ.get("AI_API_KEY", "").strip()
    return provider in ("gemini", "openai") and bool(key)


def _call_gemini(content: str) -> str:
    api_key = os.environ["AI_API_KEY"]
    model = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": SYSTEM_INSTRUCTIONS + "\n\nContent to analyze:\n" + content}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 500},
    }
    resp = requests.post(url, json=payload, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]


def _call_openai(content: str) -> str:
    api_key = os.environ["AI_API_KEY"]
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_INSTRUCTIONS},
            {"role": "user", "content": "Content to analyze:\n" + content},
        ],
        "temperature": 0.2,
        "max_tokens": 500,
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]


def _extract_json(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    cleaned = cleaned.replace("```json", "").replace("```", "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in AI response")
    return json.loads(cleaned[start:end + 1])


def _validate(parsed: dict) -> dict:
    score = parsed.get("risk_score", 0)
    try:
        score = int(round(float(score)))
    except (TypeError, ValueError):
        score = 0
    score = max(0, min(100, score))

    classification = str(parsed.get("classification", "")).strip().upper()
    if classification not in ALLOWED_CLASSIFICATIONS:
        # derive from score instead of trusting an invalid label
        if score >= 75:
            classification = "HIGH RISK"
        elif score >= 50:
            classification = "SUSPICIOUS"
        elif score >= 25:
            classification = "LOW RISK"
        else:
            classification = "SAFE"

    confidence = parsed.get("confidence", 60)
    try:
        confidence = int(round(float(confidence)))
    except (TypeError, ValueError):
        confidence = 60
    confidence = max(0, min(100, confidence))

    indicators = parsed.get("indicators", [])
    if not isinstance(indicators, list):
        indicators = []
    indicators = [str(i)[:120] for i in indicators][:10]

    actions = parsed.get("recommended_actions", [])
    if not isinstance(actions, list):
        actions = []
    actions = [str(a)[:200] for a in actions][:8]

    summary = str(parsed.get("summary", ""))[:300] or "AI analysis completed."
    explanation = str(parsed.get("explanation", ""))[:800] or summary

    return {
        "risk_score": score,
        "classification": classification,
        "summary": summary,
        "indicators": indicators,
        "explanation": explanation,
        "recommended_actions": actions,
        "confidence": confidence,
    }


def get_ai_explanation(content: str) -> dict:
    """Returns a validated dict, or raises AIUnavailable so callers can
    gracefully fall back to the rule-based engine."""
    if not is_configured():
        raise AIUnavailable("AI provider not configured")

    provider = _provider()
    try:
        if provider == "gemini":
            raw = _call_gemini(content)
        elif provider == "openai":
            raw = _call_openai(content)
        else:
            raise AIUnavailable(f"Unknown provider: {provider}")

        parsed = _extract_json(raw)
        return _validate(parsed)
    except Exception as exc:  # noqa: BLE001 - any failure degrades to rule engine
        raise AIUnavailable(str(exc)) from exc
