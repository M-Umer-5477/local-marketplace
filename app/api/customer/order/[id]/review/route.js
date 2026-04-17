import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import Seller from "@/models/seller";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/lib/mailer";

export async function POST(req, { params }) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    // We expect rating (1-5) and feedback
    const { rating, feedback } = await req.json();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    // 1. Fetch Order
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Validate ownership
    if (!order.userId || order.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // 3. Validate condition (must be delivered or picked up)
    if (order.orderStatus !== "Delivered" && order.orderStatus !== "Picked_Up") {
      return NextResponse.json({ error: "Order must be completed to leave a review" }, { status: 400 });
    }

    // 4. Check if already reviewed
    if (order.isReviewed) {
      return NextResponse.json({ error: "This order has already been reviewed" }, { status: 400 });
    }

    // 5. Apply the review to the order
    order.isReviewed = true;
    order.rating = rating;
    order.feedback = feedback || "";
    await order.save();

    // 6. Update Seller metrics
    const shop = await Seller.findById(order.shopId);
    if (shop) {
      const currentTotal = shop.totalReviews || 0;
      const currentAvg = shop.averageRating || 0;
      
      const newTotal = currentTotal + 1;
      const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;

      shop.totalReviews = newTotal;
      // Keep it up to 1 decimal point for clean presentation, or leave full precision it's up to us. 
      // Mongoose saves full precision float naturally. We'll leave it as is to maintain accuracy.
      shop.averageRating = newAvg; 
      
      await shop.save();

      // 7. Send Email Notification to Seller
      if (shop.email) {
        const subject = `New ${rating}-Star Review on Order #${order._id.toString().slice(-6).toUpperCase()}`;
        const html = `
          <div style="font-family: sans-serif; color: #333; max-w: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f97316; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px;">New Customer Review!</h2>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${shop.shopName}</strong>,</p>
              <p style="font-size: 16px; margin-bottom: 20px;">A customer just left a review for their recent order.</p>

              <div style="background-color: #fffaf0; border: 1px solid #ffe8cc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Order ID:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <strong style="font-size: 16px; margin-right: 10px;">Rating:</strong>
                  <span style="font-size: 20px; color: #f97316; font-weight: bold;">${rating} / 5 Stars ⭐</span>
                </div>
                ${feedback ? `
                  <div style="background-color: #ffffff; border-left: 4px solid #f97316; padding: 15px; font-style: italic; color: #555;">
                    "${feedback}"
                  </div>
                ` : '<p style="color: #777; font-style: italic; margin: 0;">No text feedback provided.</p>'}
              </div>

              <p style="font-size: 16px; color: #555;">Check your dashboard for more details.</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #eee; color: #888; font-size: 12px;">
              &copy; ${new Date().getFullYear()} Our Local Marketplace. All rights reserved.
            </div>
          </div>
        `;
        sendEmail(shop.email, subject, html); // Non-blocking
      }
    }

    return NextResponse.json({ success: true, message: "Review submitted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Submit Review Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
