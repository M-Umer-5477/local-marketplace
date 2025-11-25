// import SellerForm from "@/components/seller/SellerForm";

// export default function VendorRegisterPage() {
//   return (
//     <div className="min-h-screen flex justify-center items-center bg-muted/30 py-10">
//       <div className="w-full max-w-3xl bg-background p-6 rounded-xl shadow-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">
//           Seller Registration
//         </h1>
//         <SellerForm />
//       </div>
//     </div>
//   );
// }
// 'Main page.js' - UPDATED
import SellerForm from "@/components/seller/SellerForm";

export default function VendorRegisterPage() {
  return (
    // We remove flex/items-center and just use padding and mx-auto
    <div className="min-h-screen bg-muted/30 py-4 md:py-8">
      {/* ✅ WIDER CONTAINER: 
        Changed max-w-3xl to max-w-4xl (1152px)
        Added mx-auto to center it.
        Added responsive padding (p-6 sm:p-8)
      */}
      <div className="w-full max-w-4xl mx-auto bg-background p-2 sm:p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Seller Registration
        </h1>
        <SellerForm />
      </div>
    </div>
  );
}
