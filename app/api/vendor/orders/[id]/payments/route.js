import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";

export async function POST(request, { params }) {
  try {
    await db.connect();
    const { id } = params;
    const { amount, method } = await request.json();

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    order.payments.push({ amount, method });
    order.balance -= amount;

    if (order.balance <= 0) {
      order.balance = 0;
      order.isPaid = true;
      order.isKhata = false;
    }

    await order.save();
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
