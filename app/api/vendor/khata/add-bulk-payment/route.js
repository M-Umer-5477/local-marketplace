import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order"; 
import { auth } from "@/auth";
import mongoose from "mongoose";

export async function POST(req) {
  const session = await auth();
  if (!session || session.user?.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.connect();
    const shopId = session.user.id;
    const body = await req.json();
    const { customerPhone, amount } = body;

    let remainingPayment = Number(amount);

    if (!customerPhone || !remainingPayment || remainingPayment <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 1. Find all outstanding orders for this customer, oldest first
    const ordersToPay = await Order.find({
      shopId: new mongoose.Types.ObjectId(shopId), // Ensure shopId is an ObjectId
      customerPhone,
      isKhata: true,
      balance: { $gt: 0 },
    }).sort({ createdAt: 1 }); // <-- Crucial: pay oldest orders first (FIFO)

    if (!ordersToPay.length) {
      return NextResponse.json({ error: "No outstanding balance found" }, { status: 404 });
    }

    const updatePromises = [];

    // 2. Loop through orders and apply payment
    for (const order of ordersToPay) {
      if (remainingPayment <= 0) break; // Stop if payment is used up

      const paymentForThisOrder = Math.min(order.balance, remainingPayment);

      order.payments.push({
        amount: paymentForThisOrder,
        method: "khata", // Matches your schema
        note: "Part of bulk khata payment",
        date: new Date(),
      });

      order.balance -= paymentForThisOrder;
      order.isPaid = order.balance <= 0;

      remainingPayment -= paymentForThisOrder;

      // 3. Add the save promise to an array
      updatePromises.push(order.save());
    }

    // 4. Execute all database updates concurrently
    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Bulk payment applied successfully.",
    });

  } catch (err) {
    console.error("KHATA BULK PAYMENT ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}