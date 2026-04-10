import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch Shop Details
export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await Seller.findOne({ email: session.user.email });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Convert Mongoose Document to plain JS object
    const sellerData = seller.toObject();

    // Helper: Extract Lat/Lng specifically for the Frontend to use easily
    let latitude = 0;
    let longitude = 0;
    
    if (seller.shopLocation && seller.shopLocation.coordinates) {
      // Mongo stores as [Lng, Lat]
      longitude = seller.shopLocation.coordinates[0];
      latitude = seller.shopLocation.coordinates[1];
    }

    return NextResponse.json({ 
      success: true, 
      data: { ...sellerData, latitude, longitude } 
    }, { status: 200 });

  } catch (error) {
    console.error("Fetch Shop Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// PUT: Update Shop Details
export async function PUT(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Prepare update object
    let updateData = { ...body };

    // 🛑 SECURITY PRECAUTION: Prevent Mass Assignment by scrubbing sensitive internal fields
    delete updateData.walletBalance;
    delete updateData.commissionRate;
    delete updateData.role;
    delete updateData.isVerified;
    delete updateData.isActive;
    delete updateData.cnic;
    delete updateData.email;
    delete updateData.transactions;
    delete updateData.verificationStatus;

    // Handle GeoJSON logic
    // Frontend sends { latitude, longitude }, Backend saves { type: 'Point', coordinates: [lng, lat] }
    if (body.latitude && body.longitude) {
      updateData.shopLocation = {
        type: "Point",
        coordinates: [parseFloat(body.longitude), parseFloat(body.latitude)] 
      };
      
      // Clean up flat fields so we don't save them to DB
      delete updateData.latitude;
      delete updateData.longitude;
    }

    const updatedSeller = await Seller.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true } // Return the updated document
    );

    return NextResponse.json({ success: true, message: "Shop settings updated", data: updatedSeller }, { status: 200 });

  } catch (error) {
    console.error("Update Shop Error:", error);
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}