import { notFound } from "next/navigation";

// This will generate metadata for individual shop pages
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/customer/shops/${params.id}`, {
      cache: "revalidate",
      revalidateTime: 3600, // Revalidate every hour
    });

    if (!res.ok) throw new Error("Shop not found");

    const data = await res.json();
    const shop = data.shop;

    if (!shop) notFound();

    return {
      title: `${shop.shopName} - Order Online | Martly`,
      description: `Shop at ${shop.shopName}. ${shop.shopDescription || "Browse products and order online."} Fast delivery available.`,
      openGraph: {
        title: `${shop.shopName} | Martly Marketplace`,
        description: shop.shopDescription || "Shop online at this local store",
        type: "business.business",
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
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Shop | Martly",
      description: "Browse and shop from local stores",
    };
  }
}

export default function ShopLayout({ children }) {
  return <>{children}</>;
}
