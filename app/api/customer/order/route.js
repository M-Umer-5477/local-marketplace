import { NextResponse } from "next/server";
import db from "@/lib/db"; // or import { connectDB } from "@/lib/mongodb" depending on your setup
import Order from "@/models/order";
import Product from "@/models/product";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await db.connect();
    
    // 1. Get User Session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Please login to place an order" }, { status: 401 });
    }

    const body = await req.json();
    const { shopId, items, deliveryAddress, total, paymentMethod } = body;

    // 2. Validate Stock (Critical Step)
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock unavailable for ${item.name}. Available: ${product ? product.stock : 0}` }, 
          { status: 400 }
        );
      }
    }

    // 3. Create Order
    const newOrder = await Order.create({
      shopId,
      
      // -------------------------------------------------------
      // FIX: Use the actual ID from the session
      // -------------------------------------------------------
      userId: session.user.id, 
      
      source: "online",
      orderStatus: "Pending",
      paymentMethod,
      isPaid: false, 
      deliveryAddress,
      items: items.map(i => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.price * i.quantity
      })),
      total,
      deliveryFee: 50 
    });

    // 4. Decrement Stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    return NextResponse.json({ success: true, orderId: newOrder._id }, { status: 201 });

  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all orders for this user, sorted by newest
    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .populate("shopId", "shopName shopLogo phone"); // Get shop details

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error) {
    console.error("Fetch User Orders Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
// import { NextResponse } from "next/server";
// import db from "@/lib/db";
// import Order from "@/models/order";
// import Product from "@/models/product";
// import { getServerSession } from "next-auth"; 
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// export async function POST(req) {
//   try {
//     await db.connect();
//     const session = await getServerSession(authOptions);
//     const body = await req.json();
//     const { shopId, items, deliveryAddress, total, paymentMethod } = body;

//     if (!session) return NextResponse.json({ error: "Please login to place an order" }, { status: 401 });

//     // 1. Validate Stock (Critical Step)
//     for (const item of items) {
//       const product = await Product.findById(item.productId);
//       if (!product || product.stock < item.quantity) {
//         return NextResponse.json(
//           { error: `Stock unavailable for ${item.name}. Available: ${product ? product.stock : 0}` }, 
//           { status: 400 }
//         );
//       }
//     }

//     // 2. Create Order
//     // Assuming user email is in session, find User ID (skipped here for brevity, assume you get userId)
//     // const user = await User.findOne({ email: session.user.email });

//     const newOrder = await Order.create({
//       shopId,
//       // userId: user._id, 
//       userId: "65f2...", // Replace with actual user ID logic
//       source: "online",
//       orderStatus: "Pending",
//       paymentMethod,
//       isPaid: false, // Default for COD
//       deliveryAddress,
//       items: items.map(i => ({
//         productId: i.productId,
//         name: i.name,
//         quantity: i.quantity,
//         price: i.price,
//         subtotal: i.price * i.quantity
//       })),
//       total,
//       deliveryFee: 50 // Fixed or calculated fee
//     });

//     // 3. Decrement Stock
//     for (const item of items) {
//       await Product.findByIdAndUpdate(item.productId, {
//         $inc: { stock: -item.quantity }
//       });
//     }

//     return NextResponse.json({ success: true, orderId: newOrder._id }, { status: 201 });

//   } catch (error) {
//     console.error("Order Creation Error:", error);
//     return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
//   }
// }