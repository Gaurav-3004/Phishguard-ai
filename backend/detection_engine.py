"""
detection_engine.py
-------------------------------------------------------------------
Deterministic, rule-based phishing detection engine.

This engine NEVER returns a random score. Every point on the 0-100
scale is explained by a specific, named indicator so the UI can show
the user exactly *why* a score was produced. This is also the
fallback used whenever the AI provider is unavailable or misconfigured
(see ai_service.py), so PhishGuard AI always works end-to-end even
with zero external dependencies.

Scoring
-------
Each detected indicator contributes a fixed weight (see INDICATOR
WEIGHTS below, matching the project spec). Weights are summed and
clamped to [0, 100]. Classification bands:

    0-24   SAFE
    25-49  LOW RISK
    50-74  SUSPICIOUS
    75-100 HIGH RISK
"""

import re
from urllib.parse import urlparse

# ---------------------------------------------------------------------------
# Indicator weights (from project spec, section 7)
# ---------------------------------------------------------------------------
WEIGHTS = {
    "urgency": 15,
    "credential_request": 20,
    "financial_request": 20,
    "suspicious_url": 20,
    "impersonation": 15,
    "threatening_language": 10,
    "unknown_sender": 10,
    "shortened_url": 10,
    "ip_address_url": 15,
    "suspicious_tld": 10,
    # extra, URL-specific indicators (kept smaller so the core weights above
    # still dominate the score, as required by the spec)
    "no_https": 8,
    "excessive_subdomains": 8,
    "suspicious_keywords_in_url": 10,
    "encoded_characters": 8,
    "excessive_url_length": 6,
    "suspicious_characters": 6,
    "reward_scam": 15,
    "grammar_anomalies": 6,
}

URGENCY_WORDS = [
    "urgent", "immediately", "act now", "right away", "as soon as possible",
    "final notice", "last chance", "expire", "expires", "expiring", "24 hours",
    "within 24", "time-sensitive", "act fast", "limited time",
]

THREAT_WORDS = [
    "suspend", "suspended", "suspension", "terminate", "terminated",
    "locked", "lock your account", "deactivat", "legal action",
    "penalty", "fine", "will be closed", "unauthorized access",
    "unusual activity", "suspicious activity",
]

CREDENTIAL_WORDS = [
    "verify your password", "confirm your password", "enter your password",
    "verify your identity", "confirm your identity", "login to verify",
    "update your account", "verify your account", "confirm your account",
    "re-enter your credentials", "security question", "one-time password",
    "otp", "verification code", "ssn", "social security number",
]

FINANCIAL_WORDS = [
    "bank account", "credit card", "wire transfer", "payment failed",
    "invoice attached", "billing information", "refund", "claim your reward",
    "processing fee", "pay a fee", "pay ₹", "pay $", "gift card",
    "tax refund", "unclaimed funds",
]

REWARD_WORDS = [
    "congratulations", "you have won", "you won", "claim your prize",
    "you've been selected", "lucky winner", "free gift", "no cost to you",
]

IMPERSONATION_BRANDS = [
    "paypal", "amazon", "netflix", "microsoft", "apple", "google",
    "bank of america", "chase", "wells fargo", "irs", "hmrc",
    "instagram", "facebook", "linkedin", "dhl", "fedex", "usps",
]

SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly",
    "shorte.st", "cutt.ly", "rb.gy", "tiny.cc", "rebrand.ly",
}

SUSPICIOUS_TLDS = {
    ".zip", ".mov", ".xyz", ".top", ".club", ".work", ".gq", ".tk", ".ml",
    ".cf", ".ga", ".loan", ".men", ".click", ".link", ".rest", ".country",
}

URL_REGEX = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)
IP_HOST_REGEX = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")


def _contains_any(text_lower, phrases):
    return [p for p in phrases if p in text_lower]


def classify(score: int) -> str:
    if score >= 75:
        return "HIGH RISK"
    if score >= 50:
        return "SUSPICIOUS"
    if score >= 25:
        return "LOW RISK"
    return "SAFE"


