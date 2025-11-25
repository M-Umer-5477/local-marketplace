// "use client";

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { 
//   Store,
//   BookText, 
//   ShoppingCart, 
//   Search, 
//   CreditCard, 
//   History,
//   Star,
//   ArrowRight,
// } from 'lucide-react'; // <-- Removed Menu and X
// import { Button } from '@/components/ui/button';

// // --- Main App Component ---
// export default function App() {
//   // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // No longer needed

//   return (
//     <div className="font-sans antialiased text-gray-900 bg-white">
//       {/* --- Header Removed --- */}
      
//       {/* --- Main Content --- */}
//       <main>
//         <HeroSection />
//         <FeaturesSection />
//         <ExploreStoresSection />
//         <TestimonialsSection />
//         <CallToActionSection />
//       </main>
      
//       {/* --- Footer Removed --- */}
//     </div>
//   );
// }

// // --- Header Component Removed ---

// // --- Hero Section ---
// function HeroSection() {
//   return (
//     <section className="py-20 md:py-32 bg-gray-50">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
//         <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
//           Your Digital Partner for Local Commerce.
//         </h1>
//         <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
//           Whether you're a local shop owner or a customer who loves their community,
//           we connect you in one simple, powerful platform.
//         </p>
//         <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
//           <Button asChild size="lg" className="w-full sm:w-auto" >
//             <Link href="/vendor/register">
//               Start Selling Today
//             </Link>
//           </Button>
//           <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white">
//             Explore Local Stores
//           </Button>
//         </div>
//       </div>
//     </section>
//   );
// }

// // --- Features (How It Works) Section ---
// function FeaturesSection() {
//   const [activeTab, setActiveTab] = useState('sellers'); // 'sellers' or 'customers'

//   const sellerFeatures = [
//     {
//       icon: <Store className="h-8 w-8 text-primary" />,
//       title: "Digital Storefront",
//       description: "Create a beautiful online store in minutes. No coding required."
//     },
//     {
//       icon: <BookText className="h-8 w-8 text-primary" />,
//       title: "Khata Management",
//       description: "Ditch the paper. Track all your customer credit (udhaar) digitally."
//     },
//     {
//       icon: <ShoppingCart className="h-8 w-8 text-primary" />,
//       title: "Offline POS & Inventory",
//       description: "Manage your in-store sales and inventory with our simple checkout system."
//     }
//   ];

//   const customerFeatures = [
//     {
//       icon: <Search className="h-8 w-8 text-primary" />,
//       title: "Discover Local",
//       description: "Find and shop from your favorite neighborhood stores online."
//     },
//     {
//       icon: <CreditCard className="h-8 w-8 text-primary" />,
//       title: "Easy Payments",
//       description: "Pay securely with cash, card, or browse products from home."
//     },
//     {
//       icon: <History className="h-8 w-8 text-primary" />,
//       title: "View Order History", // <-- MODIFIED FEATURE
//       description: "Keep track of all your purchases from local stores, all in one place." // <-- MODIFIED
//     }
//   ];

//   return (
//     <section className="py-20 md:py-24">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <h2 className="text-3xl md:text-4xl font-bold text-center">
//           One App. Two Ways to Grow.
//         </h2>
//         <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mt-4">
//           We provide dedicated tools to help you thrive, whether you're
//           selling or shopping.
//         </p>
        
//         {/* Tabbed Interface */}
//         <div className="mt-12 max-w-lg mx-auto flex p-1 bg-gray-100 rounded-lg">
//           <button
//             onClick={() => setActiveTab('sellers')}
//             className={`w-1/2 py-3 rounded-md font-medium transition-all ${
//               activeTab === 'sellers' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             For Sellers
//           </button>
//           <button
//             onClick={() => setActiveTab('customers')}
//             className={`w-1/2 py-3 rounded-md font-medium transition-all ${
//               activeTab === 'customers' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             For Customers
//           </button>
//         </div>

//         {/* Features Grid */}
//         <div className="mt-12">
//           {activeTab === 'sellers' && (
//             <div className="grid md:grid-cols-3 gap-8">
//               {sellerFeatures.map((feature, i) => (
//                 <FeatureCard key={i} {...feature} />
//               ))}
//             </div>
//           )}
//           {activeTab === 'customers' && (
//             <div className="grid md:grid-cols-3 gap-8">
//               {customerFeatures.map((feature, i) => (
//                 <FeatureCard key={i} {...feature} />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

// // --- Feature Card Sub-component ---
// function FeatureCard({ icon, title, description }) {
//   return (
//     <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
//       <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
//         {icon}
//       </div>
//       <h3 className="mt-5 text-xl font-semibold">{title}</h3>
//       <p className="mt-2 text-gray-600">{description}</p>
//     </div>
//   );
// }

// // --- Explore Stores Section ---
// function ExploreStoresSection() {
//   const stores = [
//     { name: "City Electronics", category: "Electronics", img: "https://placehold.co/400x300/e2e8f0/334155?text=City+Electronics" },
//     { name: "Fresh Grocers", category: "Grocery", img: "https://placehold.co/400x300/dbeafe/1e3a8a?text=Fresh+Grocers" },
//     { name: "Modern Fashions", category: "Apparel", img: "https://placehold.co/400x300/fce7f3/831843?text=Modern+Fashions" },
//     { name: "Punjab Pharmacy", category: "Health", img: "https://placehold.co/400x300/dcfce7/15803d?text=Punjab+Pharmacy" }
//   ];

//   return (
//     <section className="py-20 md:py-24 bg-gray-50">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <h2 className="text-3xl md:text-4xl font-bold text-center">
//           Explore Featured Stores
//         </h2>
//         <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mt-4">
//           Discover the best local businesses already on our platform.
//         </p>
        
//         <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {stores.map((store, i) => (
//             <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden group transition-all hover:shadow-xl">
//               <img src={store.img} alt={store.name} className="w-full h-48 object-cover" />
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold">{store.name}</h3>
//                 <p className="text-sm text-gray-500">{store.category}</p>
//                 <a href="#" className="inline-flex items-center text-sm font-medium text-primary mt-3 group-hover:underline">
//                   Visit Store <ArrowRight className="h-4 w-4 ml-1" />
//                 </a>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// // --- Testimonials Section ---
// function TestimonialsSection() {
//   const testimonials = [
//     {
//       quote: "Managing my khata book online has saved me hours every week. My customers love the transparency!",
//       name: "Ali Ahmed",
//       role: "Owner, Fresh Grocers"
//     },
//     {
//       quote: "As a customer, I love that I can check my balance with my local shop anytime. It's so convenient.",
//       name: "Fatima Khan",
//       role: "Local Shopper"
//     },
//     {
//       quote: "The offline checkout is fast and my inventory is always up to date. This app is a game-changer for my store.",
//       name: "Usman Butt",
//       role: "Owner, City Electronics"
//     }
//   ];

//   return (
//     <section className="py-20 md:py-24">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <h2 className="text-3xl md:text-4xl font-bold text-center">
//           Trusted by Businesses and Shoppers
//         </h2>
        
//         <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
//           {testimonials.map((item, i) => (
//             <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
//               <div className="flex text-yellow-400">
//                 <Star className="h-5 w-5 fill-current" />
//                 <Star className="h-5 w-5 fill-current" />
//                 <Star className="h-5 w-5 fill-current" />
//                 <Star className="h-5 w-5 fill-current" />
//                 <Star className="h-5 w-5 fill-current" />
//               </div>
//               <p className="mt-4 text-gray-700 italic text-lg grow">"{item.quote}"</p>
//               <div className="mt-4">
//                 <p className="font-semibold">{item.name}</p>
//                 <p className="text-sm text-gray-500">{item.role}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// // --- Final Call to Action Section ---
// function CallToActionSection() {
//   return (
//     <section className="py-20 md:py-24 bg-primary text-white">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
//         <h2 className="text-3xl md:text-4xl font-bold">
//           Ready to Get Started?
//         </h2>
//         <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
//           Join thousands of local businesses and customers building a
//           stronger community.
//         </p>
//         <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
//           <Button size="lg" variant="secondary">
//             I'm a Seller
//           </Button>
//           <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary">
//             I'm a Customer
//           </Button>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Store,
  BookText, 
  ShoppingCart, 
  Search, 
  CreditCard, 
  History,
  Star,
  ArrowRight,
} from 'lucide-react'; 
import { Button } from '@/components/ui/button';

