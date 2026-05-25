import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  LayoutGrid, 
  Check, 
  UploadCloud, 
  Terminal, 
  Cpu, 
  CheckSquare, 
  ShieldAlert 
} from "lucide-react";
import { ATSAnalysisResult } from "../types";

interface ResumeOptimizerProps {
  onLogAction?: (action: string, detail: string) => void;
  mockResumeText: string;
  setMockResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
}

export function ResumeOptimizer({ 
  mockResumeText, 
  setMockResumeText,
  jobDescription,
  setJobDescription
}: ResumeOptimizerProps) {
  const [scanning, setScanning] = useState<boolean>(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // File Uploader state variables
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [decryptionActive, setDecryptionActive] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerScan = async () => {
    if (!mockResumeText.trim()) {
      setError("RESUME_STREAM_EMPTY: Please upload or paste resume experience data first into the scrap container.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("TARGET_JOB_DESCRIPTION_EMPTY: Target specifications required for neural keyword overlay.");
      return;
    }

    setScanning(true);
    setError(null);
    try {
      const response = await fetch("/api/job-hunter/ats-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: mockResumeText,
          jobDescription,
        }),
      });
      if (!response.ok) {
        throw new Error("UNABLE_TO_ESTABLISH_NEURAL_MATCHING. Critical server state error.");
      }
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected security network disconnect occurred.");
    } finally {
      setScanning(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Process selected file
  const processUploadedFile = (file: File) => {
    setError(null);
    setUploadedFileName(file.name);
    setDecryptionActive(true);

    const extension = file.name.split(".").pop()?.toLowerCase();
    
    const reader = new FileReader();
    
    if (extension === "txt" || extension === "md" || extension === "json" || extension === "csv") {
      reader.onload = (e) => {
        const textContent = e.target?.result as string;
        if (textContent) {
          setMockResumeText(textContent);
        }
        setDecryptionActive(false);
      };
      reader.readAsText(file);
    } else if (extension === "pdf" || extension === "docx") {
      // PDF/DOCX are binary formats, we convert to base64 and scrape real characters using our server model.
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64String = btoa(binary);
          
          let mimeType = "application/pdf";
          if (extension === "docx") {
            mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          }

          const response = await fetch("/api/job-hunter/scrape-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64Data: base64String,
              mimeType,
              fileName: file.name
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "File parser returned an error.");
          }

          const data = await response.json();
          if (data.text) {
            setMockResumeText(data.text);
          } else {
            throw new Error("Invalid or empty text returned from document scanning node.");
          }
        } catch (err: any) {
          console.error(err);
          setError(`DECRYPTION_FAILED: ${err.message || "Could not parse or scrape textual content from document file."}`);
        } finally {
          setDecryptionActive(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError("UNSUPPORTED_FORMAT Exception: Only PDF, DOCX, and TXT binary types allowed for decryption.");
      setDecryptionActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 text-left" id="resume-optimizer-module">
      
      {/* Immersive cyber intro banner */}
      <div className="bg-slate-950/90 border border-emerald-500/20 rounded p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-md uppercase tracking-widest font-black text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
          // NEURAL ATS DECRYPTER &amp; OPTIMIZER
        </h2>
        <p className="text-xs text-emerald-500/70 mt-1 lines-clamp-2 leading-relaxed">
          Siphons credentials, extracts binary schemas (PDF, DOCX, TXT), and evaluates match-coefficients against direct corporate JD templates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Pane */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950/90 border-2 border-emerald-500/10 rounded p-5 shadow-20 flex flex-col gap-4 relative">
            
            {/* Cyber Drag and Drop Zone */}
            <div>
              <label className="text-[10px] uppercase font-bold text-emerald-500/80 mb-2 flex items-center gap-1.5 tracking-wider">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                A. INGEST BIOMETRIC DOSSIER (PDF, DOCX, TXT)
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer flex flex-col justify-center items-center h-36 relative overflow-hidden ${
                  isDragging 
                    ? "border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                    :uploadedFileName
                      ? "border-emerald-500/30 bg-emerald-950/5 hover:border-emerald-500/50"
                      : "border-emerald-500/10 hover:border-emerald-500/30 bg-slate-900/40"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.docx,.txt" 
                  className="hidden" 
                />

                {decryptionActive ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest animate-pulse">
                      DECRYPTING BINARY LAYERS...
                    </span>
                    <span className="text-[9px] text-emerald-500/60 max-w-[200px] truncate">
                      {uploadedFileName}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 text-emerald-500/40 mb-1" />
                    <p className="text-xs text-slate-350 font-bold uppercase tracking-wider">
                      {uploadedFileName ? "NEW FILE MOUNTED" : "DRAG &amp; DROP BIOMETRIC"}
                    </p>
                    <p className="text-[9px] text-emerald-500/60 font-mono">
                      {uploadedFileName ? uploadedFileName : "Supports raw .pdf, .docx, or .txt format files"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ingested Code Area */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="resume-text-input" className="text-[10px] uppercase font-bold text-emerald-500/80 flex items-center gap-1.5 tracking-wider">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  B. EXPERIENTIAL SCRAP CONTAINER (PLAINTEXT)
                </label>
                {mockResumeText && (
                  <button
                    onClick={() => {
                      setMockResumeText("");
                      setUploadedFileName("");
                    }}
                    className="text-[9px] uppercase font-mono font-bold text-red-400 hover:text-red-300 transition flex items-center gap-1.5"
                    title="Delete pre-existing summary or legacy CV contents instantly"
                    type="button"
                  >
                    [DELETE PRE-EXISTING SUMMARY / CLEAR CV]
                  </button>
                )}
              </div>
              <textarea
                value={mockResumeText}
                onChange={(e) => setMockResumeText(e.target.value)}
                placeholder="Ingested clean plain-text experience blocks, skills, and summary decrypted here for inspection..."
                className="w-full h-36 bg-slate-900 border border-emerald-500/10 rounded p-3 text-xs text-emerald-300 placeholder-emerald-900/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none scrollbar-inner resize-none font-mono"
                id="resume-text-input"
              />
              <p className="text-[9px] text-emerald-500/50 italic mt-1 uppercase font-mono tracking-wide">
                * SYSTEM ADVICE: Keep metrics, specific technologies and tenure milestones editable here.
              </p>
            </div>

            {/* Target Job Description */}
            <div>
              <label htmlFor="jd-text-input" className="text-[10px] uppercase font-bold text-emerald-500/80 mb-2 flex items-center gap-1.5 tracking-wider">
                <Terminal className="w-4 h-4 text-emerald-400" />
                C. TARGET RECRUITMENT SPECIFICATION (JD)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target requirements, role expectations, or corporate node telemetry description..."
                className="w-full h-32 bg-slate-900 border border-emerald-500/10 rounded p-3 text-xs text-emerald-300 placeholder-emerald-900/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none scrollbar-inner resize-none font-mono"
                id="jd-text-input"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] p-3 rounded flex items-start gap-2 font-mono">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5">// ERROR DIAGNOSTIC:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={triggerScan}
              disabled={scanning || decryptionActive}
              className={`w-full py-3 rounded text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2 transition-all ${
                scanning 
                  ? "bg-slate-900 text-emerald-700 border border-emerald-500/10 cursor-not-allowed" 
                  : "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              }`}
              id="btn-scan-resume"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  INIT_KEYWORDS_OVERLAY_MATRIX_SCAN...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  CALCULATE_ATS_MATCH_ COEFFICIENTS
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Pane */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-slate-950/90 border-2 border-emerald-500/15 rounded p-5 shadow-xl space-y-6 animate-in fade-in duration-300">
              
              {/* Score header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-500/20 pb-4">
                <div>
                  <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-emerald-400">[//]</span> MATRICTORIAL COMPATIBILITY COEFFICIENT
                  </h3>
                  <p className="text-[9px] text-emerald-500/50 font-mono mt-0.5">// AUTOMATED HARVEST MATCH RATINGS BASED ON RECRUITMENT NODES</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-emerald-950"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={163.3}
                        strokeDashoffset={163.3 - (163.3 * result.score) / 100}
                      />
                    </svg>
                    <span className="absolute text-xs font-mono font-black text-white">{result.score}%</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-mono tracking-widest font-black px-2 py-1 rounded block bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {result.score >= 80 ? "🔥 HIGHLY_COMPATIBLE" : result.score >= 50 ? "⚠️ DEVIENT_WARNING" : "🚨 DESTRUCTION_METRIC_REBUILD"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Match overview grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-slate-900/60 border border-emerald-500/10 p-4 rounded-lg space-y-2">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    MATCHED_TOKENS_FOUND
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.matches.length > 0 ? (
                      result.matches.map((kw, i) => (
                        <span key={i} className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded font-mono font-semibold">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-emerald-700 italic">// NULL MATCH TRACE.</span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-emerald-500/10 p-4 rounded-lg space-y-2">
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    MISSING_TOKENS_ALERT
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.missing.length > 0 ? (
                      result.missing.map((kw, i) => (
                        <span key={i} className="text-[9px] bg-red-950/20 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded font-mono font-semibold">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-emerald-400 italic flex items-center gap-1">
                        ✓ ALL REQUISITE TOKENS IDENTIFIED
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Strategic Analysis */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-emerald-500/85 tracking-widest">// ALGORITHMIC DECRYPTION SYNTAX</h4>
                <div className="bg-slate-900 border border-emerald-500/10 p-4 rounded text-emerald-300 text-xs leading-relaxed font-mono whitespace-pre-line">
                  {result.atsAnalysis}
                </div>
              </div>

              {/* Optimized STAR bullets */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-emerald-405 tracking-widest flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  // RECONSTRUCTED STAR MATRIX UPGRADES
                </h4>
                <div className="space-y-4">
                  {result.suggestedBulletPoints.map((point, index) => (
                    <div key={index} className="bg-slate-900/70 border border-emerald-500/10 rounded p-4 space-y-3">
                      
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono font-black text-red-500/70 uppercase tracking-widest block">// ORIGINAL_TASK_FRAGMENT:</span>
                        <p className="text-[10px] text-slate-500 line-through italic leading-relaxed">{point.original}</p>
                      </div>

                      <div className="space-y-1 bg-emerald-950/20 p-3 rounded border border-emerald-500/20">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-mono font-black text-emerald-400 tracking-wider block">// ATS_ENFORCED_STAR_METRIC:</span>
                          <button
                            onClick={() => handleCopy(point.improved, index)}
                            className="bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-[8px] uppercase tracking-widest hover:bg-emerald-900 hover:text-white px-2 py-0.5 rounded transition flex items-center gap-1"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-white font-bold">COPIED</span>
                              </>
                            ) : (
                              <span>COPY_UPGRADE</span>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-white font-semibold leading-relaxed font-sans">{point.improved}</p>
                      </div>

                      <div className="text-[9px] text-emerald-500/60 flex items-start gap-1 bg-slate-950/40 p-2 rounded">
                        <span className="font-bold uppercase tracking-widest shrink-0">// REASON:</span>
                        <span>{point.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-950/80 border-2 border-dashed border-emerald-500/10 rounded-xl p-16 text-center text-slate-400 shadow-lg min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 text-[10px] font-mono opacity-5 text-emerald-400 select-none">
                01010101010101010101010101010101101010101
              </div>
              <FileText className="w-12 h-12 text-emerald-500/20 mb-3 animate-pulse" />
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">AWAITING DECISION STREAM</h3>
              <p className="text-[10px] text-emerald-500/50 max-w-sm mx-auto mt-2 leading-relaxed font-mono">
                FEED TARGET EXPERIENCES (LEFT) TO GENERATE DYNAMIC ALGORITHMIC FEEDBACK SCORECARD OVERLAYS.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
