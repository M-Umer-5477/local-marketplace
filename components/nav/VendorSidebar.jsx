// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   ClipboardList,
//   Store,
//   BookUser,
// } from "lucide-react";
// import { cn } from "@/lib/utils";

// const VendorSidebar = ({ isCollapsed }) => {
//   const pathname = usePathname();

//   const vendorLinks = [
//     { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
//     { href: "/vendor/manageProducts", label: "Manage Products", icon: Package },
//     { href: "/vendor/manageOrders", label: "Online Orders", icon: ShoppingCart },
//     { href: "/vendor/pos", label: "Offline Checkout", icon: ClipboardList },
//     { href: "/vendor/khata", label: "Customer Khata", icon: BookUser },
//     { href: "/vendor/shop", label: "View My Shop", icon: Store },
//   ];

//   return (
//     <aside
//       className={cn(
//         "hidden md:flex flex-col h-[calc(100vh-4rem)] px-4 py-6 bg-gray-50 border-r transition-all duration-300 ease-in-out",
//         isCollapsed ? "w-20" : "w-64"
//       )}
//     >
//       <nav className="flex flex-col space-y-2">
//         {vendorLinks.map((link) => (
//           <Link
//             key={link.href}
//             href={link.href}
//             className={cn(
//               "flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md transition-colors",
//               "hover:bg-gray-200 hover:text-gray-900",
//               pathname === link.href
//                 ? "bg-primary text-primary-foreground hover:bg-primary/90"
//                 : "",
//               isCollapsed && "justify-center px-2"
//             )}
//           >
//             <link.icon className="h-5 w-5" />
//             {!isCollapsed && <span>{link.label}</span>}
//           </Link>
//         ))}
//       </nav>
//     </aside>
//   );
// };

// export default VendorSidebar;
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Store,
  BookUser,
} from "lucide-react";
import { cn } from "@/lib/utils";

const VendorSidebar = ({ isCollapsed }) => {
  const pathname = usePathname();

  const vendorLinks = [
    { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vendor/manageProducts", label: "Manage Products", icon: Package },
    { href: "/vendor/manageOrders", label: "Online Orders", icon: ShoppingCart },
    { href: "/vendor/pos", label: "Offline Checkout", icon: ClipboardList },
    { href: "/vendor/khata", label: "Customer Khata", icon: BookUser },
    { href: "/vendor/shop", label: "View My Shop", icon: Store },
  ];

  return (
    <aside
      // UPDATED: bg-gray-50 -> bg-sidebar, added border-border
      className={cn(
        "hidden md:flex flex-col h-[calc(100vh-4rem)] px-4 py-6 bg-background border-r border-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <nav className="flex flex-col space-y-2">
        {vendorLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              // Default link state: text-sidebar-foreground (high visibility)
              "flex items-center gap-3 px-3 py-2 text-sidebar-foreground rounded-md transition-colors",
              
              // Hover state: Use accent colors for contrast
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              
              // Active state: Use primary theme colors for strong emphasis
              pathname === link.href
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                : "",
              
              isCollapsed && "justify-center px-2"
            )}
          >
            <link.icon className="h-5 w-5" />
            {!isCollapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default VendorSidebar;