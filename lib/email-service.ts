import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export async function sendInterviewReportEmail({
  interviewId,
  userEmail,
}: {
  interviewId: string;
  userEmail: string;
}) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not configured. Automated email skipped.");
      return { success: false, reason: "API_KEY_MISSING" };
    }

    const resend = new Resend(apiKey);

    const feedback = await prisma.feedback.findUnique({
      where: { interviewId },
      include: {
        interview: {
          include: {
            questions: {
              include: {
                answers: true,
              },
            },
          },
        },
      },
    });

    if (!feedback || !feedback.interview) {
      console.warn("Feedback or interview not found for automated email dispatch.");
      return { success: false, reason: "FEEDBACK_NOT_FOUND" };
    }

    const interview = feedback.interview;

    const transcriptHtml = interview.questions
      .map(
        (q, i) => `
        <div style="margin-bottom: 20px; border: 1px solid #E2E8F0; padding: 16px 20px; background-color: #FAFAFA; border-radius: 2px;">
          <p style="font-family: 'Arial', sans-serif; font-weight: 700; font-size: 14px; color: #1E2838; margin: 0 0 8px 0;">
            Question ${i + 1}: ${q.question}
          </p>
          <div style="font-family: 'Arial', sans-serif; font-size: 13px; color: #334155; background-color: #FFFFFF; padding: 12px; border-left: 3px solid #64748B; margin-top: 6px; line-height: 1.5;">
            <strong>Candidate Answer:</strong> ${q.answers[0]?.answer || "No response recorded."}
          </div>
        </div>
      `
      )
      .join("");

    function formatPointwiseHtml(text: string): string {
      if (!text) return "";
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const items = lines.map(line => {
        const clean = line.replace(/^[\-\*\u2022]\s*/, "");
        // Format markdown bold **text** to HTML <strong>text</strong>
        const htmlFormatted = clean.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return `<li style="margin-bottom: 8px; line-height: 1.5;">${htmlFormatted}</li>`;
      });
      return `<ul style="padding-left: 20px; margin: 6px 0 0 0;">${items.join("")}</ul>`;
    }

    // Strengths Section
    const strengthsHtml = formatPointwiseHtml(feedback.strengths);
    const weaknessesHtml = formatPointwiseHtml(feedback.weaknesses);
    const suggestionsHtml = formatPointwiseHtml(feedback.suggestions);

    const htmlContent = `
      <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 2px solid #1E2838; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        
        <!-- Classic Header Banner -->
        <div style="background-color: #1E2838; padding: 28px 32px; border-bottom: 4px solid #E2DACD; text-align: center;">
          <h1 style="color: #F9F7F3; font-family: 'Georgia', serif; font-size: 26px; font-weight: 700; letter-spacing: 1.5px; margin: 0; text-transform: uppercase;">
            Ai Interview Pro
          </h1>
          <p style="color: #E2DACD; font-family: 'Arial', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 6px 0 0 0;">
            Official Candidate Performance Evaluation Report
          </p>
        </div>

        <!-- Main Content Wrapper -->
        <div style="padding: 32px; font-family: 'Georgia', serif; color: #1E2838;">
          
          <!-- Candidate Summary Box -->
          <div style="border: 1px solid #E2DACD; background-color: #FAF8F5; padding: 20px 24px; margin-bottom: 28px; border-radius: 2px;">
            <table style="width: 100%; border-collapse: collapse; font-family: 'Arial', sans-serif; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #5B6B7C; font-weight: 600; width: 35%;">CANDIDATE EMAIL:</td>
                <td style="padding: 6px 0; color: #1E2838; font-weight: 700;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #5B6B7C; font-weight: 600;">EVALUATED ROLE:</td>
                <td style="padding: 6px 0; color: #1E2838; font-weight: 700;">${interview.role}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #5B6B7C; font-weight: 600;">TARGET COMPANY:</td>
                <td style="padding: 6px 0; color: #1E2838; font-weight: 700;">${interview.company || "Standard Technical Evaluation"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #5B6B7C; font-weight: 600;">INTERVIEW ROUND:</td>
                <td style="padding: 6px 0; color: #1E2838; font-weight: 700;">${interview.interviewType}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #5B6B7C; font-weight: 600;">ASSESSMENT DATE:</td>
                <td style="padding: 6px 0; color: #1E2838; font-weight: 700;">${new Date(interview.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 24px; border: 1px solid #D1FAE5; background-color: #F0FDF4; padding: 20px; border-left: 5px solid #059669;">
            <h3 style="font-family: 'Georgia', serif; font-size: 16px; color: #065F46; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">
              Key Demonstrated Strengths
            </h3>
            <div style="font-family: 'Arial', sans-serif; font-size: 13.5px; line-height: 1.6; color: #047857;">
              ${strengthsHtml}
            </div>
          </div>

          <!-- Areas for Growth Section -->
          <div style="margin-bottom: 24px; border: 1px solid #FEF3C7; background-color: #FFFBEB; padding: 20px; border-left: 5px solid #D97706;">
            <h3 style="font-family: 'Georgia', serif; font-size: 16px; color: #92400E; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">
              Areas for Targeted Growth
            </h3>
            <div style="font-family: 'Arial', sans-serif; font-size: 13.5px; line-height: 1.6; color: #B45309;">
              ${weaknessesHtml}
            </div>
          </div>

          <!-- Actionable Recommendations Section -->
          <div style="margin-bottom: 32px; border: 1px solid #DBEAFE; background-color: #EFF6FF; padding: 20px; border-left: 5px solid #2563EB;">
            <h3 style="font-family: 'Georgia', serif; font-size: 16px; color: #1E40AF; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">
              Executive Recommendations
            </h3>
            <div style="font-family: 'Arial', sans-serif; font-size: 13.5px; line-height: 1.6; color: #1D4ED8;">
              ${suggestionsHtml}
            </div>
          </div>

          <!-- Q&A Transcript -->
          <h3 style="font-family: 'Georgia', serif; font-size: 18px; color: #1E2838; border-bottom: 2px solid #1E2838; padding-bottom: 8px; margin-bottom: 20px;">
            Interview Q&A Transcript
          </h3>

          ${transcriptHtml}

          <!-- Classic Footer Stamp -->
          <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #E2DACD; text-align: center; font-family: 'Arial', sans-serif;">
            <p style="font-size: 11px; color: #64748B; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
              Official Record • Confidential Evaluation • Ai Interview Pro Inc.
            </p>
          </div>

        </div>
      </div>
    `;

    const targetRecipient = process.env.ADMIN_EMAIL || "nikhilcm83@gmail.com";

    const { data, error } = await resend.emails.send({
      from: "AI Interview Pro <onboarding@resend.dev>",
      to: [targetRecipient],
      subject: `Official Candidate Evaluation Report - ${interview.role}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Automated email dispatch error:", error);
      return { success: false, error };
    }

    console.log(`Automated interview report email successfully dispatched to ${targetRecipient}`);
    return { success: true, emailId: data?.id };
  } catch (err: any) {
    console.error("Automated email service exception:", err);
    return { success: false, error: err.message };
  }
}
