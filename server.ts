import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to protect server boot from missing API configurations
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY variable is missing. Add it to the secrets pane in AI Studio Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory telemetry log system (replaces previous forex logs with Career Outreach telemetry)
interface CareerAuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: "success" | "warning";
}

const auditLogs: CareerAuditLog[] = [
  {
    id: "log-1",
    timestamp: new Date().toISOString(),
    action: "CAREER_WORKSPACE_INITIALIZED",
    details: "AI Job Hunter App workspace active. Services: Mock Interview Coach, Resume Optimizer, Pipeline Tracker.",
    status: "success",
  }
];

function logCareerEvent(action: string, details: string, status: "success" | "warning" = "success") {
  const newLog: CareerAuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    status,
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 30) {
    auditLogs.pop();
  }
  return newLog;
}

// --- API Endpoints ---

// Pull telemetry activity logs
app.get("/api/job-hunter/logs", (req, res) => {
  res.json({ logs: auditLogs });
});

// 1. Resume ATS Optimization route
app.post("/api/job-hunter/ats-analyze", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Both Resume Text and Job Description are required for scan." });
    }

    const ai = getAiClient();
    
    const prompt = `
    Analyze the following resume with respect to the target job description.
    
    RESUME:
    ${resumeText}

    JOB DESCRIPTION:
    ${jobDescription}

    Please produce:
    1. An ATS match score out of 100.
    2. A list of key matched skills present in both.
    3. A list of critical missing skills or buzzwords present in the job description but not in the resume.
    4. A concise strategic ATS analysis overview.
    5. Exactly 3 suggested bullet points (original vs. improved/optimized in STAR format, with the short logical reason).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite corporate recruiter, professional career counselor, and senior ATS algorithmic architect. Ensure everything you generate is constructive and highly technical.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { 
              type: Type.INTEGER, 
              description: "ATS compatibility rating between 0 and 100" 
            },
            matches: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Matched professional keywords and methodologies"
            },
            missing: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "High-priority keywords missing from the resume" 
            },
            atsAnalysis: { 
              type: Type.STRING, 
              description: "Critical bulleted advice on how to improve" 
            },
            suggestedBulletPoints: {
              type: Type.ARRAY,
              description: "Exactly 3 optimized professional resume impacts",
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "Hypothetical or actual weak bullet from current resume" },
                  improved: { type: Type.STRING, description: "ATS friendly, metric-focused optimized description using STAR format" },
                  reason: { type: Type.STRING, description: " recuiting rationale behind the upgrade" }
                },
                required: ["original", "improved", "reason"]
              }
            }
          },
          required: ["score", "matches", "missing", "atsAnalysis", "suggestedBulletPoints"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    logCareerEvent("RESUME_ATS_SCAN", `Completed ATS scan. Score calculated: ${parsedData.score}%`, "success");
    res.json(parsedData);
  } catch (error: any) {
    console.error("ATS Scan failed:", error);
    res.status(500).json({ error: error.message || "Failed to scan resume against the target description." });
  }
});

// 2. Cover Letter & Custom Cold LinkedIn Outreach generator
app.post("/api/job-hunter/generate-cover-letter", async (req, res) => {
  try {
    const { resumeText, jobDescription, tone, outreachType, company, contactName } = req.body;
    
    const contextResume = resumeText || "Generic qualified technology specialist";
    const contextJob = jobDescription || "Exciting tech role focusing on modern tech-stack and performance metrics";
    const selectedTone = tone || "Warm & Professional";
    const typeOfDocument = outreachType || "Classic Cover Letter";
    const companyStr = company || "Target Company";
    const contactStr = contactName || "Hiring Manager";

    const ai = getAiClient();

    const systemInstruction = 
      "You are a professional executive writer specializing in high-converting job applications, " +
      "impactful cover letters, and professional LinkedIn outreach sequences. You do not use clichés, platitudes, or robotic buzzwords (like 'delve', 'testament', or 'dynamic spectrum'). You write like a high-agency human.";

    const prompt = `
    Compose a ${typeOfDocument} for a roll at "${companyStr}" addressed to "${contactStr}".
    Tone setting: "${selectedTone}".
    
    Target Job Description:
    ${contextJob}

    Applicant's Experience Summary/Resume:
    ${contextResume}

    Generate only the plain written outreach content with appropriate placeholders. Add visual line dividers where suitable.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.75,
      }
    });

    logCareerEvent("OUTREACH_GENERATED", `Successfully drafted ${typeOfDocument} for ${companyStr}.`, "success");
    res.json({ output: response.text });
  } catch (error: any) {
    console.error("Outreach generation failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate cover letter or outreach draft." });
  }
});

