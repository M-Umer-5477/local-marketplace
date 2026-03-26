import db from "@/lib/db";
import Seller from "@/models/seller";

export async function GET() {
  try {
    await db.connect();

    // Fetch all shops/sellers
    const shops = await Seller.find({ isVerified: true, verificationStatus: "Approved" })
      .select("_id updatedAt")
      .lean();

    // Base URLs
    const baseUrl = process.env.NEXTAUTH_URL || "https://martly.me";

    // Static pages
    const staticPages = [
      {
        url: `${baseUrl}/`,
        changefreq: "weekly",
        priority: "1.0",
      },
      {
        url: `${baseUrl}/shops`,
        changefreq: "daily",
        priority: "0.9",
      },
    ];

    // Dynamic shop pages
    const shopPages = shops.map((shop) => ({
      url: `${baseUrl}/shops/${shop._id}`,
      lastmod: shop.updatedAt ? shop.updatedAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "0.8",
    }));

    // Combine all pages
    const allPages = [...staticPages, ...shopPages];

    // Generate XML
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(xmlContent, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
