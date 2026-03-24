
import PublicLayoutClient from"@/app/(public)/PublicLayoutClient";

export const metadata = {
  title: "MartLy | Marketplace",
  description: "Buy and sell from local stores with ShopSync",
};

export default function PublicLayout({ children }) {
  return <PublicLayoutClient> {children}</PublicLayoutClient>;
}

