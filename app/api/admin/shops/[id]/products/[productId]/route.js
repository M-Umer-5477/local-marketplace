import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import db from "@/lib/db";
import Product from "@/models/product";
import Seller from "@/models/seller";
import { sendEmail } from "@/lib/mailer";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function handleModeration(req, { params }) {
  try {
    await db.connect();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, productId } = await params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: "Invalid IDs provided" }, { status: 400 });
    }

    const body = await req.json();
    const { action } = body;

    if (!["delist", "relist"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.shopId.toString() !== id) {
      return NextResponse.json({ error: "Product does not belong to this shop" }, { status: 403 });
    }

    product.isDelistedByAdmin = action === "delist";
    product.adminDelistedAt = action === "delist" ? new Date() : null;
    await product.save();

    if (action === "delist") {
      const seller = await Seller.findById(product.shopId).select("email fullName shopName");
      if (seller?.email) {
        const subject = "Product Delisted for Policy Compliance - Martly";
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #b91c1c; margin: 0 0 12px 0;">Product Delisted</h2>
            <p>Dear <strong>${seller.fullName || "Seller"}</strong>,</p>
            <p>Your product <strong>${product.name}</strong> from shop <strong>${seller.shopName || "your shop"}</strong> has been delisted by platform admin due to policy guideline concerns.</p>
            <p>This product is currently hidden from customers. Please review platform guidelines and update the listing if needed.</p>
            <p style="margin-top: 16px; color: #6b7280; font-size: 13px;">If you believe this was a mistake, please contact support.</p>
          </div>
        `;

        // Keep moderation flow non-blocking even if SMTP has a temporary issue.
        await sendEmail(seller.email, subject, html);
      }
    }

    return NextResponse.json(
      {
        success: true,
        product,
        message: action === "delist" ? "Product delisted successfully" : "Product relisted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin Product Moderation PATCH Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, context) {
  return handleModeration(req, context);
}

export async function POST(req, context) {
  return handleModeration(req, context);
}