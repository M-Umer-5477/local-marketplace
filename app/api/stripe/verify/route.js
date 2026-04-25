import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";
import Order from "@/models/order";
import Product from "@/models/product";
import Seller from "@/models/seller";
import Transaction from "@/models/transaction";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await db.connect();
    const { sessionId } = await req.json();

    // 1. Verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not paid" }, { status: 400 });
    }

    // 2. Extract Data & FIX ADDRESS MAPPING
    const { userId, shopId, addressJSON, deliveryFee, deliveryMode, chunksCount } = session.metadata;
    
    // ✅ Handle undefined or "undefined" string from Stripe metadata
    let finalAddress = undefined;
    
    if (addressJSON && addressJSON !== "undefined") {
      try {
        const rawAddress = JSON.parse(addressJSON);
        // Map 'coordinates' (Frontend) -> 'location' (Database Schema)
        finalAddress = {
          address: rawAddress.address,
          city: rawAddress.city,
          location: rawAddress.coordinates 
            ? { lat: rawAddress.coordinates.lat, lng: rawAddress.coordinates.lng }
            : undefined
        };
      } catch (parseError) {
        console.warn("Address JSON parse warning:", parseError);
        // If parsing fails, proceed without address (pickup mode)
        finalAddress = undefined;
      }
    }
    
    // Check if order already exists (Idempotency)
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
        return NextResponse.json({ success: true, orderId: existingOrder._id.toString() });
    }

    // ✅ RECONSTRUCT ITEMS ARRAY FROM METADATA CHUNKS
    let itemsJSON = "";
    for(let i = 0; i < Number(chunksCount || 0); i++) {
         itemsJSON += session.metadata[`chunk_${i}`];
    }
    const originalItems = itemsJSON ? JSON.parse(itemsJSON) : [];

    // 3. Calculate Commission
   // ... inside app/api/stripe/verify/route.js

    // 3. Calculate Commission (FAIR WAY)
    const totalAmount = session.amount_total / 100; // e.g. Rs. 550
    const deliveryFeeAmount = parseFloat(deliveryFee) || 0; // e.g. Rs. 50

    // ✅ FIX: Isolate the product cost so we don't tax delivery
    const productSubtotal = totalAmount - deliveryFeeAmount; // Rs. 500

    const seller = await Seller.findById(shopId);
    const commRate = seller.commissionRate || 3;
    
    // Calculate commission ONLY on the product subtotal
    const commission = Math.round((productSubtotal * commRate) / 100); 
    
    // Seller gets: (Total Amount) - (Commission)
    // Example: 550 - 10 = 540 (Seller keeps the Rs. 50 delivery fee)
    const sellerEarning = totalAmount - commission;
    // 4. Update Seller Wallet (CREDIT)
    await Seller.findByIdAndUpdate(shopId, {
        $inc: { walletBalance: sellerEarning }
    });

    // 5. Log Transaction
    await Transaction.create({
        seller: shopId,
        amount: sellerEarning,
        type: "Credit",
        category: "Order_Earning",
        description: `Earnings from Online Order (Stripe)`,
        status: "Completed"
    });

    // 6. Get Line Items for Receipt
    // (We use a fallback here since we can't easily get full product details from Stripe session items)
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });

    // 7. Create The Order
    // const securePin = Math.floor(1000 + Math.random() * 9000).toString(); // Uncomment when ready for PIN
    const newOrder = await Order.create({
        shopId,
        userId,
        source: "online",
        orderStatus: "Pending", // Pending so seller sees it
        paymentMethod: "online",
        isPaid: true,
        total: totalAmount,
        deliveryFee: parseFloat(deliveryFee) || 0,
        deliveryMode: deliveryMode || "pickup",
        
        // ✅ Use the fixed address object (will be undefined for pickup)
        deliveryAddress: finalAddress || undefined, 
        
        stripeSessionId: sessionId,
        commissionDeducted: true, 
        commissionAmount: commission,
        // orderPin: securePin, // Uncomment when ready for PIN

        // Map Original Items to Order Items Schema to preserve real productIds!
        items: originalItems.map(i => ({
            name: i.n,
            quantity: i.q,
            price: i.p,
            subtotal: i.p * i.q,
            productId: i.i,
            image: i.img
        }))
    });

    // 8. Decrement Stock NOW that the payment is successful!
    for (const item of originalItems) {
      if (item.i) {
         await Product.findByIdAndUpdate(item.i, {
            $inc: { stock: -item.q }
         });
      }
    }

    return NextResponse.json({ success: true, orderId: newOrder._id.toString() });

  } catch (error) {
    console.error("Verify Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}