// --- Main App Component ---
export default function App() {
  return (
    // Replace bg-white with bg-background, text-gray-900 with text-foreground
    <div className="font-sans antialiased text-foreground bg-background flex flex-col min-h-screen">
      
      {/* --- Main Content --- */}
      <main className="grow">
        <HeroSection />
        <FeaturesSection />
        <ExploreStoresSection />
        <TestimonialsSection />
        <CallToActionSection />
      </main>
      
    </div>
  );
}

// --- Hero Section ---
function HeroSection() {
  return (
    // bg-gray-50 -> bg-muted/40: A subtle difference from the main white background
    <section className="py-20 md:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* text-gray-900 -> text-foreground */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
          Your Digital Partner for <br className="hidden md:inline" /> 
          <span className="text-primary">Local Commerce.</span>
        </h1>
        {/* text-gray-600 -> text-muted-foreground */}
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Whether you're a local shop owner or a customer who loves their community,
          we connect you in one simple, powerful platform.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20" >
            <Link href="/vendor/register">
              Start Selling Today
            </Link>
          </Button>
          {/* bg-white -> bg-background */}
          <Button size="lg" variant="outline" className="w-full sm:w-auto bg-background">
            Explore Local Stores
          </Button>
        </div>
      </div>
    </section>
  );
}

