/*import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import { auth } from "@/auth";
export async function GET(req) {
     const session = await auth();
        
          if (!session || session.user?.role !== "seller") {
            return redirect("/login");
          }
    
  try {
    await db.connect();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
   const shopId = session.user.id;

    if (!phone || !shopId)
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const orders = await Order.find({ shopId, customerPhone: phone, isKhata: true });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (err) {
    console.error("KHATA DETAILS ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
*/
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order"; // Make sure this path is correct
import { auth } from "@/auth";

export async function GET(req) {
  const session = await auth();
  if (!session || session.user?.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.connect();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const shopId = session.user.id;

    if (!phone) {
      return NextResponse.json({ error: "Missing phone parameter" }, { status: 400 });
    }

    // Find all Khata orders for this shop & phone that still have a balance
    const orders = await Order.find({
      shopId,
      customerPhone: phone,
      isKhata: true,
      balance: { $gt: 0 }, // Use balance > 0 instead of isPaid: false
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (err) {
    console.error("KHATA DETAILS ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}