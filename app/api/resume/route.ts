import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateSmartAIContent, parseAIJson } from "@/lib/ai";
import { processResumeRAG } from "@/lib/rag";

function safeDecode(text: string): string {
  if (!text) return "";
  try {
    return decodeURIComponent(text);
  } catch {
    return text.replace(/%20/g, " ").replace(/%0A/g, "\n").replace(/%[0-9A-F]{2}/gi, " ");
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Polyfill DOMMatrix for Node.js / Vercel Serverless environment if missing
  if (typeof (globalThis as any).DOMMatrix === "undefined") {
    class DOMMatrixPolyfill {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      m11 = 1; m12 = 0; m21 = 0; m22 = 1; m41 = 0; m42 = 0;
      multiply() { return this; }
      translate() { return this; }
      scale() { return this; }
      rotate() { return this; }
      inverse() { return this; }
      transformPoint(p: any) { return p; }
    }
    (globalThis as any).DOMMatrix = DOMMatrixPolyfill;
  }

  // Method 1: Try pdf-parse first (Fastest and most robust for Vercel Serverless)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParseModule = require("pdf-parse");
    let text = "";
    if (typeof pdfParseModule === "function") {
      const parsed = await pdfParseModule(buffer);
      text = parsed?.text || "";
    } else if (pdfParseModule?.PDFParse) {
      const parser = new pdfParseModule.PDFParse({ data: buffer });
      const parsed = await parser.getText();
      await parser.destroy?.().catch(() => {});
      text = parsed?.text || "";
    } else if (typeof pdfParseModule?.default === "function") {
      const parsed = await pdfParseModule.default(buffer);
      text = parsed?.text || "";
    }
    if (text && text.trim().length > 20) {
      return text;
    }
  } catch (e) {
    console.warn("pdf-parse parser note:", e);
  }

  // Method 2: Try pdf2json with safe decoding
  try {
    const text = await new Promise<string>((resolve, reject) => {
      import("pdf2json").then(({ default: PDFParser }) => {
        const pdfParser = new (PDFParser as any)(null, 1);
        pdfParser.on("pdfParser_dataError", (err: any) => reject(err?.parserError || err));
        pdfParser.on("pdfParser_dataReady", () => {
          try {
            const raw = pdfParser.getRawTextContent();
            resolve(raw || "");
          } catch (rErr) {
            reject(rErr);
          }
        });
        pdfParser.parseBuffer(buffer);
      }).catch(reject);
    });

    const decoded = safeDecode(text);
    if (decoded.trim().length > 20) {
      return decoded;
    }
  } catch (e) {
    console.warn("pdf2json parser note:", e);
  }

  // Method 3: Clean UTF-8 text extraction from PDF stream buffer
  const rawString = buffer.toString("binary");
  const sanitizedRaw = rawString
    .replace(/\/Type|\/Page|\/Pages|\/Font|\/Catalog|\/Contents|\/MediaBox|\/Parent|\/Resources|\/Filter|\/Length|\/Width|\/Height/gi, " ")
    .replace(/stream[\s\S]*?endstream/gi, " ")
    .replace(/\b(obj|endobj|xref|trailer|startxref)\b/gi, " ");

  const matches = sanitizedRaw.match(/[a-zA-Z]{3,}/g) || [];
  const textFromStream = matches.join(" ");

  if (textFromStream.trim().length > 40) {
    return textFromStream.slice(0, 4000);
  }

  return "";
}

interface ResumeValidationResult {
  isResume: boolean;
  hasInappropriateContent: boolean;
  reason?: string;
  parsedAI?: {
    name?: string;
    skills?: string[];
    education?: string[];
    experience_years?: number;
    experience_details?: string[];
  };
}

