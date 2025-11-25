"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { Menu, BadgePercent } from "lucide-react";

// Import the reusable theme toggle component
import { ModeToggle } from "@/components/mode-toggle"; 

export default function MainNavbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/75 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        {/* Left: Logo */}
        <Link href="/" className="mr-4 flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition-opacity">
          <BadgePercent className="h-6 w-6 text-primary" />
          <span className="text-foreground hidden sm:inline-block">ShopSync</span>
          <span className="text-foreground sm:hidden">ShopSync</span>
        </Link>

        {/* Center: Desktop Links */}
        {/* CHANGED: text-muted-foreground -> text-foreground/80 for better visibility in dark mode */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
          {/* Seller CTA */}
          <Link
            href="/vendor/register"
            className="group flex items-center gap-2 transition-colors hover:text-foreground"
          >
             <span className="relative font-semibold text-primary">
                Become a Seller
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
             </span>
          </Link>

          {/* Regular links */}
          <Link href="/about" className="transition-colors hover:text-foreground hover:opacity-100">
            About Us
          </Link>
          <Link href="/help" className="transition-colors hover:text-foreground hover:opacity-100">
            Help
          </Link>
        </nav>

        {/* Right: Auth Buttons & Theme Toggle (Desktop View) */}
        <div className="hidden md:flex items-center gap-4">
          
          <ModeToggle />
          
          {session ? (
            <div className="flex items-center gap-2">
              <Link href={`/${session.user.role}/dashboard`}>
                <Button variant="ghost" className="text-foreground/80 hover:text-foreground">Dashboard</Button>
              </Link>
              <Button variant="default" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger & Theme Toggle (Mobile View) */}
        <div className="flex items-center gap-2 md:hidden">
             <ModeToggle /> 
             
             <Sheet open={open} onOpenChange={setOpen}>
               <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
               </SheetTrigger>

               <SheetContent side="right" className="pr-0 border-l border-border/40">
                 <SheetHeader className="px-7 text-left">
                   <SheetTitle className="font-bold text-xl flex items-center gap-2">
                      <BadgePercent className="h-5 w-5 text-primary" />
                      ShopSync
                   </SheetTitle>
                   <SheetDescription className="sr-only">
                     Mobile Navigation Menu
                   </SheetDescription>
                 </SheetHeader>

                 <nav className="mt-8 flex flex-col space-y-4 px-7 text-lg font-medium">
                    <Link
                      href="/"
                      onClick={() => setOpen(false)}
                      className="hover:text-primary transition-colors"
                    >
                      Home
                    </Link>
                    <Link
                      href="/vendor/register"
                      onClick={() => setOpen(false)}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Become a Seller
                    </Link>
                    <Link href="/about" onClick={() => setOpen(false)} className="hover:text-primary transition-colors">
                      About Us
                    </Link>
                    <Link href="/help" onClick={() => setOpen(false)} className="hover:text-primary transition-colors">
                      Help
                    </Link>

                    <div className="border-t border-border/40 pt-6 mt-6 flex flex-col gap-3">
                      {session ? (
                        <>
                          <Link
                            href={`/${session.user.role}/dashboard`}
                            onClick={() => setOpen(false)}
                          >
                            <Button variant="outline" className="w-full justify-start">
                              Dashboard
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            className="w-full justify-start"
                            onClick={() => {
                              setOpen(false);
                              signOut({ callbackUrl: "/" });
                            }}
                          >
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link href="/login" onClick={() => setOpen(false)}>
                            <Button variant="outline" className="w-full">
                              Login
                            </Button>
                          </Link>
                          <Link href="/register" onClick={() => setOpen(false)}>
                            <Button className="w-full">Register</Button>
                          </Link>
                        </>
                      )}
                    </div>
                 </nav>
               </SheetContent>
             </Sheet>
        </div>
      </div>
    </header>
  );
}
// "use client";

// import Link from "next/link";
// import { useSession, signOut } from "next-auth/react";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Menu, BadgePercent, Sun, Moon } from "lucide-react";

// // Import the reusable theme toggle component
// import { ModeToggle } from "@/components/mode-toggle"; 

// export default function MainNavbar() {
//   const { data: session } = useSession();
//   const [open, setOpen] = useState(false);

