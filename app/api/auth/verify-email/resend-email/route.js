/*import { NextResponse } from "next/server";
import db from "@/lib/db";
import User from "@/models/user";
import crypto from "crypto";
import sendVerificationEmail from "@/lib/mailer";

export async function POST(req) {
  await db.connect();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
  }

  if (user.isVerified) {
    return NextResponse.json({ message: "User already verified" });
  }

  // generate new token
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  user.verificationToken = hashedToken;
  user.verificationExpires = new Date(Date.now() + 1000 * 60 * 60); // 1h
  await user.save();

  const verifyUrl = `${process.env.NEXTAUTH_URL}/register/verifyEmail?verifyToken=${hashedToken}&id=${user._id}`;
  await sendVerificationEmail(user.email, verifyUrl);

  return NextResponse.json({ message: "New verification link sent" });
}*/

import { NextResponse } from "next/server";
import db from "@/lib/db";
import User from "@/models/user";
import Seller from "@/models/seller";
import crypto from "crypto";
import sendVerificationEmail from "@/lib/mailer";

export async function POST(req) {
  try {
    await db.connect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // --- Logic to find the account in either User or Seller model ---

    let account = await User.findOne({ email });

    if (!account) {
      account = await Seller.findOne({ email });
    }

    // If no account is found in either model
    if (!account) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    // If the account is already verified
    if (account.isVerified) {
      return NextResponse.json({ error: "This account is already verified." }, { status: 400 });
    }

    // --- Generate new token and send email ---

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    account.verificationToken = hashedToken;
    account.verificationExpires = tokenExpiry;
    await account.save();

    // ✅ This is the crucial part: It creates a link to your unified verification route
    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${rawToken}&id=${account._id}`;
    
    await sendVerificationEmail(email, verifyUrl);

    return NextResponse.json({ message: `A new verification email has been sent to ${email}.` }, { status: 200 });

  } catch (error) {
    console.error("Resend Verification Error:", error);
    // Handle potential mailer errors like rate limiting
    if (error.code === 'EENVELOPE' && error.responseCode === 550) {
        return NextResponse.json(
          { error: "Email server is busy. Please try again in a few minutes." },
          { status: 429 } // 429 Too Many Requests
        );
    }
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}