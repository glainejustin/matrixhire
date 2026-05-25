import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle,
  Plus,
  Compass,
  RefreshCw,
  Globe,
  Loader2
} from "lucide-react";
import { JobListing, JobApplication } from "../types";

interface JobBoardProps {
  onLogAction?: (action: string, detail: string) => void;
  mockResumeText: string;
  jobDescription: string;
  applications: JobApplication[];
  onAddToPipeline: (app: JobApplication) => void;
  onOptimizeForJob: (jobDesc: string) => void;
  onUpdateApplicationStage: (id: string, stage: JobApplication["stage"]) => void;
}

export function JobBoard({ 
  mockResumeText, 
  jobDescription,
  applications,
  onAddToPipeline, 
  onOptimizeForJob,
  onUpdateApplicationStage
}: JobBoardProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  
  // Scraped live jobs state
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger search on mount or when CV is loaded
  useEffect(() => {
    fetchLiveJobs("");
  }, [mockResumeText, jobDescription]);

  const fetchLiveJobs = async (queryKeyword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/job-hunter/search-live-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: mockResumeText,
          jobDescription: jobDescription,
          searchKeyword: queryKeyword
        })
      });

      if (!response.ok) {
        throw new Error("Unable to retrieve matching jobs from search servers.");
      }

      const data = await response.json();
      if (Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else {
        throw new Error("Invalid format returned by job scraping nodes.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to parse website job indexes.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLiveJobs(searchTerm);
  };

  // Client-side compatibility overlap assessment helper
  const calculateMatchScore = (jobRequirements: string[]) => {
    if (!mockResumeText.trim()) return 18; // baseline

    const resumeLower = mockResumeText.toLowerCase();
    let matches = 0;
    jobRequirements.forEach(req => {
      if (resumeLower.includes(req.toLowerCase())) {
        matches += 1;
      }
    });

    const pct = Math.round((matches / Math.max(1, jobRequirements.length)) * 100);
    // Add realistic scaling with minimum score
    return Math.max(22, Math.min(98, pct + 15));
  };

  // Determine track stage state from applications array
  const getApplicationState = (job: JobListing) => {
    return applications.find(
      app => app.title.toLowerCase() === job.title.toLowerCase() && 
             app.company.toLowerCase() === job.company.toLowerCase()
    );
  };

  const handleAddToPipelineClick = (job: JobListing, score: number, initialStage: JobApplication["stage"]) => {
    const existing = getApplicationState(job);
    if (existing) {
      onUpdateApplicationStage(existing.id, initialStage);
      return;
    }

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salaryRange,
      stage: initialStage,
      appliedDate: new Date().toISOString().split("T")[0],
      notes: `Extracted live. Match Core: ${score}%. Portal: ${job.sourceUrl || "No external URL"}`,
    };

    onAddToPipeline(newApp);
  };

  // Filter local state jobs (for search and category)
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === "All" || job.category === categoryFilter;
    const matchesType = typeFilter === "All" || job.type === typeFilter;
    return matchesSearch && matchesCat && matchesType;
  });

  return (
    <div className="space-y-6" id="job-board-deck-module">
      
      {/* Information telemetry banner */}
      <div className="bg-emerald-950/20 border-2 border-emerald-500/30 rounded-xl p-4 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-mono tracking-widest font-black text-emerald-400 uppercase">// NEURAL WEB-SCRAPE CONSOLE</span>
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Dynamic Semantic Job Deck</h2>
          <p className="text-xs text-emerald-500/80 leading-relaxed font-sans mt-0.5">
            This module processes the character layers in your <b>scraped CV</b> and the target <b>Job Advert</b>, then crawls online corporate careers index pages (Lever, Greenhouse, LinkedIn, Indeed) in real-time to find 100% matched, active open positions.
          </p>
        </div>

        <button 
          onClick={() => fetchLiveJobs(searchTerm)}
          disabled={loading}
          className="px-4 py-2 bg-emerald-950 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/30 font-mono text-xs font-semibold rounded-lg flex items-center gap-2 transition shrink-0 uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-300" : ""}`} />
          <span>RE-SCRAPE ROLES</span>
        </button>
      </div>

      {/* Filters Bench header */}
      <form onSubmit={handleManualSearch} className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col lg:flex-row justify-between gap-4 text-left">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Scrape live sites for custom roles (e.g. Senior TS Developer, AI Engineer, PM)..."
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
            id="input-job-search"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2.5 text-xs font-sans items-center">
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-mono text-xs rounded-lg uppercase tracking-wider font-bold transition mr-2 flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            Scrape
          </button>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-semibold outline-none text-xs"
            id="select-filter-category"
          >
            <option value="All">All Disciplines</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Product Management">Product Management</option>
            <option value="Data Science">Data Science</option>
            <option value="Design">Design Systems</option>
            <option value="Marketing">Marketing Systems</option>
            <option value="Finance">Quantitative Finance</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-semibold outline-none text-xs"
            id="select-filter-type"
          >
            <option value="All">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Remote">Remote Only</option>
            <option value="Hybrid">Hybrid Models</option>
          </select>
        </div>

      </form>

      {/* Loading state with hacker decrypt feel */}
      {loading ? (
        <div className="py-24 text-center text-emerald-400 bg-slate-950/70 border-2 border-dashed border-emerald-500/20 rounded-xl space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
          <div className="font-mono text-xs uppercase tracking-widest text-emerald-300 animate-pulse">
            [+] EXPLICIT DECRYPT LINK ESTABLISHED • SCRAPING LIVE PORTALS VIA NEURAL BRIDGE...
          </div>
          <p className="text-[10px] text-emerald-600 max-w-md mx-auto">
            Extracting candidate profiles variables and searching active indexes. Resolving connections, generating ATS-compatibility benchmarks.
          </p>
        </div>
      ) : (
        /* Jobs Grids */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, idx) => {
              const score = calculateMatchScore(job.requirements);
              const trackedApp = getApplicationState(job);
              const isApplied = trackedApp?.stage === "applied";

              return (
                <div 
                  key={job.id || idx} 
                  className={`bg-[#1E293B] border rounded-xl p-5 shadow-lg flex flex-col justify-between text-left relative overflow-hidden group hover:border-emerald-500/40 transition duration-150 ${
                    isApplied ? "border-emerald-500/40 bg-emerald-950/10" : "border-slate-800"
                  }`}
                >
                  
                  {/* Match indicator header */}
                  <div className="absolute top-0 right-0 z-10">
                    <div className={`px-3 py-1 text-[10px] font-mono font-black tracking-wider uppercase rounded-bl-xl border-l border-b ${
                      isApplied 
                        ? "text-emerald-400 bg-emerald-950 border-emerald-500/40"
                        : score >= 75 
                          ? "text-emerald-400 bg-emerald-500/10 border-slate-800" 
                          : score >= 50 
                            ? "text-yellow-400 bg-yellow-500/10 border-slate-800" 
                            : "text-slate-400 bg-slate-800 border-slate-850"
                    }`}>
                      <Sparkles className="w-3 h-3 inline mr-1 text-inherit" />
                      {score}% Match
                    </div>
                  </div>

                  <div className="space-y-4 relative">
                    {/* Job Header */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                          {job.category}
                        </span>
                        {job.isLiveScraped && (
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 rounded uppercase font-mono tracking-widest scale-90">
                            LIVE
                          </span>
                        )}
                      </div>
                      <h3 className="font-sans font-semibold text-white text-sm leading-tight pr-16 group-hover:text-emerald-300 transition-all">
                        {job.title}
                      </h3>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs text-slate-200 font-semibold">{job.company}</span>
                        <span className="text-[9px] text-slate-500 font-mono italic">{job.postedDate}</span>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/20 p-2.5 rounded-lg border border-slate-850">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-emerald-400 truncate">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{job.salaryRange}</span>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
                      {job.description}
                    </p>

                    {/* Requirements tags list */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block">Key Skillsets Needed</span>
                      <div className="flex flex-wrap gap-1.5">
                        {job.requirements.map((req, idx) => {
                          const hasSkill = mockResumeText.toLowerCase().includes(req.toLowerCase());
                          return (
                            <span 
                              key={idx} 
                              className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all ${
                                hasSkill 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold" 
                                  : "bg-slate-900 border-slate-800 text-slate-500"
                              }`}
                            >
                              {hasSkill ? "✓ " : ""}{req}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer interactive Call to Actions */}
                  <div className="space-y-2 mt-5 pt-4 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddToPipelineClick(job, score, "wishlist")}
                        disabled={!!trackedApp && trackedApp.stage === "wishlist"}
                        className={`py-1.5 px-3 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                          trackedApp?.stage === "wishlist"
                            ? "bg-slate-800 text-slate-500 border border-slate-755 cursor-not-allowed" 
                            : "bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-300"
                        }`}
                        id={`btn-add-board-${job.id}`}
                      >
                        {trackedApp?.stage === "wishlist" ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>In Wishlist</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Track Wishlist</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onOptimizeForJob(`${job.title} at ${job.company}\n\n${job.description}\n\nRequirements:\n${job.requirements.join(", ")}`)}
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-slate-700 hover:text-indigo-200 text-white border border-transparent rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                        id={`btn-optimize-board-${job.id}`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Compare ATS</span>
                      </button>
                    </div>

                    {/* Apply and Scrape Action Button */}
                    <div className="grid grid-cols-1">
                      <button
                        onClick={() => {
                          handleAddToPipelineClick(job, score, "applied");
                          if (job.sourceUrl) {
                            window.open(job.sourceUrl, "_blank", "noopener,noreferrer");
                          }
                        }}
                        className={`py-2 px-3 rounded text-xs font-bold leading-none tracking-wider uppercase flex items-center justify-center gap-2 transition cursor-pointer ${
                          isApplied 
                            ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300"
                            : "bg-emerald-600 hover:bg-emerald-555 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        }`}
                      >
                        <CheckCircle className={`w-4 h-4 ${isApplied ? "text-emerald-400" : "text-emerald-100"}`} />
                        <span>{isApplied ? "APPLIED ✓" : job.sourceUrl ? "APPLY VIA PORTAL & TRACK" : "APPLY & TRACK"}</span>
                        {job.sourceUrl && !isApplied && <ExternalLink className="w-3 h-3 text-emerald-250 ml-0.5" />}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="col-span-full py-24 text-center text-slate-500 bg-[#1E293B] border border-slate-800 rounded-xl">
              <Compass className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-slate-350 font-semibold font-sans">No matching live roles discovered yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Upload your resume in ATS Resume Optimizer to pull real website openings automatically, or type custom queries above!
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
