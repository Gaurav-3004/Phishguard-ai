import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-ink-800/60">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-signal" />
              <span className="font-display font-semibold text-mist">PhishGuard AI</span>
            </div>
            <p className="mt-2 text-sm text-mist-muted">Detect. Understand. Defend.</p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Link to="/analyze" className="text-mist-muted hover:text-mist">Analyze</Link>
            <Link to="/simulator" className="text-mist-muted hover:text-mist">Simulator</Link>
            <Link to="/dashboard" className="text-mist-muted hover:text-mist">Dashboard</Link>
            <Link to="/learn" className="text-mist-muted hover:text-mist">Learn</Link>
            <Link to="/about" className="text-mist-muted hover:text-mist">Privacy</Link>
            <Link to="/about" className="text-mist-muted hover:text-mist">About</Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-6 text-xs text-mist-faint">
          Built for defensive cybersecurity education.
        </div>
      </div>
    </footer>
  );
}
