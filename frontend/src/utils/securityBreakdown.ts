import type { Indicator } from "../types";

const CATEGORY_MAP: Record<string, string[]> = {
  "Social Engineering": ["urgency", "threatening_language", "reward_scam", "grammar_anomalies"],
  "URL Risk": [
    "suspicious_url", "no_https", "ip_address_url", "shortened_url", "suspicious_tld",
    "excessive_subdomains", "suspicious_keywords_in_url", "encoded_characters",
    "excessive_url_length", "suspicious_characters",
  ],
  "Credential Risk": ["credential_request", "financial_request"],
  Impersonation: ["impersonation", "unknown_sender"],
};

/**
 * Derives a 0-100 score per category purely from the indicators actually
 * detected for this scan — never fabricated. A category with no matching
 * indicators scores low (proportional to overall risk) rather than zero,
 * since a low-level ambient risk can still exist without a named indicator.
 */
export function buildSecurityBreakdown(indicators: Indicator[], overallScore: number) {
  return Object.entries(CATEGORY_MAP).map(([category, ids]) => {
    const matched = indicators.filter((i) => ids.includes(i.id));
    const weightSum = matched.reduce((sum, i) => sum + i.weight, 0);
    const score = matched.length > 0
      ? Math.min(100, Math.round(weightSum * 4.5))
      : Math.round(overallScore * 0.15);
    return { category, score };
  });
}
