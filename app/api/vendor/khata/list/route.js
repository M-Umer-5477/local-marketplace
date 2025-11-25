/*import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import { auth } from "@/auth";
import mongoose from "mongoose";
export async function GET(req) {
     const session = await auth();
    
      if (!session || session.user?.role !== "seller") {
        return redirect("/login");
      }

  try {
    await db.connect();
    const shopId = session.user.id;
    console.log('here is the shop id',shopId)
    if (!shopId) return NextResponse.json({ error: "Missing shopId" }, { status: 400 });
    const shopObjectId = new mongoose.Types.ObjectId(shopId);

    
   

   const khatas = await Order.aggregate([
      { $match: { shopId: shopObjectId, isKhata: true } },
      {
        $group: {
          _id: "$customerPhone",
          customerName: { $first: "$customerName" },
          totalBalance: { $sum: "$balance" },
          lastUpdated: { $max: "$createdAt" },
        },
      },
      { $sort: { lastUpdated: -1 } },
    ]);
    
    console.log('here are the khatas id',khatas)

    return NextResponse.json({ khatas }, { status: 200 });
  } catch (err) {
    console.error("KHATA LIST ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
*/
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

    const pipeline = [
      {
        // Step 1: Find all Khata orders for this shop that are not fully paid
        $match: {
          shopId: new mongoose.Types.ObjectId(shopId), // Ensure shopId is an ObjectId
          isKhata: true,
          balance: { $gt: 0 },
        },
      },
      {
        // Step 2: Group them by customer phone number
        $group: {
          _id: "$customerPhone", // The unique ID for this group is the phone
          customerName: { $first: "$customerName" }, // Get the first name found
          totalBalance: { $sum: "$balance" }, // Sum up the balances of all their orders
        },
      },
      {
        // Step 3: Sort by name for a clean list
        $sort: {
          customerName: 1,
        },
      },
    ];

    const khatas = await Order.aggregate(pipeline);

    return NextResponse.json({ khatas }, { status: 200 });
  } catch (err) {
    console.error("KHATA LIST ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}