
import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, Heart } from "lucide-react";
import MartLyIcon from "@/components/ui/MartlyIcon";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MartLyIcon className="w-8 h-8" />
              <span className="font-bold text-lg tracking-tight">MartLy</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Hyper-local commerce for Pakistan. Connecting you to neighborhood stores instantly.
            </p>
            <div className="flex gap-3 pt-1">
              <Facebook className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-4 w-4 text-muted-foreground hover:text-sky-500 cursor-pointer transition-colors" />
              <Instagram className="h-4 w-4 text-muted-foreground hover:text-pink-600 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><Link href="/shops" className="hover:text-primary transition-colors">Browse Shops</Link></li>
              <li><Link href="/vendor/register" className="hover:text-primary transition-colors">Become a Seller</Link></li>
              <li><Link href="/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><span className="cursor-pointer hover:text-primary transition-colors">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-primary transition-colors">Terms of Service</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Contact</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-3 w-3 shrink-0" />
                <a href="mailto:admin.martly@gmail.com" className="hover:text-primary transition-colors">admin.martly@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3 w-3 shrink-0" />
                <a href="tel:+923001234567" className="hover:text-primary transition-colors">+92 300 1234567</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} MartLy. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}