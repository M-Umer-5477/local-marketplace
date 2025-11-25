import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import User from "@/models/user"; // 1. Import User model
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendVerificationEmail from "@/lib/mailer";

export async function POST(req) {
  try {
    await db.connect();

    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      password,
      cnic,
      shopName,
      shopType,
      shopAddress,
      shopLocation,
      verificationDocs,
    } = body;

    // --- 2. Comprehensive Duplicate Checks ---

    // Check 1: Is this email, phone, or CNIC already a seller?
    const existingSeller = await Seller.findOne({
      $or: [{ email }, { phone }, { cnic }],
    });

    if (existingSeller) {
      let message = "Seller already registered with this ";
      if (existingSeller.email === email) message += "email.";
      else if (existingSeller.phone === phone) message += "phone number.";
      else if (existingSeller.cnic === cnic) message += "CNIC.";
      
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    // Check 2: Is this email or phone already a user?
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      let message = "An account already exists with this ";
      if (existingUser.email === email) message += "email.";
      else if (existingUser.phone === phone) message += "phone number.";
      
      return NextResponse.json({ success: false, message: `${message} Please use a different one.` }, { status: 400 });
    }

    // --- 3. Hash Password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- 4. Corrected Secure Token Logic ---
    // 1. Generate a raw, unhashed token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash the token to store in the database
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1h

    // --- 5. Create New Seller ---
    const newSeller = new Seller({
      fullName,
      email,
      phone,
      password: hashedPassword,
      cnic,
      shopName,
      shopType,
      shopAddress,
      shopLocation,
      verificationDocs,
      verificationToken: hashedToken, // 3. Save the HASHED token
      verificationExpires: tokenExpiry,
      role: 'seller', // Explicitly set role
      verificationStatus: 'Pending', // Set default approval status
    });

    await newSeller.save();

    // --- 6. Send Verification Email ---
    // 4. Send the RAW token in the URL (not the hash)
   const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${rawToken}&id=${newSeller._id}`;
    await sendVerificationEmail(email, verifyUrl);

    return NextResponse.json(
      {
        success: true,
        message: "Seller registered successfully. Please check your email for verification.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error saving seller:", err);
    
    // 7. Add specific duplicate key error handling (as a fallback)
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "This email, phone, or CNIC is already registered." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}