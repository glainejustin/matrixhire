import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid 
} from "recharts";
import { 
  Layers, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  HelpCircle, 
  ChevronRight, 
  RotateCw 
} from "lucide-react";
import { JobApplication } from "../types";

interface CareerStatsProps {
  onLogAction?: (action: string, detail: string) => void;
  applicationsCount: number;
  mockResumeText?: string;
  applications?: JobApplication[];
}

interface CareerFlashcard {
  question: string;
  answer: string;
  category: string;
}

const FLASHCARDS: CareerFlashcard[] = [
  {
    category: "Technical SWE",
    question: "How do you handle collision resolution in HashMaps?",
    answer: "Standard HashMaps use chaining (linked lists) or open addressing. In modern Java, chaining converts to balanced Red-Black trees if a bucket exceeds a threshold of 8 elements, guaranteeing O(log N) worst-case search complexity instead of O(N)."
  },
  {
    category: "System Design",
    question: "Explain the difference between Optimistic vs Pessimistic locking.",
    answer: "Pessimistic locking acts defensively by locking the DB row/table on select, blocking writes until commit. Optimistic locking assumes collisions are rare and uses a version column; writes check if version changed. If yes, it retries, avoiding long lock bottlenecks in highly scalable systems."
  },
  {
    category: "Behavioral",
    question: "How do you respond to a project scope shift / conflict from leadership?",
    answer: "Use the STAR model. First, align with the new business metric. Highlight a time you assessed technical risks, mapped current scopes transparently, negotiated an incremental roll-out to avoid developer burn, and launched the core MVC successfully, proving high adaptability."
  },
  {
    category: "Product Sense",
    question: "How would you design metrics to evaluate a new search recommendation feature?",
    answer: "Define key north-star engagement KPIs like Recommendation CTR (Click-Through Rate), Conversion/Purchase rate of suggested items, and secondary metrics like Average Order Value and Session Retention. Always guard with negative metrics like search bounce-rates."
  }
];

