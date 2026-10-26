"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, CheckCircle2, AlertTriangle, FileX, Info } from "lucide-react";
import Link from "next/link";
import { ResumeScannerAnimation } from "@/components/ResumeScannerAnimation";

export default function ResumePage() {

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<{ skills?: string[], experience_years?: number | string, name?: string, education?: string[], experience_details?: string[] } | null>(null);

  const validateSelectedFile = (selectedFile: File): boolean => {
    const isPdfType = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdfType) {
      setError("Invalid file type. Only PDF documents (.pdf) are supported. Please upload a proper PDF resume.");
      setFile(null);
      return false;
    }

    const MAX_SIZE_MB = 5;
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size restricted: Uploaded file (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB) exceeds the ${MAX_SIZE_MB} MB maximum limit. Please select a smaller PDF file.`);
      setFile(null);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setError("");
      setSuccess(false);
      if (validateSelectedFile(selected)) {
        setFile(selected);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setError("");
      setSuccess(false);
      if (validateSelectedFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a valid PDF file first.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Only PDF files are supported. Please select a proper PDF document.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    setParsedData(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload and validate resume file.");
      }

      setSuccess(true);

      if (data.resume?.parsedData) {
        try {
          const parsed = typeof data.resume.parsedData === "string" 
            ? JSON.parse(data.resume.parsedData) 
            : data.resume.parsedData;
          setParsedData(parsed);
        } catch {
          setParsedData(null);
        }
      }
    } catch (err) {
      setError((err as Error).message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Resume</h1>
        <p className="text-muted-foreground mt-2">
          Let our AI analyze your CV to generate personalized mock interview questions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-card border shadow-sm h-fit space-y-6">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="resume-upload" className="text-base font-semibold">Select PDF Resume</Label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:bg-muted/50"
                }`}
              >
                <UploadCloud className={`h-10 w-10 mb-4 ${dragActive ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer text-sm font-medium text-primary hover:underline"
                >
                  Click to browse file
                </label>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {file ? file.name : "or drag and drop your PDF resume file here"}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary">
                  <span>PDF Document</span>
                  <span>&bull;</span>
                  <span>Max Size: 5 MB</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium space-y-2 animate-in fade-in">
                <div className="flex items-center space-x-2 font-semibold text-red-600 dark:text-red-400">
                  <FileX className="h-5 w-5 shrink-0" />
                  <span>Document Restricted / Interview Setup Blocked</span>
                </div>
                <p className="text-xs leading-relaxed text-red-700 dark:text-red-300 font-normal">
                  {error}
                </p>
                <div className="flex items-center text-[11px] text-red-600/80 dark:text-red-400/80 pt-2 border-t border-destructive/20 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5 shrink-0 text-red-500" />
                  <span>Interview setup is denied until a valid, appropriate candidate resume PDF is uploaded.</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !file}>
              {loading ? "Validating & Analyzing Document..." : "Upload & Analyze Resume"}
            </Button>
          </form>
        </div>

        <div>
          {loading ? (
            <ResumeScannerAnimation fileName={file?.name} />
          ) : success && parsedData ? (
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center space-x-2 mb-6">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-green-700">Resume Validated & Analyzed</h2>
              </div>
              
              <div className="space-y-4">
                {parsedData.name && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Candidate Name</h3>
                    <p className="text-sm font-medium">{parsedData.name}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Extracted Skills</h3>
                  {parsedData.skills && parsedData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-background rounded-full text-sm border shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No explicit technical skills detected in document.</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Years of Experience</h3>
                    <p className="text-sm bg-background p-3 rounded-lg border shadow-sm">
                      {parsedData.experience_years ?? 0} Years
                    </p>
                  </div>
                  {parsedData.education && parsedData.education.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Education</h3>
                      <p className="text-sm bg-background p-3 rounded-lg border shadow-sm">
                        {parsedData.education[0]}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Education</h3>
                      <p className="text-sm bg-background p-3 rounded-lg border shadow-sm italic text-muted-foreground">
                        Not specified
                      </p>
                    </div>
                  )}
                </div>

                {parsedData.experience_details && parsedData.experience_details.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Experience Details</h3>
                    <ul className="text-sm bg-background p-3 rounded-lg border shadow-sm space-y-1 list-disc list-inside">
                      {parsedData.experience_details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4">
                  <Link href="/interview/setup">
                    <Button className="w-full shadow-md">Continue to Interview Setup</Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border rounded-2xl bg-muted/20 flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[350px]">
              <UploadCloud className="w-12 h-12 mb-3 text-muted-foreground/40" />
              <p className="font-medium text-foreground mb-1">No Resume Analyzed Yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Upload your PDF resume on the left to activate our AI document scanner & resume validator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
