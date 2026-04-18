"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cartContext";
import { ModeToggle } from "@/components/mode-toggle";
import CheckoutAuthModal from "@/components/auth/CheckoutAuthModal";
import AddressSelector from "@/components/AddressSelector";
import MartLyIcon from "@/components/ui/MartlyIcon";

// Icons
import {
  Menu,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  Store,
  Home,
  ShoppingBag,
  UserPlus,
  LogIn,
  Package,
  ChevronRight,
  MapPin,
  X,
} from "lucide-react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Nav Link with active state ---
function NavLink({ href, children, pathname }) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`relative text-sm font-medium transition-colors duration-200 group ${
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full transition-all duration-300 ${
          isActive ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

// --- Mobile Nav Link ---
function MobileNavLink({ href, icon: Icon, label, pathname, onClick }) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-[15px] font-medium group ${
        isActive
          ? "bg-primary/10 text-primary border border-primary/15"
          : "hover:bg-muted/80 text-foreground"
      }`}
    >
      <div
        className={`p-1.5 rounded-lg transition-colors duration-200 ${
          isActive
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1">{label}</span>
      {isActive && (
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
      )}
    </Link>
  );
}

export default function MainNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Cart Logic
  const { cartCount, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    clearCart();
    await signOut({ callbackUrl: "/" });
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        {/* ═══════════════════════════════════════════════════
            LEFT SECTION: Logo & Address
        ═══════════════════════════════════════════════════ */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight transition-all duration-200 hover:opacity-80 shrink-0"
          >
            <MartLyIcon className="w-8 h-8" />
            <span className="bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              MartLy
            </span>
          </Link>

          {/* Desktop Address Selector — Enhanced two-line style */}
          <div className="hidden md:flex">
            <AddressSelector compact />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            CENTER: Desktop Navigation
        ═══════════════════════════════════════════════════ */}
        <nav className="hidden lg:flex items-center gap-7">
          {!session && (
            <NavLink href="/" pathname={pathname}>
              Home
            </NavLink>
          )}

          {session && session.user?.role === "customer" && (
            <NavLink href="/dashboard" pathname={pathname}>
              Dashboard
            </NavLink>
          )}

          <NavLink href="/shops" pathname={pathname}>
            Browse Shops
          </NavLink>

          {session && (
            <NavLink href="/orders" pathname={pathname}>
              My Orders
            </NavLink>
          )}

          {!session && (
            <NavLink href="/vendor/register" pathname={pathname}>
              Become a Seller
            </NavLink>
          )}
        </nav>

        {/* ═══════════════════════════════════════════════════
            RIGHT SECTION: Actions
        ═══════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle — Desktop */}
          <div className="hidden md:flex">
            <ModeToggle />
          </div>

          {/* Cart — Both mobile & desktop for logged-in users */}
          {session && (
            <Link href="/checkout">
              <Button
                variant="ghost"
                size="icon"
                className="relative transition-all duration-200 hover:bg-primary/10 rounded-xl"
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                {mounted && cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-[18px] min-w-[18px] flex items-center justify-center rounded-full text-[10px] px-1 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                    {cartCount > 9 ? "9+" : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative gap-2.5 pl-2 pr-3 transition-all duration-200 hover:bg-primary/10 rounded-xl h-10"
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/20 transition-all duration-200">
                      <AvatarImage
                        src={session.user?.image}
                        alt={session.user?.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {getInitials(session.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-foreground max-w-[100px] truncate hidden xl:inline">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-60 rounded-xl shadow-xl border-border/60"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={session.user?.image} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {getInitials(session.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5 overflow-hidden">
                        <p className="text-sm font-bold leading-none truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {session.user?.role === "customer" && (
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer gap-2.5 px-4 py-2.5 rounded-lg mx-1">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <Link href="/orders">
                    <DropdownMenuItem className="cursor-pointer gap-2.5 px-4 py-2.5 rounded-lg mx-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400 cursor-pointer gap-2.5 px-4 py-2.5 rounded-lg mx-1 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <CheckoutAuthModal>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl px-4 text-sm font-medium transition-all duration-200 hover:bg-muted"
                  >
                    Login
                  </Button>
                </CheckoutAuthModal>
                <CheckoutAuthModal>
                  <Button
                    size="sm"
                    className="rounded-xl px-5 text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30"
                  >
                    Get Started
                  </Button>
                </CheckoutAuthModal>
              </div>
            )}
          </div>

          {/* Mobile: Login icon for guests */}
          {!session && (
            <CheckoutAuthModal>
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden transition-all duration-200 hover:bg-primary/10 rounded-xl"
              >
                <LogIn className="h-5 w-5 text-muted-foreground" />
              </Button>
            </CheckoutAuthModal>
          )}

          {/* ═══════════════════════════════════════════════════
              MOBILE MENU (Sheet)
          ═══════════════════════════════════════════════════ */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="transition-all duration-200 hover:bg-primary/10 rounded-xl"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="flex flex-col h-full w-[85vw] sm:w-[380px] overflow-y-auto p-0"
              >
                {/* ── Header ── */}
                <div className="px-6 pt-6 pb-4">
                  <SheetHeader className="text-left">
                    <SheetTitle className="flex items-center gap-2.5 text-xl font-bold">
                      <MartLyIcon className="w-7 h-7" />
                      MartLy
                    </SheetTitle>
                  </SheetHeader>
                </div>

                {/* ── Location Card ── */}
                <div className="px-5 pb-4">
                  <div className="bg-linear-to-br from-primary/8 to-primary/3 p-4 rounded-2xl border border-primary/15">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-primary/15">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        Delivering To
                      </span>
                    </div>
                    <AddressSelector compact />
                  </div>
                </div>

                {/* ── Navigation Links ── */}
                <div className="flex-1 px-5 py-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-2">
                    Navigation
                  </p>
                  <div className="space-y-1">
                    {!session && (
                      <MobileNavLink
                        href="/"
                        icon={Home}
                        label="Home"
                        pathname={pathname}
                        onClick={() => setOpen(false)}
                      />
                    )}

                    {session && session.user?.role === "customer" && (
                      <MobileNavLink
                        href="/dashboard"
                        icon={LayoutDashboard}
                        label="Dashboard"
                        pathname={pathname}
                        onClick={() => setOpen(false)}
                      />
                    )}

                    <MobileNavLink
                      href="/shops"
                      icon={Store}
                      label="Browse Shops"
                      pathname={pathname}
                      onClick={() => setOpen(false)}
                    />

                    {session && (
                      <MobileNavLink
                        href="/orders"
                        icon={Package}
                        label="My Orders"
                        pathname={pathname}
                        onClick={() => setOpen(false)}
                      />
                    )}

                    {!session && (
                      <MobileNavLink
                        href="/vendor/register"
                        icon={UserPlus}
                        label="Become a Seller"
                        pathname={pathname}
                        onClick={() => setOpen(false)}
                      />
                    )}
                  </div>
                </div>

                {/* ── Bottom Section: Theme & Auth ── */}
                <div className="px-5 pb-6 pt-2 space-y-4 border-t border-border/60">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-semibold text-foreground">
                      Appearance
                    </span>
                    <ModeToggle />
                  </div>

                  {session ? (
                    <div className="space-y-3">
                      {/* User Info Card */}
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-sm">
                        <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-sm">
                          <AvatarImage src={session.user?.image} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {getInitials(session.user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm overflow-hidden flex-1">
                          <p className="font-bold truncate text-foreground">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      {/* Sign Out */}
                      <Button
                        className="w-full gap-2 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-900/30 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all duration-200 rounded-xl h-11"
                        variant="outline"
                        onClick={() => {
                          handleLogout();
                          setOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <CheckoutAuthModal>
                        <Button className="w-full h-11 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 gap-2">
                          <LogIn className="h-4 w-4" />
                          Get Started
                        </Button>
                      </CheckoutAuthModal>
                      <CheckoutAuthModal>
                        <Button
                          variant="outline"
                          className="w-full h-11 rounded-xl font-medium transition-all duration-200 hover:bg-primary/5"
                        >
                          Login
                        </Button>
                      </CheckoutAuthModal>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}