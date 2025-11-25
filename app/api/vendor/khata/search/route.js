import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order"; // Make sure this path is correct
import { auth } from "@/auth";
import mongoose from "mongoose";

export async function GET(req) {
  const session = await auth();
  if (!session || session.user?.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.connect();
    const shopId = session.user.id;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ customers: [] });
    }

    const pipeline = [
      {
        // Step 1: Find all Khata orders for this shop that match the query
        $match: {
          shopId: new mongoose.Types.ObjectId(shopId),
          isKhata: true,
          // Search by name (case-insensitive) OR phone
          $or: [
            { customerName: { $regex: query, $options: "i" } },
            { customerPhone: { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        // Step 2: Group them by phone number to get a unique list
        $group: {
          _id: "$customerPhone", // The unique ID for this group is the phone
          customerName: { $first: "$customerName" }, // Get the first name found
        },
      },
      {
        // Step 3: Limit the results
        $limit: 10,
      },
    ];

    const customers = await Order.aggregate(pipeline);

    return NextResponse.json({ customers }, { status: 200 });
  } catch (err) {
    console.error("KHATA SEARCH ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}