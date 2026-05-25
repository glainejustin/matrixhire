import { useState, useEffect } from "react";
import { 
  Sparkles, 
  FileText, 
  Layers, 
  Award, 
  Briefcase, 
  Cpu, 
  TrendingUp, 
  Terminal, 
  Search,
  CheckCircle,
  FileCheck,
  Compass
} from "lucide-react";

import { JobApplication } from "./types";
import { ResumeOptimizer } from "./components/ResumeOptimizer";
import { OutreachWriter } from "./components/OutreachWriter";
import { MockInterview } from "./components/MockInterview";
import { PipelineTracker } from "./components/PipelineTracker";
import { JobBoard } from "./components/JobBoard";
import { CareerStats } from "./components/CareerStats";
import { MatrixRain } from "./components/MatrixRain";
import { MatrixTypewriter } from "./components/MatrixTypewriter";
import { MenuMatrixRain } from "./components/MenuMatrixRain";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "jobs" | "optimize" | "outreach" | "interview" | "pipeline" | "stats"
  >("interview");

  // Local storage synchronized mock resume state (cleared of preset dummy examples)
  const [mockResumeText, setMockResumeText] = useState<string>(() => {
    const cached = localStorage.getItem("job_hunter_resume");
    return cached || "";
  });

  // Centralized jobDescription (Job Advert) state across system
  const [jobDescription, setJobDescription] = useState<string>(() => {
    return sessionStorage.getItem("job_hunter_selected_jd") || "";
  });

  // Local storage synchronized applications pipeline state
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const cached = localStorage.getItem("job_hunter_applications");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error("Failed parsing pipeline cache data:", err);
      }
    }
    return [
      { 
        id: "app-default-1", 
        title: "Senior Full Stack Dev (TypeScript/Node)", 
        company: "Stripe", 
        stage: "wishlist", 
        location: "San Francisco, CA (Hybrid)", 
        salary: "$165,000 - $195,000", 
        notes: "Suggested match rating 90%. Resume matched, preparing LinkedIn reachout." 
      },
      { 
        id: "app-default-2", 
        title: "Lead AI Research Scientist", 
        company: "DeepMind", 
        stage: "applied", 
        location: "London, UK (Full-Time)", 
        salary: "£140,000 - £170,000", 
        notes: "ATS scan completed, cover letter updated and submitted via portal." 
      },
      { 
        id: "app-default-3", 
        title: "Senior Product Manager - Core Platform", 
        company: "Airbnb", 
        stage: "interviewing", 
        location: "Remote (US/Canada)", 
        salary: "$150,050 - $180,000", 
        notes: "Mock Technical PM screen completed. Diagnostic score of 88/100 received from Coach!" 
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("job_hunter_resume", mockResumeText);
  }, [mockResumeText]);

  useEffect(() => {
    localStorage.setItem("job_hunter_applications", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    sessionStorage.setItem("job_hunter_selected_jd", jobDescription);
  }, [jobDescription]);

  // Global action utility to sync newly matched job listings directly into candidate pipeline tracker
  const handleAddApplication = (newApp: JobApplication) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  // Switch tab directly to optimizer while populating target job description
  const handleTransitToOptimization = (jobDesc: string) => {
    setJobDescription(jobDesc);
    setActiveTab("optimize");
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-250 flex flex-col font-mono selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden" id="studio-mainframe">
      {/* Immersive digital backdrop rain */}
      <MatrixRain opacity={0.12} />
      
      {/* Scanline atmospheric mesh overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:24px_24px] z-10"></div>
      
      {/* Top Matrix Systems Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-emerald-500/20 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg shadow-emerald-950/20 relative z-20" id="console-header">
        <div className="flex items-center gap-4 text-left">
          <div className="w-11 h-11 bg-emerald-950/60 rounded border-2 border-emerald-500/50 flex flex-col items-center justify-center font-black text-emerald-400 text-lg uppercase tracking-widest shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">
            [M]
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest text-white flex items-center gap-2">
              <span className="text-emerald-400 font-black">MATRIX</span> HIRE
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 tracking-widest font-bold px-2 py-0.5 rounded leading-none select-none uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                v2.0_MAIN
              </span>
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono tracking-wide h-4 flex items-center">
              <MatrixTypewriter text="Neural Network Recruitment Interface • Decryption Mode Online" delay={50} />
            </p>
          </div>
        </div>

        {/* System telemetry status row */}
        <div className="flex flex-wrap gap-3 items-center text-[10px] font-mono select-none" id="header-telemetry">
          <div className="bg-emerald-950/40 border-2 border-emerald-500/30 px-3 py-1.5 rounded flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute shrink-0"></span>
            <span className="text-emerald-400 font-bold uppercase tracking-widest">NEURAL_LINK: ACTIVE</span>
          </div>

          <div className="bg-slate-950 border border-emerald-500/20 px-3 py-1.5 rounded flex items-center gap-2 text-slate-300 shadow">
            <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-500/60 font-bold">MONITOR:</span>
            <span className="text-emerald-300 font-bold">{applications.length} THREADS_LOADED</span>
          </div>
        </div>
      </header>

      {/* Main Console Split Area */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-20" id="workspace-splitter">
        
        {/* Sidebar Navigation - Rethemed in cyber digital emerald */}
        <nav className="w-full lg:w-64 bg-slate-950/90 lg:border-r border-emerald-500/10 p-4 shrink-0" id="sidebar-navigator">
          <div className="space-y-6">
            
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest font-black uppercase text-emerald-500/60 block px-3 py-1.5 text-left border-b border-emerald-500/10 mb-2">
                // SYSTEM CORE
              </span>
              {[
                { id: "jobs", label: "Semantic Job Deck", icon: Compass, desc: "Explore matching roles" },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-start gap-3 border relative overflow-hidden z-0 ${
                      isSelected
                        ? "bg-slate-950 text-emerald-300 border-emerald-500/50 shadow-[inset_0_0_10px_rgba(16,185,129,0.15)] font-bold text-white"
                        : "text-slate-400 border-transparent hover:bg-[#10b981]/05 hover:text-emerald-400"
                    }`}
                    id={`nav-tab-${tab.id}`}
                  >
                    {isSelected && <MenuMatrixRain opacity={0.18} />}
                    <div className="relative z-10 flex items-start gap-3 w-full">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" : "text-emerald-600"}`} />
                      <div className="text-left font-mono">
                        <span className="block text-xs uppercase tracking-wider">{tab.label}</span>
                        <span className="text-[9px] text-zinc-500 font-normal leading-none block mt-0.5">{tab.desc}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest font-black uppercase text-emerald-500/60 block px-3 py-1.5 text-left border-b border-emerald-500/10 mb-2">
                // DECRYPT & RECON
              </span>
              {[
                { id: "optimize", label: "ATS Resume Optimizer", icon: Cpu, desc: "Drop files & check score" },
                { id: "outreach", label: "AI Outreach Composer", icon: FileText, desc: "Infiltration materials" },
                { id: "interview", label: "Interactive Mock Coach", icon: Award, desc: "Meet Sentinel Recruiters" },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-start gap-3 border relative overflow-hidden z-0 ${
                      isSelected
                        ? "bg-slate-950 text-emerald-300 border-emerald-500/50 shadow-[inset_0_0_10px_rgba(16,185,129,0.15)] font-bold text-white"
                        : "text-slate-400 border-transparent hover:bg-[#10b981]/05 hover:text-emerald-400"
                    }`}
                    id={`nav-tab-${tab.id}`}
                  >
                    {isSelected && <MenuMatrixRain opacity={0.18} />}
                    <div className="relative z-10 flex items-start gap-3 w-full">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" : "text-emerald-600"}`} />
                      <div className="text-left font-mono">
                        <span className="block text-xs uppercase tracking-wider">{tab.label}</span>
                        <span className="text-[9px] text-zinc-500 font-normal leading-none block mt-0.5">{tab.desc}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest font-black uppercase text-emerald-500/60 block px-3 py-1.5 text-left border-b border-emerald-500/10 mb-2">
                // TRAJECTORY ANALYTICS
              </span>
              {[
                { id: "pipeline", label: "Pipeline Kanban Board", icon: Layers, desc: "Active threads tracking" },
                { id: "stats", label: "Growth Hub & Telemetry", icon: TrendingUp, desc: "Synchronized parameters" },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-start gap-3 border relative overflow-hidden z-0 ${
                      isSelected
                        ? "bg-slate-950 text-emerald-300 border-emerald-500/50 shadow-[inset_0_0_10px_rgba(16,185,129,0.15)] font-bold text-white"
                        : "text-slate-400 border-transparent hover:bg-[#10b981]/05 hover:text-emerald-400"
                    }`}
                    id={`nav-tab-${tab.id}`}
                  >
                    {isSelected && <MenuMatrixRain opacity={0.18} />}
                    <div className="relative z-10 flex items-start gap-3 w-full">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" : "text-emerald-600"}`} />
                      <div className="text-left font-mono">
                        <span className="block text-xs uppercase tracking-wider">{tab.label}</span>
                        <span className="text-[9px] text-zinc-500 font-normal leading-none block mt-0.5">{tab.desc}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </nav>

        {/* Interactive Workspace Area - Dark brutalist theme */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full relative z-20" id="active-workspace-panel">
          
          {/* Active component router */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <JobBoard 
                mockResumeText={mockResumeText} 
                jobDescription={jobDescription}
                applications={applications}
                onAddToPipeline={handleAddApplication} 
                onOptimizeForJob={handleTransitToOptimization}
                onUpdateApplicationStage={(id, stage) => {
                  setApplications(prev => prev.map(a => a.id === id ? { ...a, stage } : a));
                }}
              />
            </div>
          )}

          {activeTab === "optimize" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ResumeOptimizer 
                mockResumeText={mockResumeText} 
                setMockResumeText={setMockResumeText} 
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
              />
            </div>
          )}

          {activeTab === "outreach" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <OutreachWriter 
                mockResumeText={mockResumeText} 
              />
            </div>
          )}

          {activeTab === "interview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <MockInterview 
                mockResumeText={mockResumeText} 
              />
            </div>
          )}

          {activeTab === "pipeline" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <PipelineTracker 
                applications={applications} 
                setApplications={setApplications} 
              />
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <CareerStats 
                applicationsCount={applications.length} 
                mockResumeText={mockResumeText}
                applications={applications}
              />
            </div>
          )}

        </main>

      </div>

      {/* Cyber Compliance Status Footer */}
      <footer className="bg-slate-950 text-center py-4 border-t border-emerald-500/20 text-[10px] text-emerald-500/50 font-mono relative z-20" id="mainframe-footer">
        © 2026 Matrix Hire • Neural Encryption Protocol 45.1.B • SECURED FEED • Powered by Google Gemini-3.5-flash standard
      </footer>
    </div>
  );
}