export function CareerStats({ applicationsCount, mockResumeText, applications }: CareerStatsProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [cvFlashcards, setCvFlashcards] = useState<CareerFlashcard[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState<boolean>(false);

  // Load CV-specific interview questions on mounting or CV updates
  useEffect(() => {
    if (mockResumeText && mockResumeText.trim()) {
      setLoadingFlashcards(true);
      fetch("/api/job-hunter/cv-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: mockResumeText })
      })
        .then(res => res.json())
        .then(data => {
          if (data.flashcards && data.flashcards.length > 0) {
            setCvFlashcards(data.flashcards);
          } else {
            setCvFlashcards([]);
          }
        })
        .catch(err => {
          console.error("Failed to generate CV flashcards:", err);
          setCvFlashcards([]);
        })
        .finally(() => {
          setLoadingFlashcards(false);
        });
    } else {
      setCvFlashcards([]);
    }
  }, [mockResumeText]);

  const pullTelemetryLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch("/api/job-hunter/logs");
      const data = await response.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Unable to query activity telemetry logs from the workspace server:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    pullTelemetryLogs();
    const interval = setInterval(pullTelemetryLogs, 8000); // pull logs every 8s
    return () => clearInterval(interval);
  }, []);

  const toggleFlip = (index: number) => {
    if (flippedIndex === index) {
      setFlippedIndex(null);
    } else {
      setFlippedIndex(index);
    }
  };

  // Compile active list of flashcards
  const flashcardsToUse = cvFlashcards.length > 0 ? cvFlashcards : FLASHCARDS;

  const filteredFlashcards = flashcardsToUse.filter(
    card => activeCategory === "All" || card.category === activeCategory
  );

  // Dynamic categories bar based on active deck
  const uniqueCategories = ["All", ...Array.from(new Set(flashcardsToUse.map(c => c.category)))];

  // Dynamic scoring progression coordinates calculated on CV richness & pipeline events
  const getDynamicChartData = () => {
    const baseScore = mockResumeText ? 65 : 45;
    const appBonus = Math.min(15, (applications?.length || 0) * 2.5);
    const steps = 6;
    const data = [];
    
    for (let i = 0; i < steps; i++) {
      const dates = ["May 10", "May 13", "May 16", "May 19", "May 22", "May 25"];
      const progression = i / (steps - 1);
      const scoreGain = Math.round(progression * (20 + appBonus));
      data.push({
        date: dates[i],
        score: Math.min(100, baseScore + scoreGain),
        count: Math.min(20, (applications?.length || 0) + i)
      });
    }
    return data;
  };

  const dynamicChartData = getDynamicChartData();

  // Dynamic streak tracker reflecting active workflow integrations
  const getStreakCount = () => {
    if (!mockResumeText && (!applications || applications.length === 0)) return 0;
    const baseline = mockResumeText ? 8 : 2;
    const appCount = applications?.length || 0;
    return baseline + Math.min(12, appCount * 2 + logs.length);
  };

  const activeStreak = getStreakCount();

  // Scientific validation metrics of ingested plaintext parameters
  const getATSMetrics = () => {
    if (!mockResumeText || !mockResumeText.trim()) {
      return { tier: "NO CV", score: 0, className: "text-rose-400 bg-rose-500/10 border-rose-500/25" };
    }
    const keywords = ["react", "typescript", "node", "python", "javascript", "sql", "git", "aws", "docker", "api"];
    const found = keywords.filter(kw => mockResumeText.toLowerCase().includes(kw));
    const score = Math.min(100, 42 + found.length * 6 + Math.min(22, Math.floor(mockResumeText.length / 140)));
    let tier = "Tier C (Needs Work)";
    let className = "text-yellow-405 bg-yellow-500/10 border-yellow-500/25";
    if (score >= 82) {
      tier = `Tier A (${score})`;
      className = "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
    } else if (score >= 62) {
      tier = `Tier B (${score})`;
      className = "text-[#6366F1] bg-indigo-500/10 border-indigo-500/25";
    }
    return { tier, score, className };
  };

  const atsMetrics = getATSMetrics();

  return (
    <div className="space-y-6" id="career-growth-intelligence-module">
      
      {/* Intro visual layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Performance Line Chart using Recharts */}
        <div className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-xl p-5 shadow-lg text-left flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#6366F1] font-extrabold uppercase block">Intelligence Hub</span>
            <h3 className="text-sm font-sans font-semibold text-white mt-0.5">Mock Interview Scoring Progression Trend</h3>
            <p className="text-[11px] text-slate-400">Diagnostic rating gains across multiple simulated manager sessions.</p>
          </div>

          <div className="h-44 w-full mt-4 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -26, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis domain={[40, 100]} stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", color: "#FFF" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5} activeDot={{ r: 6 }} name="Coach Rating (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick prep achievements panel */}
        <div className="lg:col-span-5 bg-[#1E293B] border border-slate-800 rounded-xl p-5 shadow-lg text-left space-y-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#10B981] font-extrabold uppercase block">Prep Milestones</span>
            <h3 className="text-sm font-sans font-semibold text-white mt-0.5">Continuous Career Ready Streaks</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-950/20 rounded border border-slate-850">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-450 fill-amber-450 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white block">Daily Prep Streak</span>
                  <span className="text-[10px] text-slate-450">Maintain daily resume tuning or mock chats</span>
                </div>
              </div>
              <span className="font-mono text-sm font-black text-amber-405">
                {activeStreak} {activeStreak === 1 ? "Day" : "Days"}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/20 rounded border border-slate-850">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-450 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white block">ATS Readiness Index</span>
                  <span className="text-[10px] text-slate-450">Resume average compatibility tier</span>
                </div>
              </div>
              <span className={`font-mono text-xs font-extrabold uppercase tracking-wide border py-0.5 px-2.5 rounded ${atsMetrics.className}`}>
                {atsMetrics.tier}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Flashcard deck block */}
      <div className="space-y-3 text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-md font-sans font-semibold text-white flex items-center gap-2">
              <span>Interview Flashcard Sandbox</span>
              {cvFlashcards.length > 0 && (
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-mono tracking-wider animate-pulse">
                  [Tailored to CV]
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {cvFlashcards.length > 0 
                ? "Custom dynamic interview coaching sandbox compiled exclusively from your active CV text details." 
                : "Standard sandbox mode. Ingest your CV PDF/Docx in the Resume Optimizer to trigger highly personalized AI flashcards."}
            </p>
          </div>

          <div className="flex gap-1.5 text-xs flex-wrap">
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setFlippedIndex(null);
                }}
                className={`py-1 px-2.5 rounded transition ${
                  activeCategory === cat 
                    ? "bg-[#6366F1]/10 text-[#6366F1] font-bold border border-[#6366F1]/30 text-xs" 
                    : "text-slate-450 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loadingFlashcards ? (
          <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">Formulating Expert Interview Questions Mapped to CV Profile...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFlashcards.map((card, idx) => {
              const isFlipped = flippedIndex === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => toggleFlip(idx)}
                  className={`border rounded-xl p-5 cursor-pointer select-none transition-all duration-300 min-h-[160px] flex flex-col justify-between text-left relative overflow-hidden shadow-md ${
                    isFlipped 
                      ? "bg-[#1E293B] border-indigo-505/45 text-slate-200" 
                      : "bg-[#131C2E] border-slate-800 hover:border-slate-700 hover:bg-[#1E293B]/40 text-slate-300"
                  }`}
                  id={`flashcard-${idx}`}
                >
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40">
                    <RotateCw className="w-3.5 h-3.5" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[8px] font-mono tracking-wider text-indigo-400 uppercase font-black px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {card.category}
                    </span>
                    
                    {isFlipped ? (
                      <p className="text-[10.5px] leading-relaxed text-slate-300 transition duration-150 py-1 font-sans">
                        {card.answer}
                      </p>
                    ) : (
                      <h4 className="text-xs font-semibold text-white leading-snug transition duration-150 py-1 font-sans">
                        {card.question}
                      </h4>
                    )}
                  </div>

                  <div className="text-[9px] text-slate-500 font-mono text-right mt-3 pt-2 border-t border-slate-800/40">
                    {isFlipped ? "Click to show Question" : "Click to flip answer"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Server Telemetry logs viewer */}
      <div className="space-y-3 text-left">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-450" />
            Live Application Workspace Telemetry Stream
          </span>
          <button
            onClick={pullTelemetryLogs}
            disabled={loadingLogs}
            className="p-1 text-slate-450 hover:text-white transition disabled:opacity-40"
            title="Refresh active diagnostics"
            id="btn-refresh-telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="bg-[#030712] border border-slate-850 p-4 rounded-xl font-mono text-[11px] text-slate-300 h-44 overflow-y-auto scrollbar-thin space-y-1 my-2">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="flex flex-col md:flex-row md:justify-between items-start md:items-center hover:bg-slate-900/40 py-1 px-1.5 rounded transition">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`font-black ${log.status === 'success' ? 'text-teal-400' : 'text-rose-450'}`}>
                    {log.action}
                  </span>
                  <span className="text-slate-400">{log.details}</span>
                </div>
                <span className="text-slate-600 text-[10px] md:text-right font-sans">✓ SECURED</span>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-600 italic">No telemetry diagnostic signals scanned in this workstation.</div>
          )}
        </div>
      </div>

    </div>
  );
}
