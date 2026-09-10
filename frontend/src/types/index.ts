export type Classification = "SAFE" | "LOW RISK" | "SUSPICIOUS" | "HIGH RISK";
export type ScanType = "URL" | "EMAIL" | "MESSAGE";
export type Severity = "low" | "medium" | "high";

export interface Indicator {
  id: string;
  title: string;
  severity: Severity;
  explanation: string;
  weight: number;
}

export interface AnalysisResult {
  id: number;
  scan_type: ScanType;
  risk_score: number;
  classification: Classification;
  summary: string;
  indicators: Indicator[];
  positive_indicators: string[];
  recommended_actions: string[];
  ai_used: boolean;
  ai_note: string | null;
  confidence: number;
}

export interface HistoryItem {
  id: number;
  created_at: string;
  scan_type: ScanType;
  input_preview: string;
  risk_score: number;
  classification: Classification;
  summary: string;
  indicators: Indicator[];
  recommended_actions: string[];
  ai_used: boolean;
  confidence: number;
}

export interface DashboardStats {
  total_scans: number;
  threats_detected: number;
  safe_messages: number;
  average_risk_score: number;
  distribution: Record<Classification, number>;
  trend: { date: string; score: number }[];
  simulator: {
    questions_completed: number;
    correct: number;
    accuracy: number;
    cyber_awareness_score: number;
  };
}

export interface SimulatorOption {
  id: string;
  text: string;
}

export interface SimulatorQuestion {
  id: string;
  category: string;
  sender: string;
  subject: string;
  body: string;
  options: SimulatorOption[];
}

export interface SimulatorAnswerResult {
  correct: boolean;
  correct_option: string;
  explanation: string;
  points: number;
}
