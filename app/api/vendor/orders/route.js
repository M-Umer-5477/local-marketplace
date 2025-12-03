import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import Seller from "@/models/seller"; // To verify seller identity
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. GET ORDERS
export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    // Security: Must be a Seller
    if (!session || session.user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the Seller Document ID associated with this user email
    // (Assuming session.user.email links to the Seller account)
    const seller = await Seller.findOne({ email: session.user.email });
    if (!seller) return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });

    // Fetch Orders sorted by newest first
    const orders = await Order.find({ shopId: seller._id })
      .sort({ createdAt: -1 })
      .populate("userId", "name phone email"); // Get customer details if needed

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 2. UPDATE ORDER STATUS
export async function PUT(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
    const { orderId, status } = await req.json();

    if (!session || session.user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Seller owns this order
    const seller = await Seller.findOne({ email: session.user.email });
    const order = await Order.findOne({ _id: orderId, shopId: seller._id });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Update Status
    order.orderStatus = status;
    await order.save();

    return NextResponse.json({ success: true, message: "Order updated" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}