async function validateAndParseResumeWithAI(resumeText: string): Promise<ResumeValidationResult> {
  const trimmed = (resumeText || "").trim();

  // 1. Hard check: If text is empty or very short (< 20 chars)
  if (!trimmed || trimmed.length < 20) {
    return {
      isResume: false,
      hasInappropriateContent: false,
      reason: "The uploaded PDF file contains no readable text or is corrupted/scanned without text layers. Please upload a clear text-based PDF resume/CV.",
    };
  }

  const lower = trimmed.toLowerCase();

  // Quick Non-resume document indicators (e.g. invoices, receipts, tax forms, billing)
  const nonResumeIndicators = [
    "invoice #", "bill to", "payment terms", "receipt #", "tax invoice", "order #",
    "subtotal", "vat rate", "amount due", "cooking instructions", "terms & conditions"
  ];

  if (nonResumeIndicators.some(kw => lower.includes(kw))) {
    return {
      isResume: false,
      hasInappropriateContent: false,
      reason: "Document Denied: The uploaded file appears to be an invoice, receipt, or billing statement rather than a candidate resume/CV.",
    };
  }

  // 2. Comprehensive AI Document Classification, Content Moderation, and Parsing
  const prompt = `Analyze the following document text extracted from an uploaded PDF file.
You are a strict HR document auditor and resume verification engine.

Tasks:
1. Determine if this document is a genuine candidate Resume / CV (curriculum vitae) containing candidate professional information, work experience, skills, education, or candidate summary.
   - If it is an academic paper, story, essay, code snippet, assignment, user manual, invoice, random article, or non-resume document, set "isResume": false.
2. Inspect the document for inappropriate, offensive, profane, toxic, or malicious content.
   - If present, set "hasInappropriateContent": true.
3. If it is NOT a resume or contains inappropriate content, provide a clear, polite explanation in "reason" why interview setup is restricted.
4. If it IS a valid resume, extract candidate details:
   - "name": candidate full name
   - "skills": array of technical and professional skills mentioned
   - "education": array of degrees/institutions
   - "experience_years": estimated total years of work experience (number)
   - "experience_details": array of key career achievements/roles

Return ONLY a valid JSON object with the exact schema:
{
  "isResume": boolean,
  "hasInappropriateContent": boolean,
  "reason": string,
  "name": string,
  "skills": string[],
  "education": string[],
  "experience_years": number,
  "experience_details": string[]
}

Document Text:
${trimmed.substring(0, 5000)}`;

  try {
    const text = await generateSmartAIContent({
      contents: prompt,
      systemInstruction: "You are a precise HR document compliance auditor that classifies uploaded PDFs and outputs raw JSON.",
      responseMimeType: "application/json",
    });

    const parsed = parseAIJson(text);
    if (parsed && typeof parsed === "object") {
      const isResume = Boolean(parsed.isResume);
      const hasInappropriateContent = Boolean(parsed.hasInappropriateContent);

      let reason = parsed.reason || "";
      if (!isResume && !reason) {
        reason = "Document Denied: The uploaded PDF is not a candidate resume/CV. Interview setup requires a valid resume detailing skills and experience.";
      } else if (hasInappropriateContent && !reason) {
        reason = "Document Restricted: The uploaded PDF contains inappropriate or prohibited content. Setting up an interview is denied.";
      }

      return {
        isResume,
        hasInappropriateContent,
        reason,
        parsedAI: {
          name: typeof parsed.name === "string" ? parsed.name : undefined,
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          education: Array.isArray(parsed.education) ? parsed.education : [],
          experience_years: typeof parsed.experience_years === "number" ? parsed.experience_years : undefined,
          experience_details: Array.isArray(parsed.experience_details) ? parsed.experience_details : [],
        },
      };
    }
  } catch (err) {
    console.warn("AI Document Validation Note:", err);
  }

  // Heuristic Fallback if AI call fails: check for key resume sections
  const resumeKeywords = ["experience", "education", "skills", "projects", "employment", "work history", "curriculum vitae", "resume", "bachelor", "master", "university", "engineer", "developer"];
  const matches = resumeKeywords.filter(kw => lower.includes(kw));

  if (matches.length < 2) {
    return {
      isResume: false,
      hasInappropriateContent: false,
      reason: "Document Denied: The uploaded PDF does not contain standard resume sections (skills, education, work experience). Please upload a valid candidate CV/resume.",
    };
  }

  return {
    isResume: true,
    hasInappropriateContent: false,
  };
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB maximum limit
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          message: `File size restricted: Uploaded document (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB maximum limit. Please upload a compressed or smaller PDF resume.` 
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File buffer exceeds the 5 MB maximum limit. Please upload a smaller PDF resume." },
        { status: 400 }
      );
    }

    let resumeText = "";
    try {
      resumeText = await extractTextFromPDF(buffer);
    } catch (extractErr) {
      console.warn("Resume text extraction note:", extractErr);
      resumeText = "";
    }

    // Perform AI Resume Content Validation & Document Classification
    const validation = await validateAndParseResumeWithAI(resumeText);
    if (!validation.isResume || validation.hasInappropriateContent) {
      return NextResponse.json(
        {
          error: validation.hasInappropriateContent ? "INAPPROPRIATE_CONTENT" : "INVALID_RESUME",
          message: validation.reason || "Document Denied: The uploaded file is not a valid candidate resume or contains inappropriate content. Interview setup is restricted.",
          isResume: false,
          hasInappropriateContent: validation.hasInappropriateContent,
        },
        { status: 400 }
      );
    }

    // Ensure database user exists (Search by ID or Email first to avoid Unique Constraint collision)
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: user.email || "" },
        ],
      },
    }).catch(() => null);

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Candidate",
        },
      }).catch(async () => {
        return await prisma.user.findFirst({ where: { email: user.email || "" } });
      });
    }

    if (!dbUser) {
      return NextResponse.json({ message: "User not found in DB" }, { status: 404 });
    }

    const ragData = processResumeRAG(resumeText, "Software Engineer Tech Profile");

    // Populate extracted candidate info from AI validation result
    const aiParsed = validation.parsedAI;
    let parsedData: {
      name?: string;
      skills?: string[];
      education?: string[];
      experience_years?: number;
      experience_details?: string[];
      raw_text?: string;
      rag_chunks?: string[];
    } = {
      name: aiParsed?.name || dbUser.name || user.user_metadata?.full_name || "Candidate",
      skills: aiParsed?.skills || [],
      education: aiParsed?.education || [],
      experience_years: aiParsed?.experience_years ?? 1,
      experience_details: aiParsed?.experience_details || [],
      raw_text: resumeText.slice(0, 5000),
      rag_chunks: ragData.chunks.map(c => c.content),
    };

    // Heuristic Fallback for skills if AI extraction produced an empty skills array
    if (!parsedData.skills || parsedData.skills.length === 0) {
      const knownTech = [
        "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express", "Python",
        "Java", "C++", "C#", "Go", "Rust", "HTML", "CSS", "Tailwind", "SQL", "PostgreSQL",
        "MySQL", "MongoDB", "Redis", "AWS", "Azure", "Docker", "Kubernetes", "Git", "GitHub",
        "REST API", "GraphQL", "CI/CD", "Linux", "Machine Learning", "Data Analysis",
        "Problem Solving", "Software Engineering", "Agile", "Scrum", "Communication"
      ];
      const matchedSkills = knownTech.filter(tech =>
        new RegExp(`\\b${tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, "i").test(resumeText)
      );
      parsedData.skills = matchedSkills.length > 0 ? matchedSkills : ["Software Engineering", "Problem Solving", "Web Development"];
    }

    if (!parsedData.education || parsedData.education.length === 0) {
      parsedData.education = ["Bachelor's Degree / Higher Education"];
    }

    if (!parsedData.experience_details || parsedData.experience_details.length === 0) {
      parsedData.experience_details = ["Software development & systems experience"];
    }

    // Save to database
    const savedResume = await prisma.resume.create({
      data: {
        userId: dbUser.id,
        fileUrl: file.name || "uploaded_resume.pdf",
        parsedData: JSON.stringify(parsedData),
      },
    });

    return NextResponse.json(
      {
        message: "Resume uploaded successfully",
        resume: savedResume,
        isResume: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error processing resume:", error);
    return NextResponse.json(
      { message: "An error occurred while processing the resume", error: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const latestResume = await prisma.resume.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestResume) {
      return NextResponse.json({ hasResume: false, resume: null }, { status: 200 });
    }

    let parsed = null;
    try {
      if (latestResume.parsedData) {
        parsed = JSON.parse(latestResume.parsedData);
      }
    } catch {
      parsed = null;
    }

    return NextResponse.json({
      hasResume: true,
      resume: {
        id: latestResume.id,
        fileUrl: latestResume.fileUrl,
        createdAt: latestResume.createdAt,
        parsedData: parsed,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching resume profile:", error);
    return NextResponse.json(
      { message: "Failed to fetch resume profile", error: error?.message },
      { status: 500 }
    );
  }
}
