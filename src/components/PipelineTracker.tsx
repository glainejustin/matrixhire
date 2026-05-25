import React, { useState } from "react";
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Calendar, 
  Trash2, 
  ChevronRight, 
  Layers,
  CheckCircle,
  Globe,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { JobApplication } from "../types";

interface PipelineTrackerProps {
  onLogAction?: (action: string, detail: string) => void;
  applications: JobApplication[];
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
}

const STAGES: { id: JobApplication["stage"]; label: string; color: string; hoverColor: string }[] = [
  { id: "wishlist", label: "Wishlist", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300", hoverColor: "hover:bg-indigo-500/20" },
  { id: "applied", label: "Applied", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", hoverColor: "hover:bg-emerald-500/20" },
  { id: "interviewing", label: "Interviewing", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300", hoverColor: "hover:bg-yellow-500/20" },
  { id: "offer", label: "Offer Received", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300", hoverColor: "hover:bg-cyan-500/20" },
  { id: "archived", label: "Archived / Rejected", color: "bg-slate-500/10 border-slate-500/20 text-slate-400", hoverColor: "hover:bg-slate-500/20" },
];

export function PipelineTracker({ applications, setApplications }: PipelineTrackerProps) {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [salary, setSalary] = useState<string>("");
  const [stage, setStage] = useState<JobApplication["stage"]>("wishlist");
  const [notes, setNotes] = useState<string>("");

  // Scraper control states
  const [scrapeUrl, setScrapeUrl] = useState<string>("");
  const [scrapingUrl, setScrapingUrl] = useState<boolean>(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeSuccess, setScrapeSuccess] = useState<boolean>(false);

  // Parse URL from live website using backend crawler
  const handleUrlScrape = async () => {
    if (!scrapeUrl.trim()) {
      setScrapeError("Please specify or paste target job listing URL first.");
      return;
    }
    setScrapingUrl(true);
    setScrapeError(null);
    setScrapeSuccess(false);

    try {
      const response = await fetch("/api/job-hunter/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Crawl action returned empty nodes.");
      }

      const parsedData = await response.json();
      
      // Auto-fill form parameters
      if (parsedData.title) setTitle(parsedData.title);
      if (parsedData.company) setCompany(parsedData.company);
      if (parsedData.location) setLocation(parsedData.location);
      if (parsedData.salary) setSalary(parsedData.salary);
      if (parsedData.notes) setNotes(parsedData.notes);

      setScrapeSuccess(true);
    } catch (err: any) {
      console.error(err);
      setScrapeError(err.message || "Failed to live scan job posting details. Auto-fill manually.");
    } finally {
      setScrapingUrl(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      alert("Role Title and Company arguments are required to log pipeline item.");
      return;
    }

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      title,
      company,
      location: location || "Remote",
      salary: salary || undefined,
      stage,
      appliedDate: new Date().toISOString().split("T")[0],
      notes: notes || undefined,
    };

    setApplications((prev) => [newApp, ...prev]);
    
    // Reset Form
    setTitle("");
    setCompany("");
    setLocation("");
    setSalary("");
    setNotes("");
    setScrapeUrl("");
    setScrapeSuccess(false);
    setShowForm(false);
  };

  const updateStage = (id: string, newStage: JobApplication["stage"]) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, stage: newStage } : app))
    );
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  // Stats Counters
  const totalCount = applications.length;
  const interviewingCount = applications.filter((a) => a.stage === "interviewing").length;
  const offerCount = applications.filter((a) => a.stage === "offer").length;
  const appliedCount = applications.filter((a) => a.stage === "applied").length;

  return (
    <div className="space-y-6" id="pipeline-tracker-module">
      {/* Intro Metrics Deck row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wide">Aggregate Targets</span>
            <span className="text-xl font-bold text-white block mt-0.5">{totalCount}</span>
          </div>
          <Layers className="w-8 h-8 text-indigo-400 opacity-60" />
        </div>

        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wide">Active Applied</span>
            <span className="text-xl font-bold text-emerald-400 block mt-0.5">{appliedCount}</span>
          </div>
          <Briefcase className="w-8 h-8 text-emerald-500 opacity-60" />
        </div>

        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wide">Live Interviews</span>
            <span className="text-xl font-bold text-yellow-500 block mt-0.5">{interviewingCount}</span>
          </div>
          <ChevronRight className="w-8 h-8 text-yellow-500 opacity-60" />
        </div>

        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wide">Offer Letters</span>
            <span className="text-xl font-bold text-cyan-400 block mt-0.5">{offerCount}</span>
          </div>
          <CheckCircle className="w-8 h-8 text-cyan-500 opacity-60" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h2 className="text-lg font-sans font-semibold text-white uppercase tracking-wider">Application Pipeline Kanban</h2>
          <p className="text-xs text-slate-400 mt-0.5">Control progression, adjust stages dynamically, and import jobs from live URLs.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow cursor-pointer uppercase tracking-wider font-mono"
          id="btn-toggle-add-form"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Hide Scraper Hub" : "Scrape or Add Job"}
        </button>
      </div>

      {/* Creation and Scraper Form */}
      {showForm && (
        <div className="bg-[#1E293B] border border-emerald-500/20 rounded-xl p-5 shadow-lg space-y-4 text-left animate-in slide-in-from-top-4 duration-200">
          
          {/* URL live crawler panel */}
          <div className="bg-slate-950 p-4 rounded-lg border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">⚡ LIVE WEBSITE DIRECT-SCRAPER</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Enter any live corporate or portal job listing link (Lever, Greenhouse, LinkedIn, etc.) to automatically extract positions, company details, salaries, and requirements context accurately.
            </p>
            
            <div className="flex gap-2">
              <input
                type="url"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                placeholder="https://boards.greenhouse.io/stripe/jobs/48293021 or LinkedIn post..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleUrlScrape}
                disabled={scrapingUrl}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-bold uppercase rounded flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                {scrapingUrl ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                    <span>Scraping Live Web...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Scrape & Fill</span>
                  </>
                )}
              </button>
            </div>
            
            {scrapeError && (
              <div className="flex items-center gap-1 text-rose-400 text-[10px] font-mono">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>ERR_DECRYPTION: {scrapeError}</span>
              </div>
            )}
            {scrapeSuccess && (
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>DECRYPT_SUCCESS: Character elements scraped and populated successfully! Review below.</span>
              </div>
            )}
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Senior Full Stack Developer"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none"
                  id="input-app-title"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Stripe, Figma, Vercel"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none"
                  id="input-app-company"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Location / Zone</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote, Hybrid, City & Country"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none"
                  id="input-app-location"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Compensation Range</label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g., $145,000 - $175,000"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none"
                  id="input-app-salary"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Initial Track Column</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  className="w-full bg-[#0F172A] border border-slate-700 text-xs px-2.5 py-2 rounded text-white font-medium focus:border-emerald-500 outline-none"
                  id="select-app-stage"
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer Received</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Parsed Notes & Checklist Context</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Job outline or automatic crawler telemetry details..."
                  className="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none"
                  id="input-app-notes"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setScrapeSuccess(false);
                }}
                className="px-3.5 py-1.5 border border-slate-750 text-slate-400 hover:text-white rounded text-xs transition cursor-pointer"
                id="btn-cancel-create"
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition cursor-pointer font-mono uppercase tracking-wider"
                id="btn-confirm-create"
              >
                Add to Workspace
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board Columns structure */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((col) => {
          const colApps = applications.filter((app) => app.stage === col.id);
          return (
            <div key={col.id} className="bg-[#131C2E] border border-slate-800 rounded-xl p-3 min-h-[420px] shrink-0 w-full lg:w-auto flex flex-col justify-between">
              
              <div className="space-y-3.5">
                {/* Columns label header */}
                <div className={`border p-2 rounded-lg text-left flex justify-between items-center ${col.color}`}>
                  <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase">{col.label}</span>
                  <span className="font-mono text-[10px] font-bold bg-slate-900/40 py-0.5 px-2 rounded-full">{colApps.length}</span>
                </div>

                {/* Sub applications cards list */}
                <div className="space-y-3 min-h-[350px] overflow-y-auto w-full scrollbar-thin">
                  {colApps.length > 0 ? (
                    colApps.map((app) => {
                      const isApplied = app.stage === "applied";
                      return (
                        <div 
                          key={app.id} 
                          className={`bg-[#1E293B] border hover:border-emerald-500/30 transition duration-150 p-3.5 rounded-lg text-left space-y-2.5 relative group shadow-sm ${
                            isApplied ? "border-emerald-500/20 bg-emerald-950/5" : "border-slate-800"
                          }`}
                        >
                          
                          <div className="space-y-0.5 pr-6">
                            <h4 className="text-xs font-semibold text-white leading-tight truncate">{app.title}</h4>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold block truncate">{app.company}</span>
                          </div>

                          {/* Location / Salary metadata indicators */}
                          <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-sans">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span className="truncate">{app.location}</span>
                            </div>
                            {app.salary && (
                              <div className="flex items-center gap-1.5 font-mono">
                                <DollarSign className="w-3 h-3 text-slate-500" />
                                <span className="text-emerald-450">{app.salary}</span>
                              </div>
                            )}
                          </div>

                          {app.notes && (
                            <p className="text-[10px] text-slate-500 leading-normal p-1 bg-slate-900/20 rounded line-clamp-3 italic font-sans border border-slate-800/40">
                              📝 {app.notes}
                            </p>
                          )}

                          {isApplied && (
                            <div className="text-[9px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded w-fit uppercase">
                              Applied ✓
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-[9px] text-slate-450 font-mono">
                            <span>{app.appliedDate}</span>
                            
                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition duration-100">
                              {/* Option triggers to move states */}
                              <select
                                value={app.stage}
                                onChange={(e) => updateStage(app.id, e.target.value as any)}
                                className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-[9px] text-slate-300 outline-none"
                                title="Move pipeline category"
                              >
                                <option value="wishlist">Wish</option>
                                <option value="applied">Applied</option>
                                <option value="interviewing">Interv</option>
                                <option value="offer">Offer</option>
                                <option value="archived">Arch</option>
                              </select>

                              <button
                                onClick={() => deleteApplication(app.id)}
                                className="text-rose-400 hover:text-rose-350 p-0.5 cursor-pointer"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="py-24 text-center border border-dashed border-slate-800/40 rounded-lg text-slate-600 flex flex-col justify-center items-center">
                      <Briefcase className="w-6 h-6 opacity-30 mb-1" />
                      <span className="text-[10px] font-mono leading-none">Category Empty</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
