import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// CHANGED: Accepts 'otp' instead of 'link'
export default async function sendVerificationEmail(to, otp) {
  await transporter.sendMail({
    from: `"ShopSync" <${process.env.SMTP_FROM}>`,
    to,
    subject: "Your Verification Code",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Verify your email</h2>
        <p>Your verification code for ShopSync is:</p>
        <h1 style="background: #f4f4f5; padding: 10px; display: inline-block; letter-spacing: 5px; border-radius: 5px;">
          ${otp}
        </h1>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
  });
}
// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT || 587),
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// export default async function sendVerificationEmail(to, link) {
//   await transporter.sendMail({
//     from: `"Marketplace" <${process.env.SMTP_FROM}>`,
//     to,
//     subject: "Verify your email",
//     html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
//   });
// }