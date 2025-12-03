import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";

export async function POST(req) {
  try {
    await db.connect();
    const { email, otp } = await req.json();

    const seller = await Seller.findOne({ email });

    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    if (seller.isVerified) return NextResponse.json({ message: "Already verified" }, { status: 200 });

    // Validate OTP
    if (seller.verificationToken !== otp.toString()) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Verify Email
    seller.isVerified = true;
    seller.verificationToken = undefined;
    seller.verificationExpires = undefined;
    await seller.save();

    return NextResponse.json({ success: true, message: "Email Verified" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
  }
}