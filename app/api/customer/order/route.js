
// import { NextResponse } from "next/server";
// import db from "@/lib/db"; 
// import Order from "@/models/order";
// import Product from "@/models/product";
// import { getServerSession } from "next-auth"; 
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// export async function POST(req) {
//   try {
//     await db.connect();
    
//     // 1. Get User Session
//     const session = await getServerSession(authOptions);
    
//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Please login to place an order" }, { status: 401 });
//     }

//     const body = await req.json();
    
//     const { 
//         shopId, 
//         items, 
//         deliveryAddress, 
//         total, 
//         paymentMethod, 
//         deliveryMode, 
//         deliveryFee 
//     } = body;

//     // 2. Validate Stock (Critical Step)
//     for (const item of items) {
//       const product = await Product.findById(item.productId);
//       if (!product || product.stock < item.quantity) {
//         return NextResponse.json(
//           { error: `Stock unavailable for ${item.name}. Available: ${product ? product.stock : 0}` }, 
//           { status: 400 }
//         );
//       }
//     }

//     // --- 3. SERVER-SIDE CONSISTENCY CHECK ---
//     let finalDeliveryFee = 50; 
//     let finalAddress = deliveryAddress; // Default to what was sent

//     if (deliveryMode === 'store_pickup') {
//         finalDeliveryFee = 0;
//         finalAddress = undefined; // Clear address for pickup
//     } else {
//         finalDeliveryFee = deliveryFee !== undefined ? deliveryFee : 50;

//         // --- MAPS INTEGRATION UPDATE START ---
//         // We ensure the "coordinates" from frontend are saved as "location" in DB
//         if (deliveryAddress) {
//            finalAddress = {
//                address: deliveryAddress.address,
//                city: deliveryAddress.city,
//                // Map 'coordinates' (Frontend) -> 'location' (Schema)
//                location: deliveryAddress.coordinates 
//                  ? { lat: deliveryAddress.coordinates.lat, lng: deliveryAddress.coordinates.lng }
//                  : undefined 
//            };
//         }
//         // --- MAPS INTEGRATION UPDATE END ---
//     }

//     // 4. Create Order
//     const newOrder = await Order.create({
//       shopId,
//       userId: session.user.id, 
//       source: "online",
//       orderStatus: "Pending",
//       paymentMethod,
//       isPaid: false, 
      
//       deliveryMode: deliveryMode || "home_delivery",
//       deliveryFee: finalDeliveryFee,
//       deliveryAddress: finalAddress, // Uses the mapped address with location

//       items: items.map(i => ({
//         productId: i.productId,
//         name: i.name,
//         quantity: i.quantity,
//         price: i.price,
//         subtotal: i.price * i.quantity
//       })),
//       total,
//     });

//     // 5. Decrement Stock
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

// export async function GET(req) {
//   try {
//     await db.connect();
//     const session = await getServerSession(authOptions);

//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Fetch all orders for this user, sorted by newest
//     const orders = await Order.find({ userId: session.user.id })
//       .sort({ createdAt: -1 })
//       .populate("shopId", "shopName shopLogo phone"); 

//     return NextResponse.json({ success: true, orders }, { status: 200 });

//   } catch (error) {
//     console.error("Fetch User Orders Error:", error);
//     return NextResponse.json({ error: "Server Error" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import db from "@/lib/db"; 
import Order from "@/models/order";
import Product from "@/models/product";
import Seller from "@/models/seller"; // ✅ NEW: Needed to get commission rate
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
    
    const { 
        shopId, 
        items, 
        deliveryAddress, 
        total, 
        paymentMethod, 
        deliveryMode, 
        deliveryFee 
    } = body;

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

    // --- 3. SERVER-SIDE CONSISTENCY CHECK ---
    let finalDeliveryFee = 50; 
    let finalAddress = deliveryAddress; // Default to what was sent

    if (deliveryMode === 'store_pickup') {
        finalDeliveryFee = 0;
        finalAddress = undefined; // Clear address for pickup
    } else {
        finalDeliveryFee = deliveryFee !== undefined ? deliveryFee : 50;

        // --- MAPS INTEGRATION ---
        if (deliveryAddress) {
           finalAddress = {
               address: deliveryAddress.address,
               city: deliveryAddress.city,
               // Map 'coordinates' (Frontend) -> 'location' (Schema)
               location: deliveryAddress.coordinates 
                 ? { lat: deliveryAddress.coordinates.lat, lng: deliveryAddress.coordinates.lng }
                 : undefined 
           };
        }
    }

    // --- 4. COMMISSION CALCULATION (NEW) ---
    // Fetch seller to get their specific commission rate
    const seller = await Seller.findById(shopId);
    if (!seller) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

// Use seller's rate or default to 2%
    const commRate = seller.commissionRate || 2;
    
    // ✅ FIX: Subtract delivery fee so we commission ONLY on product price
    // We use 'finalDeliveryFee' because it handles the Pickup vs Delivery logic
    const productSubtotal = total - finalDeliveryFee; 
    
    // Calculate commission (e.g. 2% of 1000 = 20)
    const commissionVal = Math.round((productSubtotal * commRate) / 100);
    
    //const securePin = Math.floor(1000 + Math.random() * 9000).toString();
    // 5. Create Order
    const newOrder = await Order.create({
      shopId,
      userId: session.user.id, 
      source: "online",
      orderStatus: "Pending",
      paymentMethod,
      isPaid: false, 
      //orderPin: securePin,
      // ✅ NEW: Store the calculated commission
      commissionAmount: commissionVal,
      commissionDeducted: false, 

      deliveryMode: deliveryMode || "home_delivery",
      deliveryFee: finalDeliveryFee,
      deliveryAddress: finalAddress, 

      items: items.map(i => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.price * i.quantity
      })),
      total,
    });

    // 6. Decrement Stock
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

    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .populate("shopId", "shopName shopLogo phone"); 

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error) {
    console.error("Fetch User Orders Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}