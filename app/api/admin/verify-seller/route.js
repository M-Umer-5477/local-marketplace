import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
// Import the named export from your new mailer
import { sendEmail } from "@/lib/mailer"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function POST(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
        
            if (!session || session.user.role !== "admin") {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
    const { sellerId, action } = await req.json(); 

    // Basic Validation
    if (!sellerId || !action) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
        return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // ---------------------------------------------------------
    // 1. REPAIR LOCATION BUG (Safety Check)
    // ---------------------------------------------------------
    // If coordinates are missing or invalid, set default to avoid Index Error
    if (!seller.shopLocation || !seller.shopLocation.coordinates || seller.shopLocation.coordinates.length < 2) {
        console.log(`Fixing location for seller: ${seller.shopName}`);
        seller.shopLocation = { 
            type: "Point", 
            coordinates: [74.0, 32.0] // Default (e.g., Gujrat coordinates)
        };
    }

    // ---------------------------------------------------------
    // 2. UPDATE STATUS
    // ---------------------------------------------------------
    seller.verificationStatus = action;
    
    if (action === "Approved") {
        seller.isActive = true; 
        
    } else if (action === "Rejected") {
        seller.isActive = false;
    }

    // Save to Database
    await seller.save();

    // ---------------------------------------------------------
    // 3. SEND EMAIL NOTIFICATION (Non-blocking)
    // ---------------------------------------------------------
    if (seller.email) {
        try {
            const dashboardUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            let subject = "";
            let htmlMessage = "";

            if (action === "Approved") {
                subject = "🎉 Congratulations! Your ShopSync Account is Approved";
                htmlMessage = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #16a34a;">You are Live! 🚀</h2>
                        <p>Dear <strong>${seller.fullName}</strong>,</p>
                        <p>We are excited to inform you that your shop <strong>${seller.shopName}</strong> has been verified.</p>
                        <p>You can now log in to your Vendor Dashboard.</p>
                        <a href="${dashboardUrl}/login" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Go to Dashboard</a>
                    </div>
                `;
            } else if (action === "Rejected") {
                subject = "⚠️ Update on your ShopSync Application";
                htmlMessage = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #dc2626;">Application Status</h2>
                        <p>Dear <strong>${seller.fullName}</strong>,</p>
                        <p>Unfortunately, we could not approve your shop <strong>${seller.shopName}</strong> due to documentation issues.</p>
                        <p>Please contact support.</p>
                    </div>
                `;
            }

            // Send the email
            await sendEmail(seller.email, subject, htmlMessage);
            
        } catch (emailError) {
            console.error("Failed to send notification email:", emailError);
            // We do NOT return an error here, because the DB update was successful.
        }
    }

    return NextResponse.json({ success: true, message: `Seller ${action} Successfully` }, { status: 200 });

  } catch (error) {
    console.error("Admin Verify Error:", error);
    return NextResponse.json({ error: "Update failed: " + error.message }, { status: 500 });
  }
}