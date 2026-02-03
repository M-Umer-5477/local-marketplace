import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller"; 
import User from "@/models/user"; // ✅ Import User model

export async function POST(req) {
  try {
    await db.connect();
    const { email } = await req.json();

    // ⚡ Run both checks in parallel for speed
    const [existingSeller, existingUser] = await Promise.all([
        Seller.findOne({ email }).select("_id"),
        User.findOne({ email }).select("_id")
    ]);

    // If found in EITHER collection, return true
    if (existingSeller || existingUser) {
      return NextResponse.json({ 
          exists: true, 
          role: existingSeller ? "seller" : "user" // Optional: Tells you where they were found
      });
    }

    return NextResponse.json({ exists: false });

  } catch (error) {
    console.error("Email Check Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}