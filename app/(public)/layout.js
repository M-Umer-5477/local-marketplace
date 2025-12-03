// import MainNavbar from "@/components/nav/MainNavbar";


// export const metadata = {
//   title: "ShopSync | Marketplace",
//   description: "Buy and sell from local stores with ShopSync",
// };
// export default function PublicLayout({ children }) {
//   return (
//     <div className="flex min-h-screen flex-col bg-background">
//       <MainNavbar />
//       <main className="flex-1">{children}</main>
//     </div>
//   );
// }
import PublicLayoutClient from"@/app/(public)/PublicLayoutClient";

export const metadata = {
  title: "ShopSync | Marketplace",
  description: "Buy and sell from local stores with ShopSync",
};

export default function PublicLayout({ children }) {
  return <PublicLayoutClient> {children}</PublicLayoutClient>;
}