def _indicator(key, title, severity, explanation):
    return {
        "id": key,
        "title": title,
        "severity": severity,
        "explanation": explanation,
        "weight": WEIGHTS.get(key, 5),
    }


def _severity_for(weight):
    if weight >= 18:
        return "high"
    if weight >= 10:
        return "medium"
    return "low"


# ---------------------------------------------------------------------------
# URL analysis
# ---------------------------------------------------------------------------
def analyze_url(raw_url: str):
    indicators = []
    positives = []

    url = raw_url.strip()
    parsed = urlparse(url if "://" in url else f"http://{url}")
    host = (parsed.hostname or "").lower()
    full_lower = url.lower()

    # HTTPS
    if parsed.scheme != "https":
        indicators.append(_indicator(
            "no_https", "No HTTPS encryption", _severity_for(WEIGHTS["no_https"]),
            "The link does not use HTTPS, so any data submitted through it "
            "could be transmitted without encryption."
        ))
    else:
        positives.append("HTTPS detected")

    # IP-based URL
    if IP_HOST_REGEX.match(host):
        indicators.append(_indicator(
            "ip_address_url", "IP address used instead of a domain",
            _severity_for(WEIGHTS["ip_address_url"]),
            "The link points directly to a numeric IP address rather than a "
            "named domain, a common technique used to hide the true "
            "destination of a phishing site."
        ))

    # Shortened URL
    if host in SHORTENERS:
        indicators.append(_indicator(
            "shortened_url", "Shortened URL", _severity_for(WEIGHTS["shortened_url"]),
            "This is a shortened link, which hides the real destination "
            "domain until after you click it."
        ))

    # Suspicious TLD
    if any(host.endswith(tld) for tld in SUSPICIOUS_TLDS):
        indicators.append(_indicator(
            "suspicious_tld", "Suspicious top-level domain",
            _severity_for(WEIGHTS["suspicious_tld"]),
            "The domain uses a top-level domain that is frequently "
            "associated with low-cost, disposable phishing infrastructure."
        ))

    # Excessive subdomains (skip IP hosts, where dots are not subdomain labels)
    is_ip_host = bool(IP_HOST_REGEX.match(host))
    label_count = 0 if is_ip_host else host.count(".")
    if host and not is_ip_host and label_count >= 3:
        indicators.append(_indicator(
            "excessive_subdomains", "Excessive subdomains",
            _severity_for(WEIGHTS["excessive_subdomains"]),
            "The domain uses an unusually high number of subdomains, "
            "often used to make a fake link look like a trusted brand "
            "(e.g. paypal.com.secure-login.example.xyz)."
        ))

    # Suspicious keywords in URL (brand impersonation in path/host)
    matched_brands = [b for b in IMPERSONATION_BRANDS if b.replace(" ", "") in host.replace("-", "").replace(".", "")]
    keyword_hits = _contains_any(full_lower, ["login", "verify", "secure", "account", "update", "confirm", "signin", "reset"])
    if matched_brands and host and not any(host == f"{b.replace(' ', '')}.com" for b in matched_brands):
        indicators.append(_indicator(
            "impersonation", f"Possible brand impersonation ({matched_brands[0]})",
            _severity_for(WEIGHTS["impersonation"]),
            f"The domain references '{matched_brands[0]}' but does not match "
            f"that brand's official domain pattern."
        ))
    if keyword_hits and (matched_brands or label_count >= 2):
        indicators.append(_indicator(
            "suspicious_keywords_in_url", "Suspicious keywords in URL",
            _severity_for(WEIGHTS["suspicious_keywords_in_url"]),
            "The URL contains words like '" + keyword_hits[0] + "' commonly "
            "used in credential-harvesting pages."
        ))

    # Encoded characters
    if "%" in url or "xn--" in host:
        indicators.append(_indicator(
            "encoded_characters", "Encoded or punycode characters",
            _severity_for(WEIGHTS["encoded_characters"]),
            "The URL contains encoded characters, sometimes used to disguise "
            "the real address or mimic a trusted domain (punycode attack)."
        ))

    # Excessive length
    if len(url) > 90:
        indicators.append(_indicator(
            "excessive_url_length", "Unusually long URL",
            _severity_for(WEIGHTS["excessive_url_length"]),
            "The URL is unusually long, which can be used to hide the real "
            "domain or bury it after junk characters."
        ))

    # Suspicious characters (@ symbol redirect trick, multiple hyphens)
    if "@" in url or host.count("-") >= 3:
        indicators.append(_indicator(
            "suspicious_characters", "Suspicious characters in URL",
            _severity_for(WEIGHTS["suspicious_characters"]),
            "The URL contains characters (such as '@' or repeated hyphens) "
            "that are often used to obscure the true destination."
        ))

    if not indicators:
        positives.extend([
            "No credential request", "No urgency language", "Trusted domain pattern",
        ])

    score = min(100, sum(i["weight"] for i in indicators))
    return score, indicators, positives


