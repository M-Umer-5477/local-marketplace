
"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  LifeBuoy,
  LogOut,
  Settings,
  CreditCard,
  PanelLeft,
  PanelRight,
  BadgePercent,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Store,
  BookUser,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";


const VendorHeader = ({ isCollapsed, onToggleSidebar, session }) => {
  
  const pathname = usePathname();
  const user = session?.user;
  if (!user) return null;
  
  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const vendorLinks = [
    { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vendor/manageProducts", label: "Manage Products", icon: Package },
    { href: "/vendor/orders", label: "Online Orders", icon: ShoppingCart },
    { href: "/vendor/pos", label: "Offline Checkout", icon: ClipboardList },
    { href: "/vendor/khata", label: "Customer Khata", icon: BookUser },
    { href: "/vendor/wallet", label: "Shop Wallet", icon: Wallet },
    { href: "/vendor/myShop", label: "View My Shop", icon: Store },
  ];


  return (
    // UPDATED: bg-white -> bg-background, added subtle border-border
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-background border-b border-border sticky top-0 z-40">
      
      {/* LEFT SECTION: Brand + Hamburger */}
      <div className="flex items-center gap-3">
        {/* Desktop toggle button */}
        <Button
          size="icon"
          variant="ghost"
          className="hidden md:flex text-foreground/80 hover:text-foreground"
          onClick={onToggleSidebar}
        >
          {isCollapsed ? (
            <PanelRight className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        {/* Mobile sheet trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="md:hidden text-foreground/80 hover:text-foreground">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-r border-border p-0">
            {/* Header with brand */}
            <div className="flex items-center gap-2 px-4 py-6">
              <BadgePercent className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">MartLy</span>
            </div>
            
            {/* Navigation links */}
            <nav className="flex flex-col space-y-2 px-4">
              {vendorLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Brand name (ShopSync) */}
        <div className="flex items-center gap-2">
          <BadgePercent className="h-6 w-6 text-primary" />
          {/* UPDATED: text-gray-800 -> text-foreground */}
          <span className="text-lg font-bold text-foreground">MartLy</span>
        </div>
      </div>

      {/* RIGHT SECTION: Theme Toggle + Notifications + Profile */}
      <div className="flex items-center gap-3">
        
        {/* ADD THEME TOGGLE */}
        <ModeToggle />

        <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          {/* Dropdown menu inherits theme colors automatically */}
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/vendor/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/vendor/stripe-setup">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Stripe Setup</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default VendorHeader;