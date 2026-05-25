export interface JobListing {
  id: string;
  title: string;
  category: "Software Engineering" | "Product Management" | "Data Science" | "Design" | "Marketing" | "Finance";
  company: string;
  logoUrl?: string;
  location: string;
  salaryRange: string;
  postedDate: string;
  description: string;
  requirements: string[];
  type: "Full-Time" | "Remote" | "Contract" | "Hybrid";
  matchScore?: number; // Calculated dynamically or seeded
  sourceUrl?: string; // Live job link
  isLiveScraped?: boolean; // Scraped from web marker
  isRobustLocalBackup?: boolean; // Robust live-generated simulated backup marker
}

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  stage: "wishlist" | "applied" | "interviewing" | "offer" | "archived";
  location: string;
  salary?: string;
  appliedDate?: string;
  notes?: string;
  contactPerson?: string;
  contactEmail?: string;
}

export interface ResumeProfile {
  text: string;
  skills: string[];
  fullName?: string;
  email?: string;
  phone?: string;
  experience?: string[];
  education?: string[];
}

export interface ATSAnalysisResult {
  score: number; // matched percentage
  matches: string[]; // matched keywords
  missing: string[]; // missing keywords
  atsAnalysis: string;
  suggestedBulletPoints: { original: string; improved: string; reason: string }[];
}

export interface MockInterviewMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

export interface InterviewEvaluation {
  score: number;
  goodPoints: string[];
  weakAreas: string[];
  suggestedAnswer: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  messages: MockInterviewMessage[];
  evaluations: Record<string, InterviewEvaluation>; // maps messageId -> evaluation
  isCompleted: boolean;
  score?: number;
}
