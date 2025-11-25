/*import User from "@/models/user";
import { NextResponse } from "next/server";
import crypto from "crypto";
import  db from "@/lib/db";

export async function GET(request) {
  try {
    await db.connect();

    const { searchParams } = new URL(request.url);
    const verificationToken = searchParams.get("verifyToken");
    const userId = searchParams.get("id");

  if (!verificationToken || !userId) {
      return NextResponse.json({
        message: "Invalid or missing parameters"
      }, {
        status: 401
      });
    }

   const hashedToken = crypto
  .createHash("sha256")
  .update(verificationToken)
  .digest("hex");
    const user = await User.findOne({
      _id: userId,
      verificationToken:hashedToken,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({
        message: "Invalid or expired token"
      }, {
        status: 400
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    return NextResponse.json({
      verified: true
    }, {
      status: 200
    });
  } catch (error) {
    return NextResponse.json({
      message: "Something went wrong" + error
    }, {
      status: 500
    });
  }
}*/
import { NextResponse } from "next/server";
import db from "@/lib/db";
import User from "@/models/user";
import Seller from "@/models/seller";
import crypto from "crypto";

export async function GET(request) {
  try {
    await db.connect();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    if (!token || !id) {
      const errorUrl = new URL('/login?error=invalid_link', request.url);
      return NextResponse.redirect(errorUrl);
    }

    // Hash the incoming token to match what's stored in the DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Try to find as a User first
    let account = await User.findOne({
      _id: id,
      verificationToken: hashedToken,
      verificationExpires: { $gt: new Date() },
    });

    // If not found as a User, try to find as a Seller
    if (!account) {
      account = await Seller.findOne({
        _id: id,
        verificationToken: hashedToken,
        verificationExpires: { $gt: new Date() },
      });
    }

    // If no account is found in either model
    if (!account) {
      const errorUrl = new URL('/login?error=verification_failed', request.url);
      return NextResponse.redirect(errorUrl);
    }

    // Verify the account
    account.isVerified = true;
    account.verificationToken = undefined;
    account.verificationExpires = undefined;
    await account.save();

    // Redirect to the login page with a success message
    const loginUrl = new URL('/login?verified=true', request.url);
    return NextResponse.redirect(loginUrl);

  } catch (error) {
    console.error("Unified Verification API Error:", error);
    const errorUrl = new URL('/login?error=server_error', request.url);
    return NextResponse.redirect(errorUrl);
  }
}