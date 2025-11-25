import { NextResponse } from 'next/server';
import db from '@/lib/db';
import Product from '@/models/product';

// ✅ GET /api/vendor/products?shopId=xxxx&page=1&limit=10
export async function GET(request) {
  try {
    await db.connect();

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shopId");
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

// ✅ POST /api/vendor/products
export async function POST(request) {
  try {
    await db.connect();

    const body = await request.json();
    const { shopId, name, description, price, category, stock, unit, barcode, imageUrl, isActive } = body;

    // 🧠 Validate shopId
    if (!shopId) {
      return NextResponse.json(
        { error: "Missing shopId. Unauthorized access." },
        { status: 400 }
      );
    }

    // 🧠 Validate required fields
    if (!name || !description || !price || !category || !stock || !unit || !barcode) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // 🔍 Check for duplicate barcode (scoped to the same shop)
    const existingProduct = await Product.findOne({ barcode, shopId });
    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this barcode already exists in your shop." },
        { status: 409 } // Conflict
      );
    }

    // ✅ Create new product
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
