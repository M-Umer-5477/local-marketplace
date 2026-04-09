
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react"; 
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  Wallet, 
  LogOut, 
  Banknote,
  
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle"; // Import the Toggle
import MartLyIcon from "@/components/ui/MartlyIcon";

export default function AdminLayoutClient({ children, user }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Seller Verifications", href: "/admin/verifications", icon: FileCheck },
    { name: "Active Shops", href: "/admin/shops", icon: Users },
    { name: "Billing Verification", href: "/admin/billing", icon: Banknote },
    { name: "Financials & Debt", href: "/admin/finance", icon: Wallet },
    { name: "Pending Refunds", href: "/admin/refunds", icon: Banknote },
  ];

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-zinc-950/20 flex">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col fixed h-full z-10">
        
        {/* Brand */}
        <div className="p-6 border-b border-border flex items-center gap-2">
           <MartLyIcon className="w-8 h-8" />
           <div>
             <h1 className="font-bold text-lg tracking-tight text-foreground">MartLy</h1>
             <p className="text-xs text-muted-foreground">Admin Console</p>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  className={`w-full justify-start gap-3 mb-1 font-medium transition-all duration-200
                    ${isActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/15" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User / Logout Section */}
        <div className="p-4 border-t border-border bg-background">
          
          {/* User Card + Theme Toggle Row */}
          <div className="flex items-center gap-2 mb-3">
             {/* User Info (Expanded to fill space) */}
             <div className="flex-1 bg-muted/40 border border-border/50 rounded-xl p-2 flex items-center gap-2 overflow-hidden">
                 <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {user?.name?.charAt(0) || "A"}
                 </div>
                 <div className="overflow-hidden">
                     <p className="text-xs font-semibold truncate text-foreground">{user?.name || "Admin"}</p>
                 </div>
             </div>

             {/* Theme Toggle (Compact) */}
             <div className="shrink-0">
                <ModeToggle />
             </div>
          </div>

          {/* Logout Button */}
          <Button 
            variant="outline" 
            className="w-full gap-2 text-destructive border-destructive/20 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 md:ml-64 p-8">
         <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
         </div>
      </main>
    </div>
  );
}