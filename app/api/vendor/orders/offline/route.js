import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import Product from "@/models/product";   // <-- NEW

export async function POST(request) {
  try {
    await db.connect();
    const body = await request.json();

    const {
      shopId,
      items,
      total, 
      paymentMethod,
      initialPayment = 0,
      customerName,
      customerPhone,
    } = body;

    if (!shopId || !items || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ----------------------------
    // 1️⃣ SERVER SIDE: Validate & Calculate Safe Total
    // ----------------------------
    const serverTotal = items.reduce((acc, item) => {
      const itemSubtotal = (item.price || 0) * (item.quantity || 1);
      return acc + itemSubtotal;
    }, 0);

    const numericPayment = Number(initialPayment || 0);
    const finalPayment = Math.min(numericPayment, serverTotal);
    const balance = serverTotal - finalPayment;
    const isKhata = paymentMethod === "khata" || balance > 0;

    // ----------------------------
    // 2️⃣ CHECK STOCK BEFORE ORDER CREATION
    // ----------------------------
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `${product.name} has only ${product.stock} in stock.`,
          },
          { status: 400 }
        );
      }
    }

    // ----------------------------
    // 3️⃣ CREATE ORDER
    // ----------------------------
    const order = new Order({
      shopId,
      source: "offline",
      items,
      total: serverTotal,
      payments: finalPayment > 0 ? [{ amount: finalPayment, method: paymentMethod, note: "Initial payment" }] : [],
      balance,
      isPaid: balance <= 0,
      isKhata,
      customerName: isKhata ? customerName : null,
      customerPhone: isKhata ? customerPhone : null,
    });

    await order.save();

    // ----------------------------
    // 4️⃣ DEDUCT STOCK AFTER SUCCESSFUL ORDER
    // ----------------------------
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("OFFLINE ORDER ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import db from "@/lib/db";
// import Order from "@/models/order";

// export async function POST(request) {
//   try {
//     await db.connect();
//     const body = await request.json();

//     const {
//       shopId,
//       items,
//       total, // We will IGNORE this client-sent total
//       paymentMethod,
//       initialPayment = 0,
//       customerName,
//       customerPhone,
//     } = body;

//     if (!shopId || !items || !items.length) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     // --- SERVER-SIDE FIX ---
    
//     // 1. Recalculate the total on the server. NEVER trust the client.
//     const serverTotal = items.reduce((acc, item) => {
//       // Ensure subtotal is correctly calculated if not provided
//       const itemSubtotal = (item.price || 0) * (item.quantity || 1);
//       return acc + itemSubtotal;
//     }, 0);

//     const numericPayment = Number(initialPayment || 0);

//     // 2. Cap the initial payment at the server-calculated total.
//     const finalPayment = Math.min(numericPayment, serverTotal);
    
//     // 3. Calculate the correct balance.
//     const balance = serverTotal - finalPayment;
//     // -------------------------

//     const isKhata = paymentMethod === "khata" || balance > 0;
    
//     const payments = finalPayment > 0
//       ? [{ 
//           amount: finalPayment, 
//           method: paymentMethod, 
//           note: "Initial payment" 
//         }]
//       : [];

//     const order = new Order({
//       shopId,
//       source: "offline",
//       items,
//       total: serverTotal,  // Use the SECURE server-calculated total
//       payments,
//       balance,              // Use the SECURE balance
//       isPaid: balance <= 0,
//       isKhata,
//       paymentMethod,
//       // Only save customer info if it's actually a Khata order
//       customerName: isKhata ? customerName : null,
//       customerPhone: isKhata ? customerPhone : null,
//     });

//     await order.save();
//     return NextResponse.json(order, { status: 201 });
//   } catch (error) {
//     console.error("OFFLINE ORDER ERROR:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }