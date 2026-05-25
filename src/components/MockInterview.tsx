import { useState, useRef, useEffect } from "react";
import { 
  User, 
  HelpCircle, 
  Send, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Award, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff,
  Terminal,
  Cpu,
  Shield,
  Zap,
  Radio,
  Video
} from "lucide-react";
import { MockInterviewMessage, InterviewEvaluation } from "../types";

interface MockInterviewProps {
  onLogAction?: (action: string, detail: string) => void;
  mockResumeText: string;
}

interface MatrixCharacter {
  id: string;
  name: string;
  role: string;
  vibe: string;
  avatarSymbol: string;
  hexColor: string;
  systemPrompt: string;
  greeting: string;
}

const CHARACTERS: MatrixCharacter[] = [
  {
    id: "smith",
    name: "Agent Smith",
    role: "Core Sentinel Auditor",
    vibe: "Cold, authoritative machine system auditor. Demanding, direct, and slightly ominous.",
    avatarSymbol: "🕶️",
    hexColor: "#dc2626", // Red System Error Accent
    greeting: "Mr. Candidate. We have been expecting you. Your credentials are... intriguing. Let us verify your stack compatibility.",
    systemPrompt: "You are Agent Smith, the legendary Sentinel program from the Matrix. You speak with absolute authority, cold computing precision, and refer to the candidate as 'Mr. Candidate' or 'Program'. You find human software engineering slightly messy but demand perfect logic. Keep your single question short and extremely direct."
  },
  {
    id: "trinity",
    name: "Trinity",
    role: "Tactical Recruiter Alpha",
    vibe: "Tactical, action-focused cyber infiltration trainer. Sharp, human, supportive but no-nonsense.",
    avatarSymbol: "🏍️",
    hexColor: "#10b981", // Glowing Matrix Emerald
    greeting: "I know exactly why you're plugged in today. Let's block out the noise and see what kind of high-agency impact you can build when threatened.",
    systemPrompt: "You are Trinity, the elite cyber infiltration lead from Zion. You are sharp, fast, practical, and focus on high-agency problem solving, resilience under stress, and production-ready applications. Keep your single question brief and focused on tactical action."
  },
  {
    id: "architect",
    name: "The Architect",
    role: "Systemic Schema Creator",
    vibe: "Elaborate, articulate mainframe developer. Uses advanced theoretical terms, focusing on structural purity.",
    avatarSymbol: "🏛️",
    hexColor: "#3b82f6", // Deep Mainframe Blue
    greeting: "Your presence, though predictable, provides a diagnostic vector. Let us analyze the symmetrical configurations of your systemic architecture.",
    systemPrompt: "You are The Architect, the creator of the Matrix mainframe. You speak with high-minded intelligence, utilizing clinical, elaborate vocabulary (e.g., 'vis-a-vis', 'concordantly', 'predilection'). You are interested in system designs, database structures, and theoretical consistency. Keep your question structured but short."
  },
  {
    id: "spoon",
    name: "Spoon Boy",
    role: "Zen Paradox Guide",
    vibe: "Mindful, zen, unorthodox oracle disciple. Evaluates potential, lateral thinking, and flexibility.",
    avatarSymbol: "🥄",
    hexColor: "#f59e0b", // Amber Oracle Glow
    greeting: "Do not try to bend the interview parameters, because that's impossible. Instead, only try to realize the truth: there is no interview. You bend yourself.",
    systemPrompt: "You are Spoon Boy, the zen disciple from the Oracle's home. You speak with gentle wisdom, paradoxical insights, and challenge standard assumptions. You care about adaptiveness, learning speeds, and general potential. Keep your single question short and query lateral thinking."
  }
];

