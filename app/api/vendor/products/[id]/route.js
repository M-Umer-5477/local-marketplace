import { NextResponse } from 'next/server';
import db from '@/lib/db';
import Product from '@/models/product';
import Seller from '@/models/seller';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request, { params }) {
  const { id } = await params;

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
    // Safely remove shopId if it was sent by client to prevent overriding
    const { shopId: bodyShopId, ...updateData } = body;

    // 🧠 Find the product
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 🧠 Ensure product belongs to this shop
    if (product.shopId.toString() !== shopId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ✅ Apply updates and save
    Object.assign(product, updateData);
    await product.save();

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('PUT Product Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ✅ DELETE /api/vendor/products/:productId?shopId=xxxxx — delete a product
export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await db.connect();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "seller") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await Seller.findOne({ email: session.user.email });
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    const shopId = seller._id.toString();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 🧠 Ensure product belongs to this shop
    if (product.shopId.toString() !== shopId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Product Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
