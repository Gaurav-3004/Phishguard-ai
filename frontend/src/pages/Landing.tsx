import { Link } from "react-router-dom";
import { ArrowRight, ClipboardPaste, SearchCode, ShieldCheck, ScanLine } from "lucide-react";

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <span className="label-tag inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
              <ScanLine className="h-3.5 w-3.5 text-signal" /> AI-assisted threat analysis
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-mist sm:text-5xl lg:text-[3.4rem]">
              Detect phishing before phishing detects you.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-mist-muted">
              Analyze suspicious URLs, emails and messages using intelligent threat
              detection, and understand exactly why something is dangerous.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/analyze" className="btn-primary">
                Analyze Threat <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/simulator" className="btn-secondary">
                Try Simulator
              </Link>
            </div>
            <p className="mt-8 text-sm text-mist-faint">Built for safer digital interactions.</p>
          </div>

          <div className="relative">
            <div className="glass-card relative overflow-hidden p-6 shadow-glow-alert">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 animate-scan bg-gradient-to-b from-alert/10 via-transparent to-transparent" />
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <span className="label-tag">THREAT DETECTION</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-alert/30 bg-alert/10 px-2.5 py-1 font-mono text-[11px] text-alert">
                  ACTION REQUIRED
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="label-tag">Threat Level</p>
                  <p className="mt-1.5 font-display text-xl font-semibold text-alert">HIGH</p>
                </div>
                <div>
                  <p className="label-tag">Indicators Detected</p>
                  <p className="mt-1.5 font-display text-xl font-semibold text-mist">04</p>
                </div>
                <div className="col-span-2">
                  <p className="label-tag">Phishing Probability</p>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="font-display text-5xl font-semibold text-alert">94%</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[94%] rounded-full bg-alert" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo section */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-mist sm:text-3xl">
          See PhishGuard AI in action
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { n: "01", title: "Paste", desc: "Paste suspicious content.", icon: ClipboardPaste },
            { n: "02", title: "Analyze", desc: "Our detection engine identifies suspicious indicators.", icon: SearchCode },
            { n: "03", title: "Defend", desc: "Get clear actions to stay safe.", icon: ShieldCheck },
          ].map((step) => (
            <div key={step.n} className="glass-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-mist-faint">{step.n}</span>
                <step.icon className="h-5 w-5 text-signal" />
              </div>
              <p className="mt-4 font-display text-lg font-medium text-mist">{step.title}</p>
              <p className="mt-1.5 text-sm text-mist-muted">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link to="/analyze?demo=1" className="btn-secondary">
            Try Demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