def _find_urls(text):
    return URL_REGEX.findall(text or "")


def _text_indicators(text: str):
    """Shared keyword-based detection used by email + message analysis."""
    indicators = []
    lower = (text or "").lower()

    urgency_hits = _contains_any(lower, URGENCY_WORDS)
    if urgency_hits:
        indicators.append(_indicator(
            "urgency", "Urgency manipulation", _severity_for(WEIGHTS["urgency"]),
            "The message pressures the reader to act quickly (e.g. \"" +
            urgency_hits[0] + "\"), a classic tactic to short-circuit careful thinking."
        ))

    threat_hits = _contains_any(lower, THREAT_WORDS)
    if threat_hits:
        indicators.append(_indicator(
            "threatening_language", "Threatening or fear-based language",
            _severity_for(WEIGHTS["threatening_language"]),
            "The message threatens a negative consequence (e.g. \"" +
            threat_hits[0] + "\") if the reader does not comply."
        ))

    cred_hits = _contains_any(lower, CREDENTIAL_WORDS)
    if cred_hits:
        indicators.append(_indicator(
            "credential_request", "Credential harvesting", _severity_for(WEIGHTS["credential_request"]),
            "The message asks the reader to verify credentials, passwords, "
            "or personal identifiers, something legitimate organizations "
            "rarely request by email or text."
        ))

    fin_hits = _contains_any(lower, FINANCIAL_WORDS)
    if fin_hits:
        indicators.append(_indicator(
            "financial_request", "Financial request", _severity_for(WEIGHTS["financial_request"]),
            "The message references payments, fees, refunds, or banking "
            "details (e.g. \"" + fin_hits[0] + "\")."
        ))

    reward_hits = _contains_any(lower, REWARD_WORDS)
    if reward_hits:
        indicators.append(_indicator(
            "reward_scam", "Fake reward or prize", _severity_for(WEIGHTS["reward_scam"]),
            "The message claims the reader has won a prize or reward, a "
            "common lure used in advance-fee scams."
        ))

    brand_hits = [b for b in IMPERSONATION_BRANDS if b in lower]
    if brand_hits:
        indicators.append(_indicator(
            "impersonation", f"Possible impersonation of {brand_hits[0].title()}",
            _severity_for(WEIGHTS["impersonation"]),
            f"The message claims to be from {brand_hits[0].title()} but this "
            "cannot be verified from the message content alone."
        ))

    # crude grammar/anomaly heuristic: excessive exclamation marks or ALL CAPS words
    exclamations = text.count("!") if text else 0
    caps_words = re.findall(r"\b[A-Z]{4,}\b", text or "")
    if exclamations >= 3 or len(caps_words) >= 3:
        indicators.append(_indicator(
            "grammar_anomalies", "Unusual formatting / tone",
            _severity_for(WEIGHTS["grammar_anomalies"]),
            "The message uses excessive capitalization or exclamation "
            "marks, a pattern common in mass-sent phishing and scam content."
        ))

    return indicators


