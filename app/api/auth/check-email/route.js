import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller"; 
import User from "@/models/user";

export async function POST(req) {
  try {
    await db.connect();
    const { email, phone } = await req.json();

    // Build query conditions based on what was provided
    const sellerQuery = { $or: [] };
    const userQuery = { $or: [] };

    if (email) {
      sellerQuery.$or.push({ email });
      userQuery.$or.push({ email });
    }
    if (phone) {
      sellerQuery.$or.push({ phone });
      userQuery.$or.push({ phone });
    }

    // If nothing provided, bail early
    if (sellerQuery.$or.length === 0) {
      return NextResponse.json({ exists: false });
    }

    // Run both checks in parallel for speed
    const [existingSeller, existingUser] = await Promise.all([
        // Only consider VERIFIED sellers as "existing" — unverified zombies can be overwritten
        Seller.findOne({ ...sellerQuery, isVerified: true }).select("_id email phone"),
        User.findOne(userQuery).select("_id email phone")
    ]);

    if (existingSeller || existingUser) {
      // Determine which field caused the conflict for a clear UX message
      const account = existingSeller || existingUser;
      let field = "email";
      if (phone && account.phone === phone) field = "phone";

      return NextResponse.json({ 
          exists: true, 
          field, // Tells the frontend WHICH field conflicted
          role: existingSeller ? "seller" : "customer"
      });
    }

    return NextResponse.json({ exists: false });

  } catch (error) {
    console.error("Email Check Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}