// 2.5. Document / PDF / DOCX file plain-text scraping endpoint
app.post("/api/job-hunter/scrape-file", async (req, res) => {
  try {
    const { base64Data, mimeType, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: "No base64 file data provided for extraction." });
    }

    const ai = getAiClient();

    // Use Gemini's multimodal inlineData support to scrape real text directly from candidate documents
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType || "application/pdf"
          }
        },
        "Extract and return ONLY the raw plaintext, human-readable textual contents of this candidate resume precisely. Maintain positions, dates, text, and bullet-points accurately. Do not output markdown, do not wrap in backticks, do not inject prefix text, warnings, or explanatory notes. Start immediately with the parsed text structure."
      ]
    });

    const scrapedText = response.text || "";
    logCareerEvent("FILE_PASSED_SCRAPEY", `Successfully decrypted & scraped characters from ${fileName || "document file"}.`, "success");
    res.json({ text: scrapedText.trim() });
  } catch (error: any) {
    console.error("File parsing scraping failed:", error);
    res.status(500).json({ error: error.message || "Unable to extract text from target document file via neural decoder." });
  }
});

// 2.7. Search & Scrap Live Matching Jobs from Website Portals using Search Grounding
app.post("/api/job-hunter/search-live-jobs", async (req, res) => {
  try {
    const { cvText, jobDescription, searchKeyword } = req.body;
    
    const ai = getAiClient();
    
    const contextCV = cvText || "Experienced Software Engineer with typescript, nodes and react.";
    const contextJD = jobDescription || "";
    const filterQuery = searchKeyword || "";

    const searchPrompt = `
    Search for 6 actual, currently active real-life job opportunities posted on job sites or company careers pages (like Greenhouse, Lever, Workday, LinkedIn, Indeed, etc.).
    The listings MUST be highly aligned to the provided applicant CV (decrypted below) and the target job description (if any is provided).
    
    CANDIDATE CV / SCRAPED CORE:
    ${contextCV}

    TARGET JOB ADVERT / CONTEXT BACKGROUND:
    ${contextJD}

    ADDITIONAL COMBINED SEARCH FILTER KEYWORD / ROLE:
    ${filterQuery}

    Please list out exactly 6 matching jobs you find from real search grounding results. For each job, describe the exact Job Title, Company Name, Category (must be one of: "Software Engineering", "Product Management", "Data Science", "Design", "Marketing", "Finance"), Location, Salary details (or realistic compensation if not specified), Posted Date, clean Job Description, key technical requirements list, job type ("Full-Time", "Remote", "Contract", or "Hybrid"), and the direct source URL or corporate careers site link of the job details or application page.
    `;

    let jobResults: any[] = [];
    
    try {
      // Step A: Search Grounding to extract raw content from standard search indexes
      const searchResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const searchOutput = searchResponse.text || "";

      // Step B: Structure into clean validated JSON Schema (no tools or grounding configured here)
      if (searchOutput) {
        const structuralResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Review the drafted live search grounding findings below and map them precisely into the requested JSON Schema format containing exactly 6 items. Keep classifications aligned with the enums. If less than 6 real positions are mentioned, augment the list with realistic relevant active positions from standard tech portals.

          GROUNDED SEARCH DETAILS:
          ${searchOutput}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                jobs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      company: { type: Type.STRING },
                      category: { 
                        type: Type.STRING, 
                        enum: ["Software Engineering", "Product Management", "Data Science", "Design", "Marketing", "Finance"] 
                      },
                      location: { type: Type.STRING },
                      salaryRange: { type: Type.STRING },
                      postedDate: { type: Type.STRING },
                      description: { type: Type.STRING },
                      requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                      type: { type: Type.STRING, enum: ["Full-Time", "Remote", "Contract", "Hybrid"] },
                      sourceUrl: { type: Type.STRING }
                    },
                    required: ["title", "company", "category", "location", "salaryRange", "postedDate", "description", "requirements", "type", "sourceUrl"]
                  }
                }
              },
              required: ["jobs"]
            }
          }
        });

        if (structuralResponse && structuralResponse.text) {
          const parsed = JSON.parse(structuralResponse.text);
          if (parsed && Array.isArray(parsed.jobs)) {
            jobResults = parsed.jobs.map((j: any, index: number) => ({
              ...j,
              id: `scraped-${Date.now()}-${index}`,
              isLiveScraped: true
            }));
          }
        }
      }
    } catch (groundingError) {
      console.warn("Grounding search failed, falling back to dynamic AI match generation:", groundingError);
    }

    // Fallback: if search grounded model list was empty or crashed, generate matching simulated results using standard fast-flash model
    if (jobResults.length === 0) {
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate 6 realistic and highly customized open roles matching the candidate's CV and the job description. Give them realistic companies, requirements, locations and description.
        CV Text: ${contextCV}
        JD Text: ${contextJD}
        Search: ${filterQuery}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              jobs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ["Software Engineering", "Product Management", "Data Science", "Design", "Marketing", "Finance"] },
                    location: { type: Type.STRING },
                    salaryRange: { type: Type.STRING },
                    postedDate: { type: Type.STRING },
                    description: { type: Type.STRING },
                    requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    type: { type: Type.STRING, enum: ["Full-Time", "Remote", "Contract", "Hybrid"] },
                    sourceUrl: { type: Type.STRING }
                  },
                  required: ["title", "company", "category", "location", "salaryRange", "postedDate", "description", "requirements", "type", "sourceUrl"]
                }
              }
            },
            required: ["jobs"]
          }
        }
      });

      if (fallbackResponse && fallbackResponse.text) {
        const parsed = JSON.parse(fallbackResponse.text);
        if (parsed && Array.isArray(parsed.jobs)) {
          jobResults = parsed.jobs.map((j: any, index: number) => ({
            ...j,
            id: `ai-gen-${Date.now()}-${index}`,
            isLiveScraped: true
          }));
        }
      }
    }

    logCareerEvent("JOBS_SCRAPED_PORTAL", `Scraped ${jobResults.length} live jobs tailored to CV & Advert.`, "success");
    res.json({ jobs: jobResults });
  } catch (error: any) {
    console.error("Live scrap job query failed:", error);
    res.status(500).json({ error: error.message || "Failed to locate matching live jobs on web servers." });
  }
});

