import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// Make sure this path matches where you export authOptions!
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import db from "@/lib/db";
import User from "@/models/user";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.connect();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sort addresses so the default one is always at the top of the array
    const sortedAddresses = user.addresses.sort((a, b) => b.isDefault - a.isDefault);

    return NextResponse.json({ success: true, addresses: sortedAddresses });
  } catch (error) {
    console.error("GET Address Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { label, address, city, lat, lng, isDefault } = body;

    // Validate inputs
    if (!address || !city || !lat || !lng) {
      return NextResponse.json({ error: "Missing required location data" }, { status: 400 });
    }

    await db.connect();
    const user = await User.findById(session.user.id);

    // If this is the user's very first address, force it to be the default
    const isFirstAddress = user.addresses.length === 0;
    const setAsDefault = isDefault || isFirstAddress;

    // If this new address is the default, remove the default flag from all existing addresses
    if (setAsDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Create the new Address object
    const newAddress = {
      label: label || "Home",
      address,
      city,
      location: {
        type: "Point",
        // 🚨 CRITICAL: MongoDB GeoJSON strictly requires [Longitude, Latitude] order
        coordinates: [lng, lat] 
      },
      isDefault: setAsDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    // Return the updated, sorted list
    const sortedAddresses = user.addresses.sort((a, b) => b.isDefault - a.isDefault);

    return NextResponse.json({ success: true, addresses: sortedAddresses });
  } catch (error) {
    console.error("POST Address Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}