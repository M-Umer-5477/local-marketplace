import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import User from "@/models/user"; 
import bcrypt from "bcryptjs";
import sendVerificationEmail, { sendEmail } from "@/lib/mailer"; 

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
      shopBanner,
      verificationDocs,
    } = body;

    // --- 1. PREPARE DATA (Hash & Format) ---
    
    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); 

    // Format GeoJSON Location (Default to [0,0] if missing)
    let formattedLocation = {
      type: "Point",
      coordinates: [0, 0] 
    };

    if (shopLocation && shopLocation.lat && shopLocation.lng) {
      formattedLocation = {
        type: "Point",
        coordinates: [parseFloat(shopLocation.lng), parseFloat(shopLocation.lat)]
      };
    }

    // --- 2. CHECK FOR DUPLICATES ---

    // A. Check User Collection (Strict Block)
    // We don't want a Seller email to clash with a Customer email account
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: "An account already exists with this email or phone." }, { status: 400 });
    }

    // B. Check Seller Collection (Smart Logic)
    const existingSeller = await Seller.findOne({
      $or: [{ email }, { phone }, { cnic }],
    });

    if (existingSeller) {
        if (existingSeller.isVerified) {
            // Scenario 1: Account Exists & Verified -> BLOCK
            let message = "Seller already registered with this ";
            if (existingSeller.email === email) message += "email.";
            else if (existingSeller.phone === phone) message += "phone number.";
            else if (existingSeller.cnic === cnic) message += "CNIC.";
            
            return NextResponse.json({ success: false, message }, { status: 400 });
        } else {
            // Scenario 2: Account Exists but UNVERIFIED (Zombie) -> OVERWRITE
            // This allows the user to retry if they messed up previously or OTP expired
            
            // Update all fields
            existingSeller.fullName = fullName;
            existingSeller.phone = phone;
            existingSeller.cnic = cnic;
            existingSeller.password = hashedPassword;
            existingSeller.shopName = shopName;
            existingSeller.shopType = shopType;
            existingSeller.shopAddress = shopAddress;
            existingSeller.shopLocation = formattedLocation;
            existingSeller.shopBanner = shopBanner;
            existingSeller.verificationDocs = verificationDocs;
            
            // Reset Verification Token
            existingSeller.verificationToken = otp;
            existingSeller.verificationExpires = tokenExpiry;
            
            await existingSeller.save();
            await sendVerificationEmail(email, otp);

            return NextResponse.json({ 
                success: true, 
                message: "Previous unverified application updated. OTP resent.", 
                email: email 
            }, { status: 200 });
        }
    }

    // --- 3. CREATE NEW SELLER (If no conflict found) ---
    const newSeller = new Seller({
      fullName,
      email,
      phone,
      password: hashedPassword,
      cnic,
      shopName,
      shopType,
      shopAddress,
      shopLocation: formattedLocation, 
      shopBanner,
      verificationDocs,
      verificationToken: otp, 
      verificationExpires: tokenExpiry,
      role: 'seller', 
      verificationStatus: 'Pending', 
      isVerified: false,
    });

    await newSeller.save();

    await sendVerificationEmail(email, otp);

    // --- 4.5. Send Admin Notification ---
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@martly.me";
        const subject = "🔔 New Vendor Registration - Martly";
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">New Vendor Pending Review</h2>
                <p><strong>Shop Name:</strong> ${shopName}</p>
                <p><strong>Owner:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <br/>
                <p>Please log in to the admin portal to review their documents.</p>
            </div>
        `;
        // Send email (non-blocking)
        sendEmail(adminEmail, subject, html);
    } catch (err) {
        console.error("Failed to notify admin:", err);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted. OTP sent.",
        email: email
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("Error saving seller:", err);
    
    // Duplicate Key Fallback (Just in case race condition occurs)
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate entry found (Email/Phone/CNIC)." },
        { status: 400 }
      );
    }

    // GeoJSON Error Fallback
    if (err.name === 'MongoServerError' && err.code === 16755) {
       return NextResponse.json(
        { success: false, message: "Invalid Location Data." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}