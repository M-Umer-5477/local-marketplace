import { NextResponse } from "next/server";
import db from "@/lib/db";
import User from "@/models/user";

export async function POST(req) {
  try {
    await db.connect();
    const { email, otp } = await req.json();

    // 1. Find User
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Check if already verified
    if (user.isVerified) {
      return NextResponse.json({ message: "Already verified" }, { status: 200 });
    }

    // 3. Validate OTP
    // Ensure both are strings for comparison
    if (user.verificationToken !== otp.toString()) {
      return NextResponse.json({ error: "Invalid Code" }, { status: 400 });
    }

    // 4. Check Expiry
    if (new Date() > user.verificationExpires) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // 5. Success: Verify User & Clear Token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Email Verified" }, { status: 200 });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}