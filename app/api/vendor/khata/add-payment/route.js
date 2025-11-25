/*import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";

export async function POST(req) {
  try {
    await db.connect();
    const body = await req.json();
    const { orderId, amount } = body;

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const remaining = order.balance - amount;
    order.payments.push({ amount, method: "cash", note: "Khata payment" });
    order.balance = Math.max(remaining, 0);
    order.isPaid = remaining <= 0;

    await order.save();

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (err) {
    console.error("KHATA PAYMENT ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
*/
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order"; // Make sure this path is correct
import { auth } from "@/auth";

export async function POST(req) {
  const session = await auth();
  if (!session || session.user?.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.connect();
    const shopId = session.user.id;
    const body = await req.json();
    const { orderId, amount } = body;

    const numericAmount = Number(amount);

    if (!orderId || !numericAmount || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Find the order AND verify it belongs to the logged-in seller
    const order = await Order.findOne({ _id: orderId, shopId });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.balance <= 0 || order.isPaid) {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Create the new payment sub-document
    const newPayment = {
      amount: numericAmount,
      method: "khata", // This matches your schema's enum
      note: "Khata payment",
    };

    // Add payment to the array
    order.payments.push(newPayment);

    // Update balance and paid status
    const remaining = order.balance - numericAmount;
    order.balance = Math.max(remaining, 0);
    order.isPaid = order.balance <= 0;

    await order.save();

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (err) {
    console.error("KHATA PAYMENT ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}