//   return (
//     <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
//       <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
//         {/* Left: Logo */}
//         <Link href="/" className="flex items-center gap-2 font-bold text-xl">
//           {/* Ensure badge icon changes color based on theme if primary is affected */}
//           <BadgePercent className="h-7 w-7 text-primary" />
//           <span className="text-foreground">ShopSync</span>
//         </Link>

//         {/* Center: Desktop Links */}
//         <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
//           {/* Seller CTA — styled prominently */}
//           <Link
//             href="/vendor/register"
//             className="relative group inline-flex items-center font-semibold text-primary"
//           >
//             <span className="transition-colors group-hover:text-primary/90">Become a Seller</span>
//             <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/70 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
//           </Link>

//           {/* Regular links */}
//           <Link href="/about" className="hover:text-primary transition-colors">
//             About Us
//           </Link>
//           <Link href="/help" className="hover:text-primary transition-colors">
//             Help
//           </Link>
//         </nav>

//         {/* Right: Auth Buttons & Theme Toggle (Desktop View) */}
//         <div className="hidden md:flex items-center gap-3">
          
//           {/* 1. Add ModeToggle here for Desktop */}
//           <ModeToggle />
          
//           {session ? (
//             <>
//               <Link href={`/${session.user.role}/dashboard`}>
//                 <Button variant="outline">Dashboard</Button>
//               </Link>
//               <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
//                 Logout
//               </Button>
//             </>
//           ) : (
//             <>
//               <Link href="/login">
//                 <Button variant="outline">Login</Button>
//               </Link>
//               <Link href="/register">
//                 <Button>Register</Button>
//               </Link>
//             </>
//           )}
//         </div>

//         {/* Mobile Menu Trigger & Theme Toggle (Mobile View) */}
//         <Sheet open={open} onOpenChange={setOpen}>
//           <div className="md:hidden flex items-center gap-2">
//              {/* Placing the toggle outside the sheet for easy access on mobile before opening menu */}
//              <ModeToggle /> 
             
//              <SheetTrigger asChild>
//                 <Button variant="ghost" size="icon">
//                   <Menu className="h-5 w-5" />
//                   <span className="sr-only">Toggle Menu</span>
//                 </Button>
//               </SheetTrigger>
//           </div>
          

//           <SheetContent side="right" className="sm:max-w-xs">
//             <nav className="mt-8 flex flex-col space-y-4 text-lg">
//               <Link
//                 href="/"
//                 onClick={() => setOpen(false)}
//                 className="font-semibold text-primary text-xl mb-2"
//               >
//                 ShopSync
//               </Link>

//               {/* Mobile Links... */}
//               <Link
//                 href="/vendor/register"
//                 onClick={() => setOpen(false)}
//                 className="text-primary font-semibold"
//               >
//                 Become a Seller
//               </Link>
//               <Link href="/about" onClick={() => setOpen(false)}>
//                 About Us
//               </Link>
//               <Link href="/help" onClick={() => setOpen(false)}>
//                 Help
//               </Link>

//               <div className="border-t pt-4 mt-4 flex flex-col gap-2">
//                 {/* 2. Add ModeToggle here for Mobile Menu (Optional, since it's already outside the SheetTrigger) */}
//                 {/* You can remove the one above and keep this one if you prefer it inside the menu: */}
//                 {/* <div className="mb-4">
//                   <ModeToggle /> 
//                 </div> */}
                
//                 {session ? (
//                   <>
//                     <Link
//                       href={`/${session.user.role}/dashboard`}
//                       onClick={() => setOpen(false)}
//                     >
//                       <Button variant="outline" className="w-full">
//                         Dashboard
//                       </Button>
//                     </Link>
//                     <Button
//                       variant="destructive"
//                       className="w-full"
//                       onClick={() => {
//                         setOpen(false);
//                         signOut({ callbackUrl: "/" });
//                       }}
//                     >
//                       Logout
//                     </Button>
//                   </>
//                 ) : (
//                   <>
//                     <Link href="/login" onClick={() => setOpen(false)}>
//                       <Button variant="outline" className="w-full">
//                         Login
//                       </Button>
//                     </Link>
//                     <Link href="/register" onClick={() => setOpen(false)}>
//                       <Button className="w-full">Register</Button>
//                     </Link>
//                   </>
//                 )}
//               </div>
//             </nav>
//           </SheetContent>
//         </Sheet>
//       </div>
//     </header>
//   );
// }
