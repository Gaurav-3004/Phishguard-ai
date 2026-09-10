import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { ScanLine, ShieldAlert, ShieldCheck, Gauge, LayoutDashboard, Gamepad2 } from "lucide-react";
import { api, ApiError } from "../services/api";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import type { DashboardStats } from "../types";

const DIST_COLORS: Record<string, string> = {
  SAFE: "#3DDC97",
  "LOW RISK": "#FFB454",
  SUSPICIOUS: "#FF9A52",
  "HIGH RISK": "#FF5D73",
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDashboard()
      .then(setStats)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load dashboard."));
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <p className="text-sm text-alert">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <p className="text-sm text-mist-muted">Loading dashboard…</p>
      </div>
    );
  }

  if (stats.total_scans === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <EmptyState
          icon={LayoutDashboard}
          title="No scans yet"
          description="Analyze your first threat to generate security insights."
          actionLabel="Analyze content"
          actionTo="/analyze"
        />
      </div>
    );
  }

  const distData = Object.entries(stats.distribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-mist sm:text-3xl">Security Dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ScanLine} label="Total Scans" value={stats.total_scans} />
        <StatCard icon={ShieldAlert} label="Threats Detected" value={stats.threats_detected} accent="text-alert" />
        <StatCard icon={ShieldCheck} label="Safe Messages" value={stats.safe_messages} accent="text-safe" />
        <StatCard icon={Gauge} label="Average Risk Score" value={stats.average_risk_score} accent="text-caution" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="label-tag mb-4">THREAT DISTRIBUTION</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {distData.map((d, i) => (
                  <Cell key={i} fill={DIST_COLORS[d.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#111826", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            {distData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-mist-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: DIST_COLORS[d.name] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="label-tag mb-4">RISK TREND OVER TIME</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.trend.map((t, i) => ({ ...t, i }))}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="i" tick={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#7C8A9E", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: "#111826", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#00D9B5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card mt-6 p-6">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4 text-signal" />
          <h2 className="label-tag">SIMULATOR PERFORMANCE</h2>
        </div>
        {stats.simulator.questions_completed === 0 ? (
          <p className="mt-4 text-sm text-mist-muted">
            You haven't tried the Phishing Simulator yet. Head over and test your awareness.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center sm:max-w-md">
            <div>
              <p className="font-display text-2xl font-semibold text-mist">{stats.simulator.questions_completed}</p>
              <p className="text-xs text-mist-muted">Completed</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-mist">{stats.simulator.accuracy}%</p>
              <p className="text-xs text-mist-muted">Accuracy</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-signal">{stats.simulator.cyber_awareness_score}</p>
              <p className="text-xs text-mist-muted">Awareness Score</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