def analyze_message(text: str):
    indicators = _text_indicators(text)
    urls = _find_urls(text)
    url_indicator_added = False
    worst_url_score = 0
    for u in urls[:3]:
        u_score, u_indicators, _ = analyze_url(u)
        worst_url_score = max(worst_url_score, u_score)
        if u_indicators and not url_indicator_added:
            indicators.append(_indicator(
                "suspicious_url", "Suspicious link included",
                _severity_for(WEIGHTS["suspicious_url"]),
                "The message includes a link that itself shows phishing "
                "characteristics when analyzed independently."
            ))
            url_indicator_added = True

    positives = []
    if not indicators:
        positives = ["No urgency language", "No credential request", "No suspicious links detected"]

    score = min(100, sum(i["weight"] for i in indicators))
    return score, indicators, positives


def analyze_email(sender: str, subject: str, body: str):
    combined_text = f"{subject}\n{body}"
    indicators = _text_indicators(combined_text)

    sender = (sender or "").strip().lower()
    domain = sender.split("@")[-1] if "@" in sender else ""

    if not sender:
        indicators.append(_indicator(
            "unknown_sender", "Unknown or missing sender",
            _severity_for(WEIGHTS["unknown_sender"]),
            "No sender address was provided, making it impossible to verify "
            "who actually sent this message."
        ))
    else:
        # free-mail domain claiming to be a well-known brand
        brand_hits = [b for b in IMPERSONATION_BRANDS if b in subject.lower() + " " + body.lower()]
        free_mail = any(domain.endswith(d) for d in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"])
        if brand_hits and free_mail:
            indicators.append(_indicator(
                "impersonation", f"Sender domain does not match claimed brand ({brand_hits[0].title()})",
                _severity_for(WEIGHTS["impersonation"]),
                f"The message claims to be from {brand_hits[0].title()} but was "
                f"sent from a free consumer email domain ({domain}), which "
                "legitimate corporate communications rarely use."
            ))

    urls = _find_urls(body)
    url_indicator_added = False
    for u in urls[:3]:
        _, u_indicators, _ = analyze_url(u)
        if u_indicators and not url_indicator_added:
            indicators.append(_indicator(
                "suspicious_url", "Suspicious link included",
                _severity_for(WEIGHTS["suspicious_url"]),
                "The email includes a link that itself shows phishing "
                "characteristics when analyzed independently."
            ))
            url_indicator_added = True

    # de-duplicate by id, keeping the highest-weight version
    dedup = {}
    for ind in indicators:
        if ind["id"] not in dedup or ind["weight"] > dedup[ind["id"]]["weight"]:
            dedup[ind["id"]] = ind
    indicators = list(dedup.values())

    positives = []
    if not indicators:
        positives = ["No urgency language", "No credential request", "Sender pattern looks normal"]

    score = min(100, sum(i["weight"] for i in indicators))
    return score, indicators, positives


def build_summary(classification: str, scan_type: str, indicators):
    if classification == "SAFE":
        return "No strong phishing indicators were detected."
    if classification == "LOW RISK":
        return "A small number of minor warning signs were found. Exercise normal caution."
    top = sorted(indicators, key=lambda i: -i["weight"])[:2]
    titles = " and ".join(i["title"].lower() for i in top) if top else "several warning signs"
    if classification == "SUSPICIOUS":
        return f"This {scan_type.lower()} shows signs of {titles}. Treat it with caution and verify independently."
    return f"Likely phishing attempt. Strong indicators of {titles} were detected."


def recommended_actions(classification: str, scan_type: str):
    if classification == "SAFE":
        return [
            "No immediate action required.",
            "Continue to verify unfamiliar senders before sharing information.",
        ]
    if classification == "LOW RISK":
        return [
            "Avoid clicking links until you confirm the sender independently.",
            "Do not share credentials or payment details.",
        ]
    actions = [
        "Do not click any links in this content.",
        "Do not provide credentials, passwords, or payment details.",
        "Verify the sender independently through an official channel.",
    ]
    if scan_type == "URL":
        actions.insert(0, "Do not visit this URL.")
    actions.append("Report the message to your organization's security team or email provider.")
    actions.append("Delete the suspicious content once reported.")
    return actions
