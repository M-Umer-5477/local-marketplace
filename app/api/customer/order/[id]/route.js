import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import Seller from "@/models/seller"; // To populate Shop Name
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch Order and populate Shop Details
    const order = await Order.findById(id)
      .populate({
        path: "shopId",
        model: Seller,
        select: "shopName phone shopAddress shopLogo" // Only public info
      });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security Check: Ensure logged-in user owns this order
    if (!order.userId || order.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, order }, { status: 200 });

  } catch (error) {
    console.error("Fetch Order Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}