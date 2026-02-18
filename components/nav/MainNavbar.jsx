"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/cartContext";
import { ModeToggle } from "@/components/mode-toggle"; 
import CheckoutAuthModal from "@/components/auth/CheckoutAuthModal"; // ✅ Import the Modal

// Icons
import { 
  Menu, 
  BadgePercent, 
  ShoppingCart, 
  LogOut, 
  LayoutDashboard,
  Store 
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
  const [open, setOpen] = useState(false); // Mobile Menu State
  
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
        
        {/* --- 1. LOGO --- */}
        <Link href="/" className="mr-8 flex items-center gap-2 font-bold text-xl tracking-tight transition-opacity hover:opacity-90">
          <div className="bg-primary/10 p-1.5 rounded-lg">
              <BadgePercent className="h-5 w-5 text-primary" />
          </div>
          <span className="bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Martly
          </span>
        </Link>

        {/* --- 2. DESKTOP NAVIGATION --- */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/shops" className="text-muted-foreground transition-colors hover:text-primary">
            Browse Shops
          </Link>
          <Link href="/vendor/register" className="text-muted-foreground transition-colors hover:text-primary">
            Become a Seller
          </Link>
        </nav>

        {/* --- 3. RIGHT SECTION --- */}
        <div className="flex items-center gap-2">
          
          {/* Cart Icon */}
          <Link href="/checkout">
            <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {mounted && cartCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full text-[10px] px-0 animate-in zoom-in">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Desktop Theme Toggle */}
          <div className="hidden md:flex">
             <ModeToggle />
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center ml-2">
            {session ? (
              // --- LOGGED IN DROPDOWN ---
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={session.user?.image} alt={session.user?.name} />
                      <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={"/orders"}>
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                  </Link>
                  {session.user.role === 'vendor' && (
                      <Link href="/vendor/products">
                        <DropdownMenuItem className="cursor-pointer">
                          <Store className="mr-2 h-4 w-4" />
                          <span>My Products</span>
                        </DropdownMenuItem>
                      </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // --- LOGGED OUT BUTTONS (Wrapped in Modal) ---
              <div className="flex items-center gap-2">
                {/* LOGIN BUTTON */}
                <CheckoutAuthModal>
                    <Button variant="ghost" size="sm">Login</Button>
                </CheckoutAuthModal>

                {/* SIGN UP BUTTON */}
                <CheckoutAuthModal>
                    <Button size="sm" className="shadow-sm">Get Started</Button>
                </CheckoutAuthModal>
              </div>
            )}
          </div>

          {/* --- 4. MOBILE MENU --- */}
          <div className="md:hidden flex items-center">
             <Sheet open={open} onOpenChange={setOpen}>
               <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                     <Menu className="h-5 w-5" />
                  </Button>
               </SheetTrigger>
               <SheetContent side="right" className="flex flex-col h-full">
                 <SheetHeader className="text-left">
                   <SheetTitle className="flex items-center gap-2">
                      <BadgePercent className="h-5 w-5 text-primary"/> ShopSync
                   </SheetTitle>
                 </SheetHeader>
                 
                 <div className="flex-1 flex flex-col gap-4 mt-8">
                    <Link href="/" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Home</Link>
                    <Link href="/shops" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Browse Shops</Link>
                    <Link href="/vendor/register" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Become a Seller</Link>
                 </div>

                 <div className="border-t pt-6 pb-6 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-medium">Theme</span>
                       <ModeToggle />
                    </div>

                    {session ? (
                       <div className="space-y-3">
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                             <Avatar className="h-8 w-8">
                               <AvatarImage src={session.user?.image} />
                               <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
                             </Avatar>
                             <div className="text-sm">
                                <p className="font-medium">{session.user?.name}</p>
                                <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                             </div>
                          </div>
                          <Button className="w-full justify-start text-red-600" variant="ghost" onClick={() => { handleLogout(); setOpen(false); }}>
                             <LogOut className="mr-2 h-4 w-4" /> Logout
                          </Button>
                       </div>
                    ) : (
                       // MOBILE AUTH BUTTONS (Also Wrapped)
                       <div className="grid grid-cols-2 gap-2">
                          <CheckoutAuthModal>
                              <Button variant="outline" className="w-full">Login</Button>
                          </CheckoutAuthModal>
                          
                          <CheckoutAuthModal>
                              <Button className="w-full">Sign Up</Button>
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
// "use client";

// import Link from "next/link";
// import { useSession, signOut } from "next-auth/react";
// import { useState, useEffect } from "react";
// import { useCart } from "@/context/cartContext";
// import { ModeToggle } from "@/components/mode-toggle"; 

// // Icons
// import { 
//   Menu, 
//   BadgePercent, 
//   ShoppingCart, 
//   User, 
//   LogOut, 
//   LayoutDashboard,
//   Store 
// } from "lucide-react";

// // ShadCN UI Components
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { 
//   Sheet, 
//   SheetContent, 
//   SheetTrigger, 
//   SheetHeader, 
//   SheetTitle,
//   SheetFooter
// } from "@/components/ui/sheet";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// export default function MainNavbar() {
//   const { data: session } = useSession();
//   const [open, setOpen] = useState(false);
  
//   // Cart Logic
//   const { cartCount, clearCart } = useCart(); // Destructure clearCart
//   const [mounted, setMounted] = useState(false);
  
//   useEffect(() => setMounted(true), []);

//   // --- LOGOUT HANDLER ---
//   const handleLogout = async () => {
//     clearCart(); // 1. Clear the cart state/localstorage
//     await signOut({ callbackUrl: "/" }); // 2. Sign out and redirect
//   };

//   // Helper: Get user initials for Avatar fallback
//   const getInitials = (name) => {
//     return name ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "U";
//   };

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
//       <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        
//         {/* --- 1. LOGO --- */}
//         <Link href="/" className="mr-8 flex items-center gap-2 font-bold text-xl tracking-tight transition-opacity hover:opacity-90">
//           <div className="bg-primary/10 p-1.5 rounded-lg">
//              <BadgePercent className="h-5 w-5 text-primary" />
//           </div>
//           <span className="bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
//             Martly
//           </span>
//         </Link>

//         {/* --- 2. DESKTOP NAVIGATION --- */}
//         <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
//           <Link 
//             href="/shops" 
//             className="text-muted-foreground transition-colors hover:text-primary"
//           >
//             Browse Shops
//           </Link>
//           <Link 
//             href="/vendor/register" 
//             className="text-muted-foreground transition-colors hover:text-primary"
//           >
//             Become a Seller
//           </Link>
//         </nav>

//         {/* --- 3. RIGHT SECTION (Cart, Theme, Auth) --- */}
//         <div className="flex items-center gap-2">
          
//           {/* Cart Icon (Always Visible) */}
//           <Link href="/checkout">
//             <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
//               <ShoppingCart className="h-5 w-5 text-muted-foreground" />
//               {mounted && cartCount > 0 && (
//                 <Badge 
//                   variant="destructive" 
//                   className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full text-[10px] px-0 animate-in zoom-in"
//                 >
//                   {cartCount}
//                 </Badge>
//               )}
//             </Button>
//           </Link>

//           {/* Desktop Only: Theme Toggle */}
//           <div className="hidden md:flex">
//              <ModeToggle />
//           </div>

//           {/* Desktop Only: Auth Dropdown */}
//           <div className="hidden md:flex items-center ml-2">
//             {session ? (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="relative h-9 w-9 rounded-full">
//                     <Avatar className="h-9 w-9 border border-border">
//                       <AvatarImage src={session.user?.image} alt={session.user?.name} />
//                       <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
//                     </Avatar>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-56" align="end" forceMount>
//                   <DropdownMenuLabel className="font-normal">
//                     <div className="flex flex-col space-y-1">
//                       <p className="text-sm font-medium leading-none">{session.user?.name}</p>
//                       <p className="text-xs leading-none text-muted-foreground">
//                         {session.user?.email}
//                       </p>
//                     </div>
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <Link href={"/orders"}>
//                     <DropdownMenuItem className="cursor-pointer">
//                       <LayoutDashboard className="mr-2 h-4 w-4" />
//                       <span>My Orders</span>
//                     </DropdownMenuItem>
//                   </Link>
//                   {session.user.role === 'vendor' && (
//                      <Link href="/vendor/products">
//                        <DropdownMenuItem className="cursor-pointer">
//                          <Store className="mr-2 h-4 w-4" />
//                          <span>My Products</span>
//                        </DropdownMenuItem>
//                      </Link>
//                   )}
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem 
//                     className="text-red-600 focus:text-red-600 cursor-pointer"
//                     onClick={handleLogout} // Updated to handleLogout
//                   >
//                     <LogOut className="mr-2 h-4 w-4" />
//                     <span>Log out</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Link href="/login">
//                    <Button variant="ghost" size="sm">Login</Button>
//                 </Link>
//                 <Link href="/register">
//                    <Button size="sm" className="shadow-sm">Get Started</Button>
//                 </Link>
//               </div>
//             )}
//           </div>

//           {/* --- 4. MOBILE MENU TRIGGER --- */}
//           <div className="md:hidden flex items-center">
//              <Sheet open={open} onOpenChange={setOpen}>
//                <SheetTrigger asChild>
//                   <Button variant="ghost" size="icon" className="hover:bg-muted/50">
//                      <Menu className="h-5 w-5" />
//                   </Button>
//                </SheetTrigger>
//                <SheetContent side="right" className="flex flex-col h-full">
//                  <SheetHeader className="text-left">
//                    <SheetTitle className="flex items-center gap-2">
//                       <BadgePercent className="h-5 w-5 text-primary"/> ShopSync
//                    </SheetTitle>
//                  </SheetHeader>
                 
//                  {/* Mobile Nav Links */}
//                  <div className="flex-1 flex flex-col gap-4 mt-8">
//                     <Link 
//                       href="/" 
//                       onClick={() => setOpen(false)} 
//                       className="text-lg font-medium hover:text-primary transition-colors"
//                     >
//                       Home
//                     </Link>
//                     <Link 
//                       href="/shops" 
//                       onClick={() => setOpen(false)} 
//                       className="text-lg font-medium hover:text-primary transition-colors"
//                     >
//                       Browse Shops
//                     </Link>
//                     <Link 
//                       href="/vendor/register" 
//                       onClick={() => setOpen(false)} 
//                       className="text-lg font-medium hover:text-primary transition-colors"
//                     >
//                       Become a Seller
//                     </Link>
//                  </div>

//                  {/* Mobile Footer (Auth & Theme) */}
//                  <div className="border-t pt-6 pb-6 space-y-4">
//                     <div className="flex items-center justify-between">
//                        <span className="text-sm font-medium">Theme</span>
//                        <ModeToggle />
//                     </div>

//                     {session ? (
//                        <div className="space-y-3">
//                           <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
//                              <Avatar className="h-8 w-8">
//                                <AvatarImage src={session.user?.image} />
//                                <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
//                              </Avatar>
//                              <div className="text-sm">
//                                 <p className="font-medium">{session.user?.name}</p>
//                                 <p className="text-xs text-muted-foreground">{session.user?.email}</p>
//                              </div>
//                           </div>
//                           <Link href={"/orders"} onClick={() => setOpen(false)}>
//                              <Button className="w-full justify-start" variant="outline">
//                                <LayoutDashboard className="mr-2 h-4 w-4" /> My Orders
//                              </Button>
//                           </Link>
//                           <Button 
//                             className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50" 
//                             variant="ghost" 
//                             onClick={() => {
//                                 handleLogout(); // Updated to handleLogout
//                                 setOpen(false);
//                             }}
//                           >
//                              <LogOut className="mr-2 h-4 w-4" /> Logout
//                           </Button>
//                        </div>
//                     ) : (
//                        <div className="grid grid-cols-2 gap-2">
//                           <Link href="/login" onClick={() => setOpen(false)}>
//                              <Button variant="outline" className="w-full">Login</Button>
//                           </Link>
//                           <Link href="/register" onClick={() => setOpen(false)}>
//                              <Button className="w-full">Sign Up</Button>
//                           </Link>
//                        </div>
//                     )}
//                  </div>
//                </SheetContent>
//              </Sheet>
//           </div>

//         </div>
//       </div>
//     </header>
//   );
// }
// "use client";

// import Link from "next/link";
// import { useSession, signOut } from "next-auth/react";
// import { useState, useEffect } from "react";
// import { useCart } from "@/context/cartContext";
// import { ModeToggle } from "@/components/mode-toggle"; 

// // Icons
// import { 
//   Menu, 
//   BadgePercent, 
//   ShoppingCart, 
//   User, 
//   LogOut, 
//   LayoutDashboard,
//   Store 
// } from "lucide-react";

// // ShadCN UI Components
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { 
//   Sheet, 
//   SheetContent, 
//   SheetTrigger, 
//   SheetHeader, 
//   SheetTitle,
//   SheetFooter
// } from "@/components/ui/sheet";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// export default function MainNavbar() {
//   const { data: session } = useSession();
//   const [open, setOpen] = useState(false);
  
//   // Cart Logic
//   const { cartCount } = useCart();
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   // Helper: Get user initials for Avatar fallback
//   const getInitials = (name) => {
//     return name ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "U";
//   };

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
//       <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        
//         {/* --- 1. LOGO --- */}
//         <Link href="/" className="mr-8 flex items-center gap-2 font-bold text-xl tracking-tight transition-opacity hover:opacity-90">
//           <div className="bg-primary/10 p-1.5 rounded-lg">
//              <BadgePercent className="h-5 w-5 text-primary" />
//           </div>
//           <span className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
//             ShopSync
//           </span>
//         </Link>

//         {/* --- 2. DESKTOP NAVIGATION --- */}
//         <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
//           <Link 
//             href="/shops" 
//             className="text-muted-foreground transition-colors hover:text-primary"
//           >
//             Browse Shops
//           </Link>
//           <Link 
//             href="/vendor/register" 
//             className="text-muted-foreground transition-colors hover:text-primary"
//           >
//             Become a Seller
//           </Link>
//         </nav>

//         {/* --- 3. RIGHT SECTION (Cart, Theme, Auth) --- */}
//         <div className="flex items-center gap-2">
          
//           {/* Cart Icon (Always Visible) */}
//           <Link href="/checkout">
//             <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
//               <ShoppingCart className="h-5 w-5 text-muted-foreground" />
//               {mounted && cartCount > 0 && (
//                 <Badge 
//                   variant="destructive" 
//                   className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full text-[10px] px-0 animate-in zoom-in"
//                 >
//                   {cartCount}
//                 </Badge>
//               )}
//             </Button>
//           </Link>

//           {/* Desktop Only: Theme Toggle */}
//           <div className="hidden md:flex">
//              <ModeToggle />
//           </div>

//           {/* Desktop Only: Auth Dropdown */}
//           <div className="hidden md:flex items-center ml-2">
//             {session ? (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="relative h-9 w-9 rounded-full">
//                     <Avatar className="h-9 w-9 border border-border">
//                       <AvatarImage src={session.user?.image} alt={session.user?.name} />
//                       <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
//                     </Avatar>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-56" align="end" forceMount>
//                   <DropdownMenuLabel className="font-normal">
//                     <div className="flex flex-col space-y-1">
//                       <p className="text-sm font-medium leading-none">{session.user?.name}</p>
//                       <p className="text-xs leading-none text-muted-foreground">
//                         {session.user?.email}
//                       </p>
//                     </div>
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <Link href={`/${session.user.role}/dashboard`}>
//                     <DropdownMenuItem className="cursor-pointer">
//                       <LayoutDashboard className="mr-2 h-4 w-4" />
//                       <span>Dashboard</span>
//                     </DropdownMenuItem>
//                   </Link>
//                   {session.user.role === 'vendor' && (
//                      <Link href="/vendor/products">
//                        <DropdownMenuItem className="cursor-pointer">
//                          <Store className="mr-2 h-4 w-4" />
//                          <span>My Products</span>
//                        </DropdownMenuItem>
//                      </Link>
//                   )}
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem 
//                     className="text-red-600 focus:text-red-600 cursor-pointer"
//                     onClick={() => signOut({ callbackUrl: "/" })}
//                   >
//                     <LogOut className="mr-2 h-4 w-4" />
//                     <span>Log out</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Link href="/login">
//                    <Button variant="ghost" size="sm">Login</Button>
//                 </Link>
//                 <Link href="/register">
//                    <Button size="sm" className="shadow-sm">Get Started</Button>
//                 </Link>
//               </div>
//             )}
//           </div>

//           {/* --- 4. MOBILE MENU TRIGGER --- */}
//           <div className="md:hidden flex items-center">
//              <Sheet open={open} onOpenChange={setOpen}>
//                <SheetTrigger asChild>
//                   <Button variant="ghost" size="icon" className="hover:bg-muted/50">
//                      <Menu className="h-5 w-5" />
//                   </Button>
//                </SheetTrigger>
//                <SheetContent side="right" className="flex flex-col h-full">
//                  <SheetHeader className="text-left">
//                    <SheetTitle className="flex items-center gap-2">
//                       <BadgePercent className="h-5 w-5 text-primary"/> ShopSync
//                    </SheetTitle>
//                  </SheetHeader>
                 
//                  {/* Mobile Nav Links */}
//                  <div className="flex-1 flex flex-col gap-4 mt-8">
//                     <Link 
//                       href="/" 
//                       onClick={() => setOpen(false)} 
//                       className="text-lg font-medium hover:text-primary transition-colors"
//                     >
//                       Home
//                     </Link>
//                     <Link 
//                       href="/shops" 
//                       onClick={() => setOpen(false)} 
//                       className="text-lg font-medium hover:text-primary transition-colors"
//                     >
//                       Browse Shops
//                     </Link>
//                     <Link 
//                       href="/vendor/register" 
//                       onClick={() => setOpen(false)} 
//                       className="text-lg font-medium hover:text-primary transition-colors"
//                     >
//                       Become a Seller
//                     </Link>
//                  </div>

//                  {/* Mobile Footer (Auth & Theme) */}
//                  <div className="border-t pt-6 pb-6 space-y-4">
//                     <div className="flex items-center justify-between">
//                        <span className="text-sm font-medium">Theme</span>
//                        <ModeToggle />
//                     </div>

//                     {session ? (
//                        <div className="space-y-3">
//                           <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
//                              <Avatar className="h-8 w-8">
//                                <AvatarImage src={session.user?.image} />
//                                <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
//                              </Avatar>
//                              <div className="text-sm">
//                                 <p className="font-medium">{session.user?.name}</p>
//                                 <p className="text-xs text-muted-foreground">{session.user?.email}</p>
//                              </div>
//                           </div>
//                           <Link href={`/${session.user.role}/dashboard`} onClick={() => setOpen(false)}>
//                              <Button className="w-full justify-start" variant="outline">
//                                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
//                              </Button>
//                           </Link>
//                           <Button 
//                             className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50" 
//                             variant="ghost" 
//                             onClick={() => signOut({ callbackUrl: "/" })}
//                           >
//                              <LogOut className="mr-2 h-4 w-4" /> Logout
//                           </Button>
//                        </div>
//                     ) : (
//                        <div className="grid grid-cols-2 gap-2">
//                           <Link href="/login" onClick={() => setOpen(false)}>
//                              <Button variant="outline" className="w-full">Login</Button>
//                           </Link>
//                           <Link href="/register" onClick={() => setOpen(false)}>
//                              <Button className="w-full">Sign Up</Button>
//                           </Link>
//                        </div>
//                     )}
//                  </div>
//                </SheetContent>
//              </Sheet>
//           </div>

//         </div>
//       </div>
//     </header>
//   );
// }