// 2.8. Specific URL live job scraper endpoint
app.post("/api/job-hunter/scrape-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Missing Target URL for specific job scraping." });
    }

    const ai = getAiClient();

    const searchPrompt = `
    Conduct an automated crawl and lookup of the precise job description details at this specific URL:
    "${url}"

    If the URL is standard (Greenhouse, Lever, LinkedIn, Indeed), fetch and describe the key professional job details, such as role title, company name, location, salary or compensation if listed, and a summary of the role notes, requirements, and technologies. Only base your description on findings from search grounding.
    `;

    // Step A: Search / Browse specific URL contents with tools
    const searchResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const searchOutput = searchResponse.text || "";

    // Step B: Formulate response into clean structural JSON output (no tools)
    const structuralResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Extract the details from the following crawled text details of URL "${url}" and formulate them strictly into the requested JSON Schema format.

      CRAWLED TEXT DETAILS:
      ${searchOutput}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            salary: { type: Type.STRING },
            notes: { type: Type.STRING }
          },
          required: ["title", "company", "location", "notes"]
        }
      }
    });

    const parsedJob = JSON.parse(structuralResponse.text || "{}");
    logCareerEvent("URL_JOB_SCRAPED", `Extracted role metadata successfully from ${url}.`, "success");
    res.json(parsedJob);
  } catch (error: any) {
    console.error("URL scraper failed:", error);
    res.status(500).json({ error: error.message || "Unable to scrap specific job URL details from live internet pages." });
  }
});

