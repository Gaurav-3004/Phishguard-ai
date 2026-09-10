import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Gamepad2, RotateCcw } from "lucide-react";
import { api, ApiError } from "../services/api";
import type { SimulatorAnswerResult, SimulatorQuestion } from "../types";

export default function Simulator() {
  const [questions, setQuestions] = useState<SimulatorQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SimulatorAnswerResult | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    api.getSimulatorQuestions()
      .then(setQuestions)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load the simulator."));
  }, []);

  const current = questions?.[index];
  const accuracy = answered > 0 ? Math.round(((score / 100) / answered) * 100) : 0;

  async function submit(optionId: string) {
    if (!current || selected) return;
    setSelected(optionId);
    try {
      const result = await api.submitSimulatorAnswer(current.id, optionId);
      setFeedback(result);
      setScore((s) => s + result.points);
      setAnswered((a) => a + 1);
    } catch {
      setError("Could not submit your answer. Please try again.");
      setSelected(null);
    }
  }

  function next() {
    if (!questions) return;
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setFeedback(null);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setFeedback(null);
    setScore(0);
    setAnswered(0);
    setFinished(false);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center lg:px-8">
        <p className="text-sm text-alert">{error}</p>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center lg:px-8">
        <p className="text-sm text-mist-muted">Loading scenarios…</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center lg:px-8">
        <Gamepad2 className="mx-auto h-10 w-10 text-signal" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-mist">CYBER AWARENESS SCORE</h1>
        <p className="mt-4 font-display text-5xl font-semibold text-signal">{score} / {questions.length * 100}</p>
        <p className="mt-3 text-sm text-mist-muted">
          {answered} scenarios completed · {accuracy}% accuracy
        </p>
        <button onClick={restart} className="btn-primary mt-8">
          <RotateCcw className="h-4 w-4" /> Play Again
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-mist">Can You Spot the Phish?</h1>
        <span className="label-tag">{index + 1} / {questions.length}</span>
      </div>

      <div className="mt-5 flex items-center gap-6 text-sm">
        <span className="text-mist-muted">Score: <span className="font-mono text-mist">{score}</span></span>
        <span className="text-mist-muted">Accuracy: <span className="font-mono text-mist">{accuracy}%</span></span>
      </div>

      <div className="glass-card mt-6 overflow-hidden">
        <div className="border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
          <span className="label-tag">{current.category.toUpperCase()}</span>
        </div>
        <div className="p-5">
          <p className="text-xs text-mist-faint">From: {current.sender}</p>
          <p className="mt-2 font-medium text-mist">{current.subject}</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-mist-muted">{current.body}</p>
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-mist">What would you do?</p>
      <div className="mt-3 flex flex-col gap-2.5">
        {current.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrectOpt = feedback && opt.id === feedback.correct_option;
          const showState = !!feedback;
          return (
            <button
              key={opt.id}
              disabled={!!selected}
              onClick={() => submit(opt.id)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                showState && isCorrectOpt
                  ? "border-safe/40 bg-safe/10 text-mist"
                  : showState && isSelected
                  ? "border-alert/40 bg-alert/10 text-mist"
                  : "border-white/10 bg-white/[0.02] text-mist hover:border-signal/30"
              }`}
            >
              {opt.text}
              {showState && isCorrectOpt && <CheckCircle2 className="h-4 w-4 shrink-0 text-safe" />}
              {showState && isSelected && !isCorrectOpt && <XCircle className="h-4 w-4 shrink-0 text-alert" />}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="glass-card mt-5 p-5">
          <p className={`font-display text-lg font-semibold ${feedback.correct ? "text-safe" : "text-alert"}`}>
            {feedback.correct ? "CORRECT" : "INCORRECT"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-mist-muted">{feedback.explanation}</p>
          <button onClick={next} className="btn-primary mt-5">
            {index + 1 >= questions.length ? "See Final Score" : "Next Scenario"}
          </button>
        </div>
      )}
    </div>
  );
}
