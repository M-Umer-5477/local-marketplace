import nodemailer from "nodemailer";

// --- 1. Configure Transporter ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your Login Email (Gmail)
    pass: process.env.SMTP_PASS, // Your Brevo/SendGrid API Key
  },
});

/**
 * --- 2. NEW: Generic Email Function ---
 * Use this for Admin notifications, alerts, etc.
 * Usage: import { sendEmail } from "@/lib/mailer";
 */
export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      // ✅ UPDATED: Now sends as "Martly Support" using your domain
      // Relies on SMTP_FROM=no-reply@martly.me in your .env
      from: `"Martly Support" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Email Send Error:", error);
    return false;
  }
};

/**
 * --- 3. EXISTING: OTP Function (Default Export) ---
 * Keeps your current Auth system working without changes.
 * Usage: import sendVerificationEmail from "@/lib/mailer";
 */
export default async function sendVerificationEmail(to, otp) {
  const subject = "Your Verification Code";
  
  // ✅ UPDATED: Replaced "ShopSync" with "Martly" in the HTML
  const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Verify your email</h2>
        <p>Your verification code for <strong>Martly</strong> is:</p>
        <h1 style="background: #f4f4f5; color: #000; padding: 10px 20px; display: inline-block; letter-spacing: 5px; border-radius: 5px;">
          ${otp}
        </h1>
        <p style="color: #666; font-size: 14px;">This code expires in 15 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

  // Reuse the generic function to send this
  return sendEmail(to, subject, html);
}