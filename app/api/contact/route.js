import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Subject mapping
    const subjectMap = {
      general: "General Inquiry",
      support: "Customer Support",
      vendor: "Vendor / Seller Support",
      partnership: "Partnership / Business",
      bug: "Bug Report",
      feedback: "Feedback & Suggestions",
    };

    const subjectLine = `[MartLy Contact] ${subjectMap[subject] || "General"} — from ${name}`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFFBF7; border-radius: 16px; border: 1px solid #F3E8DE;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1C1410; margin: 0;">New Contact Message</h2>
          <p style="color: #8B7355; font-size: 14px;">Via MartLy Contact Form</p>
        </div>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #F3E8DE;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 12px; color: #8B7355; font-weight: 600; width: 100px;">Name</td>
              <td style="padding: 8px 12px; color: #1C1410;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8B7355; font-weight: 600;">Email</td>
              <td style="padding: 8px 12px; color: #1C1410;"><a href="mailto:${email}" style="color: #F97316;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #8B7355; font-weight: 600;">Subject</td>
              <td style="padding: 8px 12px; color: #1C1410;">${subjectMap[subject] || "General"}</td>
            </tr>
          </table>
        </div>
        <div style="margin-top: 16px; background: white; border-radius: 12px; padding: 20px; border: 1px solid #F3E8DE;">
          <p style="color: #8B7355; font-weight: 600; font-size: 14px; margin: 0 0 8px;">Message</p>
          <p style="color: #1C1410; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="text-align: center; color: #C4A882; font-size: 12px; margin-top: 24px;">MartLy — Hyper-Local Commerce for Pakistan</p>
      </div>
    `;

    // Send to admin using the shared mailer (uses SMTP_* env vars)
    const adminEmail = process.env.SMTP_FROM || "admin.martly@gmail.com";
    const success = await sendEmail(adminEmail, subjectLine, html);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send message." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
