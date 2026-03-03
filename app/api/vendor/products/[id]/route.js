import { NextResponse } from 'next/server';
import db from '@/lib/db';
import Product from '@/models/product';
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
    const body = await request.json();
    const { shopId, ...updateData } = body;

    // 🧠 Validate shopId
    if (!shopId) {
      return NextResponse.json(
        { error: 'Missing shopId. Unauthorized access.' },
        { status: 400 }
      );
    }

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

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    // 🧠 Validate shopId
    if (!shopId) {
      return NextResponse.json(
        { error: 'Missing shopId. Unauthorized access.' },
        { status: 400 }
      );
    }

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
