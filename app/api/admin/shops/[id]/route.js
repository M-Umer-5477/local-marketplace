import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import db from "@/lib/db";
import Seller from "@/models/seller";
import Product from "@/models/product";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    await db.connect();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
    }

    const shop = await Seller.findById(id)
      .select("shopName shopLogo shopBanner shopAddress shopType fullName phone isActive isShopOpen verificationStatus")
      .lean();

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const products = await Product.find({ shopId: id })
      .select("name description price imageUrl category stock unit barcode isActive isDelistedByAdmin adminDelistedAt createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        shop,
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin Shop Review GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}