// --- Features (How It Works) Section ---
function FeaturesSection() {
  const [activeTab, setActiveTab] = useState('sellers');

  const sellerFeatures = [
    {
      icon: <Store className="h-8 w-8 text-primary" />,
      title: "Digital Storefront",
      description: "Create a beautiful online store in minutes. No coding required."
    },
    {
      icon: <BookText className="h-8 w-8 text-primary" />,
      title: "Khata Management",
      description: "Ditch the paper. Track all your customer credit (udhaar) digitally."
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-primary" />,
      title: "Offline POS & Inventory",
      description: "Manage your in-store sales and inventory with our simple checkout system."
    }
  ];

  const customerFeatures = [
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Discover Local",
      description: "Find and shop from your favorite neighborhood stores online."
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: "Easy Payments",
      description: "Pay securely with cash, card, or browse products from home."
    },
    {
      icon: <History className="h-8 w-8 text-primary" />,
      title: "View Order History", 
      description: "Keep track of all your purchases from local stores, all in one place." 
    }
  ];

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground">
          One App. Two Ways to Grow.
        </h2>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mt-4">
          We provide dedicated tools to help you thrive, whether you're
          selling or shopping.
        </p>
        
        {/* Tabbed Interface */}
        {/* bg-gray-100 -> bg-muted */}
        <div className="mt-12 max-w-lg mx-auto flex p-1 bg-muted rounded-lg">
          <button
            onClick={() => setActiveTab('sellers')}
            // Conditional classes updated for semantic colors
            className={`w-1/2 py-3 rounded-md font-medium transition-all ${
              activeTab === 'sellers' 
                ? 'bg-background text-foreground shadow-sm' // Active: Card-like
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50' // Inactive
            }`}
          >
            For Sellers
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`w-1/2 py-3 rounded-md font-medium transition-all ${
              activeTab === 'customers' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            For Customers
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-12">
          <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {(activeTab === 'sellers' ? sellerFeatures : customerFeatures).map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Feature Card Sub-component ---
function FeatureCard({ icon, title, description }) {
  return (
    // bg-white -> bg-card, text-gray-900 -> text-card-foreground, border-gray-200 -> border-border
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

// --- Explore Stores Section ---
function ExploreStoresSection() {
  const stores = [
    { name: "City Electronics", category: "Electronics", img: "https://placehold.co/400x300/e2e8f0/334155?text=City+Electronics" },
    { name: "Fresh Grocers", category: "Grocery", img: "https://placehold.co/400x300/dbeafe/1e3a8a?text=Fresh+Grocers" },
    { name: "Modern Fashions", category: "Apparel", img: "https://placehold.co/400x300/fce7f3/831843?text=Modern+Fashions" },
    { name: "Punjab Pharmacy", category: "Health", img: "https://placehold.co/400x300/dcfce7/15803d?text=Punjab+Pharmacy" }
  ];

  return (
    // bg-gray-50 -> bg-muted/40
    <section className="py-20 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground">
          Explore Featured Stores
        </h2>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mt-4">
          Discover the best local businesses already on our platform.
        </p>
        
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stores.map((store, i) => (
            <div key={i} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden group transition-all hover:shadow-lg">
              {/* Added darker brightness filter for dark mode images if desired, usually not needed for placeholders */}
              <div className="relative overflow-hidden">
                 <img src={store.img} alt={store.name} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-card-foreground">{store.name}</h3>
                <p className="text-sm text-muted-foreground">{store.category}</p>
                <a href="#" className="inline-flex items-center text-sm font-medium text-primary mt-3 group-hover:underline">
                  Visit Store <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Testimonials Section ---
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Managing my khata book online has saved me hours every week. My customers love the transparency!",
      name: "Ali Ahmed",
      role: "Owner, Fresh Grocers"
    },
    {
      quote: "As a customer, I love that I can check my balance with my local shop anytime. It's so convenient.",
      name: "Fatima Khan",
      role: "Local Shopper"
    },
    {
      quote: "The offline checkout is fast and my inventory is always up to date. This app is a game-changer for my store.",
      name: "Usman Butt",
      role: "Owner, City Electronics"
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground">
          Trusted by Businesses and Shoppers
        </h2>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div key={i} className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm flex flex-col">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                   <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              {/* text-gray-700 -> text-muted-foreground or card-foreground */}
              <p className="mt-4 text-card-foreground/80 italic text-lg grow">"{item.quote}"</p>
              <div className="mt-4">
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Final Call to Action Section ---
function CallToActionSection() {
  return (
    // bg-primary -> bg-primary, text-white -> text-primary-foreground
    <section className="py-20 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Get Started?
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          Join thousands of local businesses and customers building a
          stronger community.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" variant="secondary">
            I'm a Seller
          </Button>
          {/* Custom outline styling for contrast against primary background */}
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            I'm a Customer
          </Button>
        </div>
      </div>
    </section>
  );
}