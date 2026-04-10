import { NextResponse } from 'next/server';
import db from '@/lib/db';
import Product from '@/models/product';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Seller from '@/models/seller';

export async function GET(request) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "seller") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await Seller.findOne({ email: session.user.email });
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    
    const shopId = seller._id.toString();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    if (!shopId) {
      return NextResponse.json(
        { error: "Missing shopId. Unauthorized access." },
        { status: 400 }
      );
    }

    const products = await Product.find({ shopId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments({ shopId });

    return NextResponse.json(
      {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    await db.connect();
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "seller") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await Seller.findOne({ email: session.user.email });
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    
    const shopId = seller._id.toString();

    const body = await request.json();
    const { name, description, price, category, stock, unit, barcode, imageUrl, isActive } = body;

    if (!shopId) {
      return NextResponse.json(
        { error: "Missing shopId. Unauthorized access." },
        { status: 400 }
      );
    }

    if (!name || !description || !price || !category || !stock || !unit || !barcode) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const existingProduct = await Product.findOne({ barcode, shopId });
    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this barcode already exists in your shop." },
        { status: 409 } // Conflict
      );
    }

    
    const newProduct = new Product({
      ...body,
      shopId,
    });

    await newProduct.save();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("POST Product Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
