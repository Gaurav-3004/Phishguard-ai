import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link2, Mail, MessageSquare, ScanLine, Sparkles } from "lucide-react";
import { api, ApiError } from "../services/api";
import ScanningLoader from "../components/ScanningLoader";
import { useToast } from "../components/Toast";
import { DEMO_EMAIL, DEMO_URL, DEMO_MESSAGE } from "../data/demoSamples";
import type { AnalysisResult } from "../types";

type Tab = "URL" | "EMAIL" | "MESSAGE";

export default function Analyze() {
  const [tab, setTab] = useState<Tab>("URL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState("");
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { show } = useToast();
  const [params] = useSearchParams();

  useEffect(() => {
    if (params.get("demo") === "1") {
      loadDemo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadDemo() {
    setTab("EMAIL");
    setSender(DEMO_EMAIL.sender);
    setSubject(DEMO_EMAIL.subject);
    setEmailBody(DEMO_EMAIL.content);
    setUrl(DEMO_URL);
    setMessage(DEMO_MESSAGE);
  }

  async function runScan(type: Tab) {
    setError(null);
    if (type === "URL" && !url.trim()) return setError("Please enter a valid URL.");
    if (type === "EMAIL" && !sender.trim() && !subject.trim() && !emailBody.trim())
      return setError("Please enter content to analyze.");
    if (type === "MESSAGE" && !message.trim()) return setError("Please enter content to analyze.");

    setLoading(true);
    try {
      let result: AnalysisResult;
      const minDelay = new Promise((r) => setTimeout(r, 1900)); // let the scanning animation play out
      const call =
        type === "URL"
          ? api.analyzeUrl(url.trim())
          : type === "EMAIL"
          ? api.analyzeEmail(sender.trim(), subject.trim(), emailBody.trim())
          : api.analyzeMessage(message.trim());

      [result] = await Promise.all([call, minDelay]);
      navigate("/results", { state: result });
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Analysis service is temporarily unavailable. Local detection is still available.";
      setError(message);
      show(message, "error");
    } finally {
      setLoading(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof Link2 }[] = [
    { id: "URL", label: "URL", icon: Link2 },
    { id: "EMAIL", label: "EMAIL", icon: Mail },
    { id: "MESSAGE", label: "MESSAGE", icon: MessageSquare },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-mist sm:text-3xl">
          Analyze a suspicious message
        </h1>
        <button onClick={loadDemo} className="btn-secondary shrink-0 !px-4 !py-2 text-xs">
          <Sparkles className="h-3.5 w-3.5" /> Try Demo
        </button>
      </div>
      <p className="mt-2 text-sm text-mist-muted">
        We analyze submitted content for security indicators. Avoid submitting passwords,
        private credentials or confidential information.
      </p>

      {loading ? (
        <div className="mt-8">
          <ScanningLoader />
        </div>
      ) : (
        <>
          <div className="mt-8 inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setError(null);
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  tab === t.id ? "bg-signal text-ink" : "text-mist-muted hover:text-mist"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>

          <div className="glass-card mt-6 p-6">
            {tab === "URL" && (
              <div>
                <label className="label-tag">Paste suspicious URL</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/login"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-ink-600/60 px-4 py-3 font-mono text-sm text-mist placeholder:text-mist-faint focus:border-signal/50"
                />
                <button onClick={() => runScan("URL")} className="btn-primary mt-5 w-full sm:w-auto">
                  <ScanLine className="h-4 w-4" /> Scan URL
                </button>
              </div>
            )}

            {tab === "EMAIL" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="label-tag">Sender</label>
                  <input
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="security-alert@example.com"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-ink-600/60 px-4 py-3 text-sm text-mist placeholder:text-mist-faint focus:border-signal/50"
                  />
                </div>
                <div>
                  <label className="label-tag">Subject</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Your account requires verification"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-ink-600/60 px-4 py-3 text-sm text-mist placeholder:text-mist-faint focus:border-signal/50"
                  />
                </div>
                <div>
                  <label className="label-tag">Email Content</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={6}
                    placeholder="Paste the full email body..."
                    className="mt-2 w-full rounded-lg border border-white/10 bg-ink-600/60 px-4 py-3 text-sm text-mist placeholder:text-mist-faint focus:border-signal/50"
                  />
                </div>
                <button onClick={() => runScan("EMAIL")} className="btn-primary w-full sm:w-auto">
                  <ScanLine className="h-4 w-4" /> Analyze Email
                </button>
              </div>
            )}

            {tab === "MESSAGE" && (
              <div>
                <label className="label-tag">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Paste SMS, WhatsApp, Telegram or social media message..."
                  className="mt-2 w-full rounded-lg border border-white/10 bg-ink-600/60 px-4 py-3 text-sm text-mist placeholder:text-mist-faint focus:border-signal/50"
                />
                <button onClick={() => runScan("MESSAGE")} className="btn-primary mt-5 w-full sm:w-auto">
                  <ScanLine className="h-4 w-4" /> Analyze Message
                </button>
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-alert">{error}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
