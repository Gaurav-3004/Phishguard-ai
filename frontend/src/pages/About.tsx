import { ArrowDown, ShieldCheck } from "lucide-react";

const FLOW = ["INPUT", "ANALYSIS ENGINE", "AI EXPLANATION", "RISK SCORE", "RECOMMENDED ACTION"];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 lg:px-8">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="h-6 w-6 text-signal" />
        <h1 className="font-display text-2xl font-semibold text-mist sm:text-3xl">About PhishGuard AI</h1>
      </div>

      <div className="glass-card mt-8 p-6">
        <h2 className="label-tag">WHAT IS PHISHGUARD AI?</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist-muted">
          PhishGuard AI is a lightweight security-analysis and awareness platform that helps
          people recognize phishing attempts in URLs, emails, and messages before they cause
          harm. It combines a deterministic rule-based detection engine with an optional AI
          explanation layer, so every result comes with a clear, understandable reason.
        </p>
      </div>

      <div className="glass-card mt-6 p-6">
        <h2 className="label-tag">WHY PHISHING IS DANGEROUS</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist-muted">
          Phishing remains one of the most common ways attackers steal credentials, commit
          fraud, and gain a foothold inside organizations. It works by exploiting trust and
          urgency rather than technical vulnerabilities, which means anyone can be targeted
          regardless of how secure their systems are.
        </p>
      </div>

      <div className="glass-card mt-6 p-6">
        <h2 className="label-tag mb-5">HOW THE PLATFORM WORKS</h2>
        <div className="flex flex-col items-center gap-2">
          {FLOW.map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <span className="rounded-lg border border-signal/30 bg-signal/10 px-4 py-2 font-mono text-xs text-signal">
                {step}
              </span>
              {i < FLOW.length - 1 && <ArrowDown className="h-4 w-4 text-mist-faint" />}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-caution/20 bg-caution/[0.06] p-5">
        <p className="text-sm leading-relaxed text-mist-muted">
          PhishGuard AI is an educational and defensive security tool. Detection results are
          probabilistic and should not replace professional security investigation.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-sm leading-relaxed text-mist-muted">
          Privacy: we analyze submitted content for security indicators. Avoid submitting
          passwords, private credentials, or confidential information. We store only a short,
          non-sensitive preview of submitted content in your scan history — never full email
          bodies, passwords, or payment details.
        </p>
      </div>
    </div>
  );
}
