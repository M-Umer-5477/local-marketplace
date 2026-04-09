
import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";
import MartLyIcon from "@/components/ui/MartlyIcon";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
     
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
         
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MartLyIcon className="w-8 h-8" />
              <span className="font-bold text-lg tracking-tight">MartLy</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Hyper-local commerce for Pakistan. Connecting you to neighborhood stores instantly.
            </p>
          </div>

      
          <div>
            <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
            <ul className="space-y-1 text-xs text-muted-foreground"> {/* Tighter list */}
              <li><Link href="/shops" className="hover:text-primary">Browse Shops</Link></li>
              <li><Link href="/vendor/register" className="hover:text-primary">Become a Seller</Link></li>
              <li><Link href="/orders" className="hover:text-primary">Track Order</Link></li>
            </ul>
          </div>

         
          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><span className="cursor-pointer hover:text-primary">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-primary">Terms of Service</span></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Contact</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-3 w-3" /> support@martly.me
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3 w-3" /> +92 300 1234567
              </li>
            </ul>
            <div className="flex gap-3 pt-3">
               <Facebook className="h-4 w-4 hover:text-primary cursor-pointer transition-colors" />
               <Twitter className="h-4 w-4 hover:text-sky-500 cursor-pointer" />
               <Instagram className="h-4 w-4 hover:text-pink-600 cursor-pointer" />
            </div>
          </div>
        </div>
        
       
        <div className="border-t mt-8 pt-4 text-center text-xs text-muted-foreground">
          <p>© 2026 MartLy. Final Year Project.</p>
        </div>
      </div>
    </footer>
  );
}