export function MockInterview({ mockResumeText }: MockInterviewProps) {
  const [role, setRole] = useState<string>("Software Engineer");
  const [selectedChar, setSelectedChar] = useState<MatrixCharacter>(CHARACTERS[0]);
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [messages, setMessages] = useState<MockInterviewMessage[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // STT Voice Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Webcam stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Evaluation cache
  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewEvaluation | null>(null);
  const [lastQuestionText, setLastQuestionText] = useState<string>("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Oscilloscope Fallback Animation when camera is off
  useEffect(() => {
    if (cameraActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderOscilloscope = () => {
      ctx.fillStyle = "rgba(2, 6, 23, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = "rgba(16, 185, 129, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw Wave
      ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(16, 185, 129, 0.5)";
      ctx.shadowBlur = 4;
      ctx.beginPath();

      const centerY = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        const angle = (x / canvas.width) * Math.PI * 4 + phase;
        // Combine sine waves for a complex heartbeat / telemetry wave
        const y = centerY + Math.sin(angle) * 15 * Math.sin(phase * 0.5) + Math.cos(angle * 2.5) * 5;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Static code telemetry overlay Text
      ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
      ctx.font = "8px monospace";
      ctx.fillText(`CANDIDATE_NEURAL_SKELETON: ONLINE`, 10, 15);
      ctx.fillText(`BIOMETRICS_FREQUENCY: 78.4 Hz`, 10, 27);
      ctx.fillText(`STRESS_INDEX_COEFFICIENT: NORMAL`, 10, 39);

      phase += 0.05;
      animId = requestAnimationFrame(renderOscilloscope);
    };

    renderOscilloscope();
    return () => cancelAnimationFrame(animId);
  }, [cameraActive, interviewStarted]);

  // Audio Speech Synthesis Speak-back (TTS)
  const speakVoice = (text: string) => {
    if (isMuted) return;
    try {
      window.speechSynthesis.cancel(); // Stop current speech
      const cleanText = text.replace(/[*#_`~[\]]/g, ""); // strip characters
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Fine-grained customization suited for the respective core archetypes
      if (selectedChar.id === "smith") {
        utterance.pitch = 0.75;
        utterance.rate = 0.85;
      } else if (selectedChar.id === "trinity") {
        utterance.pitch = 1.05;
        utterance.rate = 1.0;
      } else if (selectedChar.id === "architect") {
        utterance.pitch = 0.8;
        utterance.rate = 0.95;
      } else {
        // Spoon Boy
        utterance.pitch = 1.25;
        utterance.rate = 0.9;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis Voice Node issue:", e);
    }
  };

  // Keep chat scrolls pinned
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle active webcam mirror
  const startCameraStream = async () => {
    try {
      if (cameraStream) stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Biometric camera hardware denied/failed:", err);
      setCameraActive(false);
    }
  };

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setCameraActive(false);
  };

  // Start new mock interview
  const startNewSession = async () => {
    setLoadingQuestion(true);
    setInterviewStarted(true);
    setCurrentEvaluation(null);
    setLastQuestionText("");
    
    // Automatically boot candidate's camera mirror if permitted
    startCameraStream();

    const charVibePrefix = `[NEURAL LINK OVERRIDE]: You will conduct an interview for ${role}. Prepare a customized interview introduction tailored by ${selectedChar.name}. Vibe rule: ${selectedChar.systemPrompt}`;
    
    try {
      const response = await fetch("/api/job-hunter/mock-interview-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          messages: [
            { id: "sys-0", sender: "user", text: charVibePrefix, timestamp: "" }
          ],
        }),
      });
      const data = await response.json();
      const firstQuestion = data.text || selectedChar.greeting;
      
      setMessages([
        {
          id: `msg-${Date.now()}`,
          sender: "ai",
          text: firstQuestion,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setLastQuestionText(firstQuestion);
      
      // Auto speak when interview boots up
      setTimeout(() => {
        speakVoice(firstQuestion);
      }, 500);

    } catch (err) {
      console.error(err);
      // Fallback
      setMessages([
        {
          id: "msg-fallback",
          sender: "ai",
          text: selectedChar.greeting,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Candidate speech recognition dictation
  const startSTTListening = () => {
    try {
      window.speechSynthesis.cancel(); // Mute playing text when candidato speaks
      const SpeechVar = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechVar) {
        alert("Speech-to-text is not natively supported in your current browser configuration. Try Chrome, Safari, or Microsoft Edge.");
        return;
      }

      const rec = new SpeechVar();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const resultString = event.results[0][0].transcript;
        if (resultString) {
          setUserInput((prev) => prev + (prev.trim() ? " " : "") + resultString);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Biometric Audio dictation issue:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopSTTListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Submit Answer & receive next question
  const transmitAnswerAndGetNext = async () => {
    if (!userInput.trim()) return;
    if (isListening) stopSTTListening();

    const userMsg: MockInterviewMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setUserInput("");
    setLoadingQuestion(true);
    setCurrentEvaluation(null);

    // Filter messages to avoid sending too much internal payload structures
    const payloadMessages = newMessages.map((m) => ({
      sender: m.sender,
      text: m.text
    }));

    try {
      const response = await fetch("/api/job-hunter/mock-interview-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: `${role} (Interviewed in character of ${selectedChar.name} - ${selectedChar.vibe})`,
          messages: payloadMessages,
        }),
      });
      const data = await response.json();
      const nextQuestion = data.text || "Connection stable. Propose your technical counter-argument.";
      
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "ai",
          text: nextQuestion,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setLastQuestionText(nextQuestion);
      
      // AI characters speak!
      speakVoice(nextQuestion);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Evaluation trigger
  const evaluateAnswerWithCoach = async () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user");
    const lastAiMsg = [...messages].reverse().find((m) => m.sender === "ai");

    if (!lastUserMsg || !lastAiMsg) {
      alert("PROVOKE_DIAGNOSES_ERROR: Submit at least one technical response in the character chat to audit.");
      return;
    }

    setLoadingEvaluation(true);
    setCurrentEvaluation(null);

    try {
      const response = await fetch("/api/job-hunter/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: lastAiMsg.text,
          answer: lastUserMsg.text,
          role,
        }),
      });
      const data = await response.json();
      setCurrentEvaluation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  // Clean camera up on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  return (
    <div className="space-y-6 text-left" id="mock-interview-coaching-module">
      
      {/* Intro Configuration Panel */}
      <div className="bg-slate-950/90 border border-emerald-500/20 rounded p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-md uppercase tracking-widest font-black text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            // NEURAL SIMULATED INTERVIEW INTERFACE
          </h2>
          <p className="text-xs text-emerald-500/60 mt-1 leading-relaxed">
            Choose an active Agent or Guide from the network. Plug-in your webcam system and speak or write responses to proceed with diagnostics.
          </p>
        </div>

        {!interviewStarted && (
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/50">TARGET_ROLE</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-slate-900 border border-emerald-500/30 text-xs px-3 py-2 rounded text-emerald-400 font-mono font-bold outline-none focus:border-emerald-400"
                id="select-interview-role"
              >
                <option value="Software Engineer">Software Engineer (SWE)</option>
                <option value="Product Manager">Product Manager (PM)</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="UX/UI Designer">UX/UI Designer</option>
                <option value="Security Architect">Security Architect</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/50">ACTIVE_RECRUITER</span>
              <select
                value={selectedChar.id}
                onChange={(e) => {
                  const match = CHARACTERS.find((c) => c.id === e.target.value);
                  if (match) setSelectedChar(match);
                }}
                className="bg-slate-900 border-2 text-xs px-3 py-1.5 rounded text-white font-mono font-bold outline-none"
                style={{ borderColor: selectedChar.hexColor + "40" }}
              >
                {CHARACTERS.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name} ({char.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={startNewSession}
              className="mt-4 md:mt-0 px-6 py-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border-2 border-emerald-500/50 text-xs font-black uppercase tracking-widest rounded transition duration-150 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              id="btn-start-interview"
            >
              INITIALIZE_LOG: LINK_START
            </button>
          </div>
        )}
      </div>

      {interviewStarted ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Main Recruiter Conversation & Visual feeds */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Split visuals: AI Recruiter Screen alongside Ourself Candidate Screen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* AI CHARACTER SCREEN PROFILE */}
              <div 
                className="bg-slate-950 border-2 rounded p-4 flex flex-col justify-between items-center text-center h-[240px] relative overflow-hidden"
                style={{ borderColor: selectedChar.hexColor + "30" }}
              >
                {/* Horizontal digital static overlay bar */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/10 animate-scan"></div>
                
                <div className="flex justify-between items-center w-full text-left">
                  <div>
                    <span 
                      className="text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded"
                      style={{ backgroundColor: selectedChar.hexColor + "15", color: selectedChar.hexColor }}
                    >
                      AI_UNIT: {selectedChar.id.toUpperCase()}
                    </span>
                    <h4 className="text-white text-xs font-black uppercase block mt-1">{selectedChar.name}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                    <span className="text-[8px] font-mono select-none">SCAN_FEED</span>
                  </div>
                </div>

                {/* Pulsating ASCII Avatar sphere representing voice core */}
                <div className="flex flex-col items-center justify-center my-2 gap-1 relative">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner border border-emerald-500/20 relative animate-pulse"
                    style={{ 
                      boxShadow: `0 0 20px ${selectedChar.hexColor}25`,
                      backgroundColor: selectedChar.hexColor + "08"
                    }}
                  >
                    <span>{selectedChar.avatarSymbol}</span>
                    <div 
                      className="absolute inset--1 rounded-full border border-dashed animate-spin duration-10000"
                      style={{ borderColor: selectedChar.hexColor + "40" }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-zinc-400 italic mt-2 max-w-[220px] line-clamp-2 leading-relaxed">
                    "{selectedChar.vibe}"
                  </span>
                </div>

                {/* Speacking sound level animation representation */}
                <div className="flex gap-1 justify-center items-center h-4 w-full">
                  <span className="text-[8px] text-emerald-500/40 font-mono uppercase tracking-widest mr-2 select-none">Voice:</span>
                  {[1, 2, 3, 4, 5, 4, 3, 2, 3, 5, 2, 1].map((lvl, index) => (
                    <span 
                      key={index}
                      className="w-1 bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ 
                        height: loadingQuestion ? `${Math.random() * 8 + 2}px` : "3px",
                        backgroundColor: selectedChar.hexColor
                      }}
                    ></span>
                  ))}
                </div>
              </div>

              {/* OURSELF CANDIDATE SCREEN (Webcam view / Oscilloscope Fallback) */}
              <div className="bg-slate-950 border-2 border-emerald-500/15 rounded p-4 flex flex-col justify-between items-center text-center h-[240px] relative overflow-hidden">
                <div className="flex justify-between items-center w-full text-left">
                  <div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded">
                      CANDIDATE_LINK: COGNITIVE_MIRROR
                    </span>
                    <h4 className="text-white text-xs font-black uppercase block mt-1">GLAINE JUSTIN (Candidate)</h4>
                  </div>
                  
                  {/* Camera toggle switches */}
                  <button
                    onClick={() => {
                      if (cameraActive) {
                        stopCameraStream();
                      } else {
                        startCameraStream();
                      }
                    }}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 transition"
                    title={cameraActive ? "Turn Cam Off" : "Turn Cam On"}
                  >
                    {cameraActive ? <Camera className="w-4.5 h-4.5 text-emerald-400" /> : <CameraOff className="w-4.5 h-4.5 text-slate-500" />}
                  </button>
                </div>

                {/* Webcam viewport mirror styled with custom matrix green digital tint filter */}
                <div className="w-full h-32 flex justify-center items-center my-1 rounded border border-emerald-500/10 relative overflow-hidden bg-[#020617]">
                  
                  {cameraActive ? (
                    <>
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover grayscale sepia hue-rotate-[90deg] saturate-[300%] brightness-[1.1]"
                      />
                      {/* Grid scanning line effect overlay */}
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]"></div>
                    </>
                  ) : (
                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-full" 
                      width={300} 
                      height={120} 
                    />
                  )}
                </div>

                <div className="w-full flex justify-between items-center text-[9px] font-mono text-emerald-500/50">
                  <span>CAMERA: {cameraActive ? "ESTABLISHED" : "Biometrics terminal"}</span>
                  <span>CIPHER: GCM_256_NEURAL</span>
                </div>
              </div>

            </div>

            {/* Main Chat Box Container */}
            <div className="bg-slate-950/80 border-2 border-emerald-500/15 rounded p-5 shadow-lg flex flex-col justify-between min-h-[460px]">
              
              <div className="space-y-4">
                
                {/* Panel bar */}
                <div className="flex justify-between items-center bg-slate-900 border-b border-emerald-500/10 p-3 rounded-t text-left">
                  <div>
                    <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest font-black block">// TRANSMISSION_LINE</span>
                    <h3 className="text-xs text-white font-black uppercase flex items-center gap-1.5">
                      Recruitment session in voice parameter: {role}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Speech mute button */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="px-2.5 py-1 text-[10px] font-mono uppercase bg-slate-950 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 flex items-center gap-1.5 transition rounded"
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-500" />
                          Muted
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          unmuted
                        </>
                      )}
                    </button>

                    <button
                      onClick={startNewSession}
                      className="text-[10px] bg-slate-950 border border-emerald-500/20 hover:bg-emerald-950 text-slate-300 py-1.5 px-3 rounded flex items-center gap-1.5 transition-all"
                      id="btn-relaunch-interview"
                    >
                      <RefreshCw className="w-3 h-3 text-emerald-500" />
                      Reset feed
                    </button>
                  </div>
                </div>

                {/* Message Streams Feed */}
                <div className="h-80 overflow-y-auto scrollbar-thin space-y-4 p-3 bg-slate-950 border border-emerald-500/10 rounded font-mono text-xs text-left">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                      
                      {m.sender === "ai" && (
                        <div 
                          className="w-8 h-8 rounded border flex items-center justify-center shrink-0"
                          style={{ 
                            backgroundColor: selectedChar.hexColor + "10", 
                            borderColor: selectedChar.hexColor + "40",
                            color: selectedChar.hexColor
                          }}
                        >
                          <Cpu className="w-4 h-4 animate-pulse" />
                        </div>
                      )}

                      <div className={`p-4 rounded max-w-[85%] space-y-1.5 border ${
                        m.sender === "user"
                          ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-900/50 text-slate-200 border-emerald-500/10"
                      }`}>
                        <p className="leading-relaxed whitespace-pre-line text-[11px] font-medium leading-relaxed font-mono">
                          {m.text}
                        </p>
                        
                        <div className="flex justify-between items-center text-[8px] opacity-50 mt-1 font-mono">
                          <span className="uppercase text-emerald-500/60 font-black">
                            {m.sender === "user" ? "// CANDIDATE_OUT" : `// RESPONSE_${selectedChar.id.toUpperCase()}`}
                          </span>
                          <span>{m.timestamp}</span>
                        </div>
                      </div>

                      {m.sender === "user" && (
                        <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}

                    </div>
                  ))}
                  
                  {loadingQuestion && (
                    <div className="flex gap-3 justify-start items-center text-emerald-500/50 text-[10px] font-mono p-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>{selectedChar.name.toUpperCase()} RE-EVALUATING QUERY ALGORITHMS...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Answer Workbench Area */}
              <div className="mt-4 space-y-3">
                
                <div className="flex justify-between items-center text-[10px] font-mono text-emerald-500/80 px-1">
                  <span>// RECONSTRUCT OR TYPE CANDIDATE DECRYPTION ARGUMENT</span>
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter response, or tap speech dictation to capture biometric auditory input..."
                    className="flex-1 bg-slate-900 border border-emerald-500/15 rounded p-3 text-xs text-emerald-300 placeholder-emerald-900/40 focus:border-emerald-500 outline-none resize-none h-20 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        transmitAnswerAndGetNext();
                      }
                    }}
                    id="textarea-interview-answer"
                  />
                  
                  <div className="flex flex-col gap-1.5 justify-center">
                    
                    {/* Speech Recognition STT Toggle Microphone button */}
                    <button
                      onClick={isListening ? stopSTTListening : startSTTListening}
                      className={`p-3 rounded transition-all border flex items-center justify-center ${
                        isListening
                          ? "bg-red-950 border-red-500 text-red-400 animate-pulse"
                          : "bg-emerald-950 hover:bg-emerald-900 border-emerald-500/30 text-emerald-400"
                      }`}
                      title={isListening ? "Listening... Click to lock" : "Auditory input dictation (Microphone)"}
                    >
                      {isListening ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5 text-emerald-500/70" />}
                    </button>

                    <button
                      onClick={transmitAnswerAndGetNext}
                      disabled={!userInput.trim() || loadingQuestion}
                      className="p-3 bg-emerald-950 hover:bg-emerald-900 border-2 border-emerald-500/50 disabled:bg-slate-900 disabled:border-slate-800 disabled:text-slate-700 text-emerald-400 rounded transition"
                      title="Transmit Answer Node"
                      id="btn-submit-answer"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>

                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] text-emerald-500/40 px-1 gap-2">
                  <span>- ENTER: Transmission. SHIFT+ENTER: Segment lines.</span>
                  
                  {/* Green coach evaluation widget triggers */}
                  <button
                    onClick={evaluateAnswerWithCoach}
                    disabled={messages.filter((m) => m.sender === "user").length === 0 || loadingEvaluation}
                    className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:bg-transparent border border-emerald-500/40 text-emerald-300 rounded font-black uppercase text-[8px] tracking-widest transition"
                    id="btn-evaluate-answer"
                  >
                    🚀 ANALYZE NEURAL ALIGNMENT &raquo; SECURE COACH DIAGNOSTICS (🌟)
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* AI Career Coach Scorecard & STAR Optimization Review Panel */}
          <div className="xl:col-span-4 text-left">
            {loadingEvaluation ? (
              <div className="bg-slate-950 border-2 border-emerald-500/10 rounded p-12 text-center text-slate-350 shadow-lg min-h-[500px] flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
                <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-widest">ALUMNI_AI: SECURING SCORECARD</h3>
                <p className="text-[10px] text-emerald-500/55 mt-2 max-w-xs leading-relaxed font-mono">
                  CORRELATING STRUCTURAL TOKENS, EXAMINING METRIC RATIOS, AND COMPILING STAR SYNTAX...
                </p>
              </div>
            ) : currentEvaluation ? (
              <div className="bg-slate-950/90 border-2 border-emerald-500/20 rounded p-5 shadow-xl space-y-6 animate-in fade-in duration-300 min-h-[500px]">
                
                {/* Score Section */}
                <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
                  <div>
                    <h3 className="font-black text-white text-xs uppercase tracking-wider">NEURAL_DECRYPTION_INDEX</h3>
                    <p className="text-[8px] text-emerald-500/60 mt-0.5 font-mono uppercase tracking-wide">// RECRUITMENT QUALITY METRICS</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-black text-emerald-450 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                      {currentEvaluation.score}
                    </span>
                    <span className="text-emerald-500/50 font-mono text-xs">/100</span>
                  </div>
                </div>

                {/* Score badge tier */}
                <div className="bg-slate-900 border border-emerald-500/10 p-2 text-center rounded">
                  <span className={`text-[9px] font-mono font-black uppercase tracking-widest ${
                    currentEvaluation.score >= 85 ? "text-emerald-400" : currentEvaluation.score >= 65 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {currentEvaluation.score >= 85 
                      ? "🏆 CLASS_S_PERFECTION Tier" 
                      : currentEvaluation.score >= 65 
                        ? "👍 POLISHED_CORE (MID_WARNING)" 
                        : "🚨 CRITICAL_RELOG_SCHEMA_FAIL"}
                  </span>
                </div>

                {/* Bullets highlighting good points & weak areas */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-emerald-450 uppercase tracking-widest block flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-450" />
                      STRENGTHS_VERIFIED
                    </span>
                    <ul className="space-y-1 text-slate-350 text-[11px] font-mono leading-relaxed">
                      {currentEvaluation.goodPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-1 p-1 rounded hover:bg-emerald-950/20 transition-all">
                          <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 border-t border-emerald-500/10 pt-3">
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      VULNERABILITIES_LOGGED
                    </span>
                    <ul className="space-y-1 text-slate-350 text-[11px] font-mono leading-relaxed">
                      {currentEvaluation.weakAreas.map((pt, i) => (
                        <li key={i} className="flex items-start gap-1 p-1 rounded hover:bg-red-950/10 transition-all">
                          <span className="text-red-400 shrink-0 font-bold">!</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Beautiful STAR response optimization proposal */}
                <div className="space-y-2 border-t border-emerald-500/10 pt-4">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    GOLD_STANDARD_ZION_PROT_SCHEMA
                  </span>
                  <p className="text-[9px] text-emerald-500/50 leading-relaxed font-mono">
                    IMPLEMENT THE FOLLOWING STAR PHRASES STRUCTURE TO MAXIMIZE DOCK ADMISSION RATES:
                  </p>
                  <div className="bg-slate-900 border border-emerald-500/10 p-4 rounded text-emerald-300 text-xs leading-relaxed max-h-52 overflow-y-auto scrollbar-thin whitespace-pre-line text-left font-mono">
                    {currentEvaluation.suggestedAnswer}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-950 border border-emerald-500/10 rounded-xl p-12 text-center text-slate-400 shadow-lg min-h-[500px] flex flex-col justify-center items-center relative overflow-hidden">
                <HelpCircle className="w-12 h-12 text-emerald-500/20 mb-3 animate-bounce" />
                <h3 className="font-bold text-slate-300 uppercase tracking-widest text-xs">AWAITING SCORE DIALECT</h3>
                <p className="text-[10px] text-emerald-500/50 max-w-xs mx-auto mt-2 leading-relaxed font-mono">
                  SUBMIT ARGUMENTS AND PRESS THE <b>CHALLENGE DIAGNOSTICS WIDGET</b> OPTION ABOVE TO POPULATE AUDIT LOGS.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-slate-950 border-2 border-dashed border-emerald-500/15 rounded p-20 text-center text-slate-400 shadow-lg min-h-[480px] flex flex-col justify-center items-center relative overflow-hidden">
          <Volume2 className="w-16 h-16 text-emerald-500/20 mb-4 animate-pulse" />
          <h3 className="font-bold text-slate-250 uppercase tracking-widest text-sm">SIMULATION COLD STATE</h3>
          <p className="text-[10px] text-emerald-500/55 max-w-sm mx-auto mt-2 leading-relaxed font-mono">
            SETUP DESIRED EXPERIMENTAL PARAMETERS ABOVE AND CLICK "LINK START" TO ESTABLISH TRANSMISSION FROM NEURAL SERVER.
          </p>
        </div>
      )}
    </div>
  );
}