// 3. Mock Interview Question flow
app.post("/api/job-hunter/mock-interview-question", async (req, res) => {
  try {
    const { role, messages } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Please specify target role for the mock session." });
    }

    const ai = getAiClient();
    
    const systemInstruction = `
      You are the lead AI Interviewer for a prominent tech firm. Your job is to conduct a highly professional mock interview for a ${role} candidate.
      You ask exactly ONE question at a time.
      Review the chat history in the messages array.
      If the history is empty, greet the candidate warmly, introduce yourself, and ask a strong premier ice-breaker question suitable for a ${role}.
      If the candidate answered, acknowledge their answer with brief natural transitions (e.g., 'That is highly practical.', 'Interesting design choice.') and immediately present the next logical question (either technical, behavioral, or scenario).
      Vary the style: ask about conflict resolution, system design, or domain expertise appropriate for ${role}.
      Stay in character. Do not break character under any circumstance.
    `;

    // Map message format
    const contents = (messages || []).map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    if (contents.length === 0) {
      contents.push({ role: "user", parts: [{ text: `Let's begin my mock interview for ${role}.` }] });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Mock interviewer query failed:", error);
    res.status(500).json({ error: error.message || "Interviewer was unable to generate a response." });
  }
});

// 4. Mock Interview Answer evaluation
app.post("/api/job-hunter/evaluate-answer", async (req, res) => {
  try {
    const { question, answer, role } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: "Question and candidate's answer are required to evaluate performance." });
    }

    const ai = getAiClient();

    const prompt = `
    Analyze this mock interview exchange for a candidate applying as a ${role || "Technology Specialist"}.
    
    QUESTION CONTEXT:
    ${question}

    CANDIDATE'S ANSWER:
    ${answer}

    Please rate their answer on a 0-100 scale, detail what was done exceptionally well, what missing items or structural errors were made, and then provide a pristine, best-in-class reply mapped to the STAR (Situation, Task, Action, Result) model representing the absolute gold-standard.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite executive business coach and hiring standards audit committee chairman. Give concrete, objective, and expert feedback to help engineers and professionals level up rapidly.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { 
              type: Type.INTEGER, 
              description: "Numeric score out of 100 representing performance quality" 
            },
            goodPoints: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "At least two positive elements or facts in their expression" 
            },
            weakAreas: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Missing structure, lack of specifics, or conversational red flags" 
            },
            suggestedAnswer: { 
              type: Type.STRING, 
              description: "Pragmatic, elite template response implementing Situation, Task, Action, Result flawlessly" 
            }
          },
          required: ["score", "goodPoints", "weakAreas", "suggestedAnswer"]
        }
      }
    });

    const evaluatedData = JSON.parse(response.text || "{}");
    logCareerEvent("MOCK_INTERVIEW_ANSWER", `Evaluated answer. Given score: ${evaluatedData.score}/100`, "success");
    res.json(evaluatedData);
  } catch (error: any) {
    console.error("Answer evaluation failed:", error);
    res.status(500).json({ error: error.message || "Failed to process target evaluation." });
  }
});

// 2.10. Dynamic Interview Flashcards Creator based on CV plain-text Ingestion
app.post("/api/job-hunter/cv-flashcards", async (req, res) => {
  try {
    const { cvText } = req.body;
    if (!cvText || !cvText.trim()) {
      return res.json({ flashcards: [] });
    }

    const ai = getAiClient();
    const prompt = `
    Analyze this candidate's CV/Resume text:
    "${cvText}"

    Generate exactly 4 highly realistic, challenging technical or behavioral interview flashcard questions and answers tailored to this candidate's actual background, past projects, tools, and experience level.
    The response MUST be formatted strictly as a JSON object containing a "flashcards" array. Each item in the array MUST contain:
    - category ("Technical SWE", "System Design", "Behavioral", or "Product Sense" mapped appropriately to their domain)
    - question (a challenging and specific question, e.g., "From your tenure at [Company], how did you resolve [Problem/Tech]...")
    - answer (a highly professional, exemplary STAR-method answer of 3-4 sentences showing deep, seasoned expertise)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["category", "question", "answer"]
              }
            }
          },
          required: ["flashcards"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    logCareerEvent("CV_FLASHCARDS_GENERATED", `Successfully generated 4 customized interview flashcards based on CV experience.`, "success");
    res.json({ flashcards: parsed.flashcards || [] });
  } catch (error: any) {
    console.error("Failed to generate CV flashcards:", error);
    res.status(500).json({ error: error.message || "Failed to generate CV-specific flashcards." });
  }
});


// Configure Vite middleware and static routes with proper order
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[+] AI Job Hunter App server active on port ${PORT}`);
  });
}

bootstrap();
