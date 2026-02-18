import { NextResponse } from "next/server";
import db from "@/lib/db";
import User from "@/models/user";
import Seller from "@/models/seller";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await db.connect();
    const { email, otp, newPassword, model } = await req.json();

    let account;

    // 1. Find the account based on the model we found in step 1
    if (model === "Seller") {
      account = await Seller.findOne({ 
        email, 
        verificationToken: otp, 
        verificationExpires: { $gt: Date.now() } 
      });
    } else {
      account = await User.findOne({ 
        email, 
        verificationToken: otp, 
        verificationExpires: { $gt: Date.now() } 
      });
    }

    if (!account) {
      return NextResponse.json({ error: "Invalid or Expired OTP" }, { status: 400 });
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update & Clear OTP
    account.password = hashedPassword;
    account.verificationToken = undefined;
    account.verificationExpires = undefined;
    
    // For User schema, we might need to ensure isVerified is true if they reset password
    if (model === "User") account.isVerified = true; 

    await account.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}