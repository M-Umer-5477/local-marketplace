import { NextResponse } from "next/server";
import db from "@/lib/db";
import User from "@/models/user";
import Seller from "@/models/seller";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendVerificationEmail from "@/lib/mailer";

export async function POST(req) {
  try {
    await db.connect();
    // 1. 'role' is removed. It's no longer expected from the frontend.
    const { name, email, phone, password } = await req.json();

    // 2. Check for existing User (safer check)
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // You could add logic here to resend the verification email
        return NextResponse.json(
          { error: "This email/phone is already registered but not verified. Please check your email." },
          { status: 400 }
        );
      }
      // If verified, it's a hard block
      return NextResponse.json(
        { error: "This email/phone is already registered as a user." },
        { status: 400 }
      );
    }

    // 3. Check for existing Seller
    const existingSeller = await Seller.findOne({ $or: [{ email }, { phone }] });
    if (existingSeller) {
      // Block registration if the email/phone is *already* a seller
      return NextResponse.json(
        { error: "This email/phone is already registered as a seller. Please log in as a seller." },
        { status: 400 }
      );
    }

    // --- 4. Corrected Token and User Creation ---
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Standard Secure Token Pattern:
    // 1. Generate a raw, unhashed token
    const rawToken = crypto.randomBytes(32).toString("hex");
    
    // 2. Hash the token to store in the database
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
      
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // 5. Create the new user with a hardcoded role
    const user = await User.create({
      name,
      email,
      phone,
      password: passwordHash,
      role: 'customer', // <-- Role is hardcoded to 'user'
      verificationToken: hashedToken, // 3. Save the HASHED token
      verificationExpires: tokenExpiry,
    });

    // 6. Send the RAW token in the email link
    // This is the NEW line
const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${rawToken}&id=${user._id}`;
    await sendVerificationEmail(email, verifyUrl);

    return NextResponse.json(
      { message: "User registered. Check your email for verification link." },
      { status: 201 }
    );

  } catch (error) {
    // 7. Added robust error handling
    console.error("User Registration Error:", error);
    // Catch database duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "This email or phone is already registered." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}