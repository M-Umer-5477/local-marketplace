"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/cartContext";
import { ModeToggle } from "@/components/mode-toggle"; 
import CheckoutAuthModal from "@/components/auth/CheckoutAuthModal";
import AddressSelector from "@/components/AddressSelector";

// Icons
import { 
  Menu, 
  BadgePercent, 
  ShoppingCart, 
  LogOut, 
  LayoutDashboard,
  Store,
  Home,
  ShoppingBag,
  UserPlus,
  LogIn
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
  SheetTitle
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MainNavbar() {
  const { data: session } = useSession();
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
    return name ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        
        {/* --- LEFT SECTION: Logo & Address --- */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight transition-all duration-200 hover:opacity-80">
            <div className="bg-primary/10 p-1.5 rounded-lg transition-colors duration-200">
                <BadgePercent className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              Martly
            </span>
          </Link>

          <div className="hidden md:flex">
             <AddressSelector compact />
          </div>
        </div>

        {/* --- 2. DESKTOP NAVIGATION --- */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {!session && (
            <Link href="/" className="relative text-muted-foreground transition-colors duration-200 hover:text-primary group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
          )}

          {session && session.user?.role === 'customer' && (
            <Link href="/dashboard" className="relative text-muted-foreground transition-colors duration-200 hover:text-primary group">
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
          )}

          <Link href="/shops" className="relative text-muted-foreground transition-colors duration-200 hover:text-primary group">
            Browse Shops
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>

          {session && (
            <Link href="/orders" className="relative text-muted-foreground transition-colors duration-200 hover:text-primary group">
              My Orders
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
          )}

          {!session && (
            <Link href="/vendor/register" className="relative text-muted-foreground transition-colors duration-200 hover:text-primary group">
              Become a Seller
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
          )}
        </nav>

        {/* --- 3. RIGHT SECTION --- */}
        <div className="flex items-center gap-3">
          
          <div className="hidden md:flex">
             <ModeToggle />
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Link href="/checkout">
                  <Button variant="ghost" size="icon" className="relative transition-all duration-200 hover:bg-primary/10 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground transition-colors duration-200" />
                    {mounted && cartCount > 0 && (
                      <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full text-[10px] px-0 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse">
                        {cartCount > 9 ? '9+' : cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative gap-2 px-2 transition-all duration-200 hover:bg-primary/10 rounded-lg">
                      <Avatar className="h-8 w-8 border border-primary/20 transition-all duration-200">
                        <AvatarImage src={session.user?.image} alt={session.user?.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{getInitials(session.user?.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {session.user?.role === 'customer' && (
                      <Link href={"/dashboard"}>
                        <DropdownMenuItem className="cursor-pointer gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <Link href={"/orders"}>
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        <span>My Orders</span>
                      </DropdownMenuItem>
                    </Link>
                   
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 cursor-pointer gap-2" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <CheckoutAuthModal>
                    <Button variant="outline" size="sm" className="rounded-full px-4 transition-all duration-200 hover:bg-primary/5">
                      Login
                    </Button>
                </CheckoutAuthModal>
                <CheckoutAuthModal>
                    <Button size="sm" className="rounded-full px-4 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30">
                      Get Started
                    </Button>
                </CheckoutAuthModal>
              </div>
            )}
          </div>

          {/* Mobile Auth Section - Show single compact sign in button on mobile when not logged in */}
          {!session && (
            <CheckoutAuthModal>
              <Button size="icon" variant="ghost" className="md:hidden transition-all duration-200 hover:bg-primary/10 rounded-lg">
                <LogIn className="h-5 w-5 text-muted-foreground transition-colors duration-200" />
              </Button>
            </CheckoutAuthModal>
          )}

          {/* --- 4. MOBILE MENU --- */}
          <div className="md:hidden flex items-center">
             <Sheet open={open} onOpenChange={setOpen}>
               <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="transition-all duration-200 hover:bg-primary/10 rounded-lg">
                     <Menu className="h-5 w-5" />
                  </Button>
               </SheetTrigger>
               
               <SheetContent side="right" className="flex flex-col h-full w-[85vw] sm:w-[350px] overflow-y-auto px-6 py-6">
                 
                 <SheetHeader className="text-left mb-6">
                   <SheetTitle className="flex items-center gap-3 text-2xl font-bold">
                      <div className="bg-primary/10 p-1.5 rounded-lg transition-colors duration-200">
                        <BadgePercent className="h-6 w-6 text-primary"/>
                      </div> 
                      Martly
                   </SheetTitle>
                 </SheetHeader>
                 
                 <div className="bg-muted/40 p-3.5 rounded-lg border border-border/50 mb-6 transition-colors duration-200">
                    <p className="text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-wider">📍 Delivering To</p>
                    <AddressSelector compact />
                 </div>
                 
                 <div className="flex flex-col gap-1 flex-1">
                    {!session && (
                      <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-all duration-200 text-base font-medium group">
                          <Home className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                          Home
                      </Link>
                    )}

                    {session && session.user?.role === 'customer' && (
                      <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-all duration-200 text-base font-medium group">
                          <LayoutDashboard className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                          Dashboard
                      </Link>
                    )}

                    <Link href="/shops" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-all duration-200 text-base font-medium group">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                        Browse Shops
                    </Link>

                    {session && (
                      <Link href="/orders" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-all duration-200 text-base font-medium group">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                        My Orders
                      </Link>
                    )}

                    {!session && (
                      <Link href="/vendor/register" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-all duration-200 text-base font-medium group">
                          <UserPlus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                          Become a Seller
                      </Link>
                    )}
                 </div>

                 {/* Bottom Section: Theme & Auth */}
                 <div className="border-t pt-4 mt-6 space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <span className="text-sm font-medium">Theme</span>
                       <ModeToggle />
                    </div>

                    {session ? (
                       <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-primary/5 border border-primary/20 transition-all duration-200">
                             <Avatar className="h-10 w-10 border border-primary/20">
                               <AvatarImage src={session.user?.image} />
                               <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{getInitials(session.user?.name)}</AvatarFallback>
                             </Avatar>
                             <div className="text-sm overflow-hidden flex-1">
                                <p className="font-semibold truncate">{session.user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                             </div>
                          </div>
                          <Button 
                            className="w-full gap-2 text-red-600 border-red-200/50 hover:bg-red-50/50 transition-all duration-200" 
                            variant="outline" 
                            onClick={() => { handleLogout(); setOpen(false); }}
                          >
                             <LogOut className="h-4 w-4" /> Sign Out
                          </Button>
                       </div>
                    ) : (
                       <div className="flex flex-col gap-2">
                          <CheckoutAuthModal>
                              <Button variant="outline" className="w-full h-10 rounded-lg transition-all duration-200 hover:bg-primary/5">
                                Login
                              </Button>
                          </CheckoutAuthModal>
                          <CheckoutAuthModal>
                              <Button className="w-full h-10 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/30">
                                Sign Up
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