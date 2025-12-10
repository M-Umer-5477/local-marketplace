// import Link from "next/link";
// import { Store, Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

// export default function Footer() {
//   return (
//     <footer className="bg-muted/50 border-t mt-auto">
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
//           {/* Column 1: Brand */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-2">
//               <div className="bg-primary p-1.5 rounded-lg">
//                 <Store className="h-6 w-6 text-primary-foreground" />
//               </div>
//               <span className="font-bold text-xl tracking-tight">ShopSync</span>
//             </div>
//             <p className="text-sm text-muted-foreground leading-relaxed">
//               Empowering local businesses with hyper-local digital commerce. Shop smart, shop local.
//             </p>
//           </div>

//           {/* Column 2: Quick Links */}
//           <div>
//             <h3 className="font-semibold mb-4">Quick Links</h3>
//             <ul className="space-y-2 text-sm text-muted-foreground">
//               <li><Link href="/shops" className="hover:text-primary transition-colors">Browse Shops</Link></li>
//               <li><Link href="/vendor/register" className="hover:text-primary transition-colors">Become a Seller</Link></li>
//               <li><Link href="/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
//             </ul>
//           </div>

//           {/* Column 3: Legal (Filler for Defense) */}
//           <div>
//             <h3 className="font-semibold mb-4">Legal</h3>
//             <ul className="space-y-2 text-sm text-muted-foreground">
//               <li><span className="cursor-pointer hover:text-primary">Privacy Policy</span></li>
//               <li><span className="cursor-pointer hover:text-primary">Terms of Service</span></li>
//               <li><span className="cursor-pointer hover:text-primary">Refund Policy</span></li>
//             </ul>
//           </div>

//           {/* Column 4: Contact */}
//           <div>
//             <h3 className="font-semibold mb-4">Contact Us</h3>
//             <ul className="space-y-3 text-sm text-muted-foreground">
//               <li className="flex items-center gap-2">
//                 <Mail className="h-4 w-4" /> support@shopsync.pk
//               </li>
//               <li className="flex items-center gap-2">
//                 <Phone className="h-4 w-4" /> +92 300 1234567
//               </li>
//               <div className="flex gap-4 pt-2">
//                 <Facebook className="h-5 w-5 hover:text-blue-600 cursor-pointer" />
//                 <Twitter className="h-5 w-5 hover:text-sky-500 cursor-pointer" />
//                 <Instagram className="h-5 w-5 hover:text-pink-600 cursor-pointer" />
//               </div>
//             </ul>
//           </div>
//         </div>
        
//         <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
//           <p>© 2025 ShopSync. All rights reserved. Final Year Project.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }
import Link from "next/link";
import { Store, Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
     
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
         
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1 rounded-md">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">ShopSync</span>
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
                <Mail className="h-3 w-3" /> support@shopsync.pk
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3 w-3" /> +92 300 1234567
              </li>
            </ul>
            <div className="flex gap-3 pt-3">
               <Facebook className="h-4 w-4 hover:text-blue-600 cursor-pointer" />
               <Twitter className="h-4 w-4 hover:text-sky-500 cursor-pointer" />
               <Instagram className="h-4 w-4 hover:text-pink-600 cursor-pointer" />
            </div>
          </div>
        </div>
        
       
        <div className="border-t mt-8 pt-4 text-center text-xs text-muted-foreground">
          <p>© 2025 ShopSync. Final Year Project.</p>
        </div>
      </div>
    </footer>
  );
}