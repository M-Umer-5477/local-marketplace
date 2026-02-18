import { NextResponse } from "next/server";
import db from "@/lib/db";
import User from "@/models/user";
import Seller from "@/models/seller";
import { sendEmail } from "@/lib/mailer"; // Using your existing mailer

export async function POST(req) {
  try {
    await db.connect();
    const { email } = await req.json();

    // 1. Search in User Collection
    let account = await User.findOne({ email });
    let model = "User";

    // 2. If not found, Search in Seller Collection
    if (!account) {
      account = await Seller.findOne({ email });
      model = "Seller";
    }

    if (!account) {
      // Security: Always say "sent" to prevent email scraping
      return NextResponse.json({ success: true, message: "If account exists, OTP sent." });
    }

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // 4. Save to DB (Reusing existing fields to avoid Schema changes)
    account.verificationToken = otp;
    account.verificationExpires = expiry;
    await account.save();

    // 5. Send Email
    // We create a simple HTML body for the reset code
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Reset Password</h2>
        <p>Your password reset code is:</p>
        <h1 style="background: #eee; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h1>
        <p>Expires in 15 minutes.</p>
      </div>
    `;
    
    await sendEmail(email, "Reset Password Request", html);

    return NextResponse.json({ success: true, model }); // Return model so frontend knows where to look next

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}