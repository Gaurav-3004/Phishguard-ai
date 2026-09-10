import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { LEARN_TOPICS } from "../data/learnTopics";

export default function Learn() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = LEARN_TOPICS.find((t) => t.id === openId) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-mist sm:text-3xl">Learn</h1>
      <p className="mt-2 max-w-xl text-sm text-mist-muted">
        Beginner-friendly guides on phishing, social engineering, and everyday security habits.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEARN_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setOpenId(topic.id)}
            className="glass-card glass-card-hover flex flex-col items-start gap-3 p-5 text-left"
          >
            <BookOpen className="h-5 w-5 text-signal" />
            <p className="font-display text-base font-medium text-mist">{topic.title}</p>
            <p className="text-sm text-mist-muted">{topic.summary}</p>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => setOpenId(null)}
        >
          <div
            className="glass-card max-h-[80vh] w-full max-w-lg overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-xl font-semibold text-mist">{open.title}</h2>
              <button onClick={() => setOpenId(null)} className="text-mist-muted hover:text-mist" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {open.content.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-mist-muted">{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
