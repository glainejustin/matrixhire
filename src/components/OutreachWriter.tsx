import { useState } from "react";
import { Copy, Check, FileText, Send, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface OutreachWriterProps {
  onLogAction?: (action: string, detail: string) => void;
  mockResumeText: string;
}

export function OutreachWriter({ mockResumeText }: OutreachWriterProps) {
  const [company, setCompany] = useState<string>("");
  const [roleTitle, setRoleTitle] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [outreachType, setOutreachType] = useState<string>("Classic Cover Letter");
  const [tone, setTone] = useState<string>("Warm & Professional");
  const [customPrompt, setCustomPrompt] = useState<string>("");

  const [generating, setGenerating] = useState<boolean>(false);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const generateOutreachContent = async () => {
    setGenerating(true);
    setError(null);
    setOutput("");
    try {
      const response = await fetch("/api/job-hunter/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: mockResumeText || "A highly qualified software development student",
          jobDescription: `Target Title: ${roleTitle}. Key notes: ${customPrompt}`,
          company,
          contactName,
          outreachType,
          tone,
        }),
      });
      if (!response.ok) {
        throw new Error("Outreach AI builder failed. Confirm correct network integration.");
      }
      const data = await response.json();
      setOutput(data.output || "No cover letter generated.");
    } catch (err: any) {
      setError(err.message || "An error occurred during content generation.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="outreach-writer-module">
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 text-slate-200 shadow-xl text-left">
        <h2 className="text-lg font-sans font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          AI Outreach &amp; Cover Letter Composer
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Instantly generate human-grade, high-converting cold outreach sequences, recruiter messages, and traditional cover letters personalized to your profile and the target company.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selection Configuration controls */}
        <div className="lg:col-span-4 space-y-4 text-left">
          <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            
            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Outreach Format
              </label>
              <select
                value={outreachType}
                onChange={(e) => setOutreachType(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 text-xs px-2.5 py-1.5 rounded text-white font-medium focus:border-indigo-500 outline-none"
                id="select-outreach-type"
              >
                <option value="Classic Cover Letter">Classic Cover Letter</option>
                <option value="Cold LinkedIn Connect Option">Cold LinkedIn Connect Message (300 char limits)</option>
                <option value="Cold Email to Hiring Manager">Cold Reachout Email to Hiring Mgr</option>
                <option value="Post Interview Follow-Up">Post-Interview Grace Follow-Up</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Target Corporate Entity
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none"
                placeholder="e.g. Stripe, Airbnb, Google"
                id="input-outreach-company"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Target Work Role
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none"
                placeholder="e.g. Senior Software Engineer II"
                id="input-outreach-role"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Recipient / Point of Contact
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none"
                placeholder="e.g. CEO, Recruiter or 'Hiring Team'"
                id="input-outreach-contact"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Outreach Tone Presets
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 text-xs px-2.5 py-1.5 rounded text-white font-medium focus:border-indigo-500 outline-none"
                id="select-outreach-tone"
              >
                <option value="Warm & Professional">Warm &amp; Professional</option>
                <option value="Bold & Disrupter">Bold &amp; Highly Confident</option>
                <option value="Passionate Futurist">Passionate &amp; mission-focused</option>
                <option value="Technical Peer Master">Deeply Technical &amp; No Bullshit</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Custom Focus / Specific Highlights
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe specific stories, systems or projects from your resume you want emphasized..."
                className="w-full h-20 bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none resize-none scrollbar-thin"
                id="textarea-outreach-prompt"
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={generateOutreachContent}
              disabled={generating}
              className={`w-full py-2.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                generating 
                  ? "bg-slate-700 text-slate-455 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-505 text-white"
              }`}
              id="btn-generate-outreach"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Drafting with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Custom Draft
                </>
              )}
            </button>

          </div>
        </div>

        {/* Output pane display */}
        <div className="lg:col-span-8 text-left">
          <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 shadow-lg min-h-[480px] flex flex-col justify-between" id="outreach-writer-display">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                    {outreachType} Composer Terminal
                  </span>
                </div>
                {output && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
                    id="btn-copy-outreach"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Draft text</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {output ? (
                <div className="prose prose-invert max-w-none text-slate-300 font-sans text-xs whitespace-pre-line leading-relaxed max-h-[400px] overflow-y-auto scrollbar-thin p-3 rounded-lg bg-[#0F172A]/70 border border-slate-850/60">
                  {output}
                </div>
              ) : (
                <div className="text-center py-24 text-slate-520 flex flex-col items-center justify-center">
                  <Send className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                  <p className="text-slate-400 font-semibold text-xs">Your AI generated custom draft will appear here</p>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-normal">
                    Adjust target job configurations or focus variables and trigger the compiler above.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-500 font-mono italic">
              * Note: Gemini leverages your pasted resume profiles dynamically. Ensure high quality inputs for top performance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
