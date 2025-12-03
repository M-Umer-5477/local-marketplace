import { NextResponse } from "next/server";
import db from "@/lib/db";
import User from "@/models/user";
import Seller from "@/models/seller"; // Import Seller to check for duplicates
import bcrypt from "bcryptjs";
import sendVerificationEmail from "@/lib/mailer";

export async function POST(req) {
  try {
    await db.connect();
    const { name, email, password, phone } = await req.json();

    // --- 1. PREPARE DATA ---
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // --- 2. CHECK SELLER COLLECTION (Strict Block) ---
    // Prevent a Seller email/phone from being used as a Customer
    const existingSeller = await Seller.findOne({ 
        $or: [{ email }, { phone }] 
    });

    if (existingSeller) {
      return NextResponse.json({ 
        error: "This email or phone is already registered as a Seller account." 
      }, { status: 400 });
    }

    // --- 3. CHECK USER COLLECTION (Smart Logic) ---
    const existingUser = await User.findOne({ 
        $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        // A. Real Account Exists -> BLOCK
        return NextResponse.json({ error: "Email or Phone already registered" }, { status: 400 });
      } else {
        // B. Unverified "Zombie" Account -> OVERWRITE
        // User previously tried to sign up but didn't verify. Allow retry.
        
        existingUser.name = name;
        existingUser.email = email; // Ensure email matches current request
        existingUser.phone = phone; // Update phone in case they changed it
        existingUser.password = hashedPassword;
        existingUser.verificationToken = otp;
        existingUser.verificationExpires = expiry;
        
        await existingUser.save();
        await sendVerificationEmail(email, otp);

        return NextResponse.json({ message: "OTP resent to email" }, { status: 200 });
      }
    }

    // --- 4. CREATE NEW USER (If no conflict found) ---
    await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "customer",
      isVerified: false,
      verificationToken: otp, 
      verificationExpires: expiry,
    });

    // --- 5. SEND EMAIL ---
    await sendVerificationEmail(email, otp);

    return NextResponse.json({ message: "OTP sent to email" }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
// import { NextResponse } from "next/server";
// import db from "@/lib/db";
// import User from "@/models/user";
// import bcrypt from "bcryptjs";
// import sendVerificationEmail from "@/lib/mailer"; // Import your updated mailer

// export async function POST(req) {
//   try {
//     await db.connect();
//     const { name, email, password, phone } = await req.json();

//     // 1. Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return NextResponse.json({ error: "Email already registered" }, { status: 400 });
//     }

//     // 2. Hash Password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 3. Generate 6-Digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

//     // 4. Create User
//     // We reuse 'verificationToken' to store the OTP. No Schema change needed!
//     await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       role: "customer",
//       isVerified: false,
//       verificationToken: otp, 
//       verificationExpires: expiry,
//     });

//     // 5. Send Email
//     await sendVerificationEmail(email, otp);

//     return NextResponse.json({ message: "OTP sent to email" }, { status: 201 });

//   } catch (error) {
//     console.error("Register Error:", error);
//     return NextResponse.json({ error: "Server Error" }, { status: 500 });
//   }
// }