import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function sendVerificationEmail(to, link) {
  await transporter.sendMail({
    from: `"Marketplace" <${process.env.SMTP_FROM}>`,
    to,
    subject: "Verify your email",
    html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
  });
}