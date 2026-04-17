import { notFound } from "next/navigation";
import db from "@/lib/db";
import Seller from "@/models/seller";
import mongoose from "mongoose";

// This will generate metadata for individual shop pages
export async function generateMetadata({ params }) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return { title: "Shop Not Found | Martly" };
  }

  let shop = null;
  try {
    await db.connect();
    shop = await Seller.findById(id).select("shopName shopDescription shopBanner shopLogo shopType").lean();
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Shop | Martly",
      description: "Browse and shop from local stores",
    };
  }

  if (!shop) notFound();

  return {
    title: `${shop.shopName} - Order Online | Martly`,
    description: `Shop at ${shop.shopName}. ${shop.shopDescription || "Browse products and order online."} Fast delivery available.`,
    openGraph: {
      title: `${shop.shopName} | Martly Marketplace`,
      description: shop.shopDescription || "Shop online at this local store",
        type: "website",
        images: [
          {
            url: shop.shopBanner || "https://martly.me/og-image.png",
            width: 1200,
            height: 630,
            alt: shop.shopName,
          },
          {
            url: shop.shopLogo || "https://martly.me/logo.png",
            width: 400,
            height: 400,
            alt: `${shop.shopName} logo`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: shop.shopName,
        description: shop.shopDescription,
        images: [shop.shopBanner || "https://martly.com/og-image.png"],
      },
      keywords: `${shop.shopName}, ${shop.shopType}, online shopping, order online, delivery`,
    };
}

export default function ShopLayout({ children }) {
  return <>{children}</>;
}
