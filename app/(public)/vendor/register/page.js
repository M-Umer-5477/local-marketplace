
import SellerForm from "@/components/seller/SellerForm";

export default function VendorRegisterPage() {
  return (
  
    <div className="min-h-screen bg-muted/30 py-4 md:py-4">
      
      <div className="w-full max-w-4xl mx-auto bg-background p-2 sm:p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Seller Registration
        </h1>
        <SellerForm />
      </div>
    </div>
  );
}
