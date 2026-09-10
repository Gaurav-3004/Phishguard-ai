import { useEffect, useState } from "react";
import type { Classification } from "../types";

const COLOR: Record<Classification, string> = {
  SAFE: "#3DDC97",
  "LOW RISK": "#FFB454",
  SUSPICIOUS: "#FFB454",
  "HIGH RISK": "#FF5D73",
};

export default function RiskScoreGauge({
  score,
  classification,
}: {
  score: number;
  classification: Classification;
}) {
  const [display, setDisplay] = useState(0);
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const color = COLOR[classification];

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const offset = circumference - (display / 100) * circumference;

  return (
    <div className="relative flex h-52 w-52 items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-5xl font-semibold text-mist">{display}</span>
        <span className="font-mono text-xs text-mist-muted">/ 100</span>
      </div>
    </div>
  );
}
