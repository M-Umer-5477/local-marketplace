import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import User from "@/models/user";
import Seller from "@/models/seller";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await Seller.findById(session.user.id).select("fullName email phone role");
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        phone: seller.phone || "",
        role: seller.role,
      },
    });
  } catch (error) {
    console.error("Vendor Profile GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      currentPassword,
      newPassword,
      confirmPassword,
    } = body;

    const seller = await Seller.findById(session.user.id).select("+password");
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const updates = {};

    if (typeof fullName === "string") {
      const trimmedName = fullName.trim();
      if (!trimmedName || trimmedName.length < 2) {
        return NextResponse.json(
          { error: "Name must be at least 2 characters" },
          { status: 400 }
        );
      }
      updates.fullName = trimmedName;
    }

    if (typeof phone === "string") {
      const normalizedPhone = phone.trim();
      if (!normalizedPhone) {
        return NextResponse.json({ error: "Phone is required" }, { status: 400 });
      }

      if (normalizedPhone !== seller.phone) {
        const existingSeller = await Seller.findOne({
          phone: normalizedPhone,
          _id: { $ne: seller._id },
        }).select("_id");

        const existingUser = await User.findOne({ phone: normalizedPhone }).select("_id");

        if (existingSeller || existingUser) {
          return NextResponse.json(
            { error: "This phone number is already in use" },
            { status: 409 }
          );
        }
      }

      updates.phone = normalizedPhone;
    }

    const wantsPasswordUpdate =
      typeof newPassword === "string" && newPassword.trim().length > 0;

    if (wantsPasswordUpdate) {
      if (!currentPassword || !confirmPassword) {
        return NextResponse.json(
          { error: "Current and confirm password are required" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "New password and confirm password do not match" },
          { status: 400 }
        );
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, seller.password);
      if (!isCurrentValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes provided" },
        { status: 400 }
      );
    }

    Object.assign(seller, updates);
    await seller.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        phone: seller.phone || "",
        role: seller.role,
      },
    });
  } catch (error) {
    console.error("Vendor Profile PUT Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}