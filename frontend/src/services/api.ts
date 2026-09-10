import type {
  AnalysisResult,
  DashboardStats,
  HistoryItem,
  SimulatorAnswerResult,
  SimulatorQuestion,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError(
      "Analysis service is temporarily unavailable. Local detection is still available.",
      0
    );
  }

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      // no JSON body — keep default message
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export const api = {
  analyzeUrl: (url: string) =>
    request<AnalysisResult>("/api/analyze/url", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),

  analyzeEmail: (sender: string, subject: string, content: string) =>
    request<AnalysisResult>("/api/analyze/email", {
      method: "POST",
      body: JSON.stringify({ sender, subject, content }),
    }),

  analyzeMessage: (text: string) =>
    request<AnalysisResult>("/api/analyze/message", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  getHistory: () => request<HistoryItem[]>("/api/history"),

  getHistoryItem: (id: number) => request<HistoryItem>(`/api/history/${id}`),

  deleteHistoryItem: (id: number) =>
    request<{ deleted: boolean }>(`/api/history/${id}`, { method: "DELETE" }),

  clearHistory: () => request<{ cleared: boolean }>("/api/history", { method: "DELETE" }),

  getDashboard: () => request<DashboardStats>("/api/dashboard"),

  getSimulatorQuestions: () => request<SimulatorQuestion[]>("/api/simulator/questions"),

  submitSimulatorAnswer: (questionId: string, selectedOption: string) =>
    request<SimulatorAnswerResult>("/api/simulator/answer", {
      method: "POST",
      body: JSON.stringify({ question_id: questionId, selected_option: selectedOption }),
    }),

  health: () => request<{ status: string; ai_configured: boolean }>("/api/health"),
};
