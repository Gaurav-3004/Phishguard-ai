import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";

const STAGES = ["SCANNING INPUT...", "ANALYZING INDICATORS...", "GENERATING THREAT REPORT..."];

export default function ScanningLoader() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card relative flex flex-col items-center justify-center overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-signal/10 to-transparent" />
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-signal/30 bg-signal/5 animate-pulseRing">
          <ScanLine className="h-8 w-8 text-signal" />
        </div>
      </div>
      <p className="mt-6 font-mono text-sm tracking-wide text-signal">{STAGES[stage]}</p>
      <div className="mt-4 h-1 w-56 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full bg-signal transition-all duration-700 ease-out"
          style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
