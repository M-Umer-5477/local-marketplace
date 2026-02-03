"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// ✅ IMPORT THE NEW STANDARD UPLOADER
import ImageUpload from "@/components/seller/image-upload";

export default function PayDuesModal({ balance, onPaymentSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState("");
  
  const amountDue = Math.abs(balance);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (!proof) return toast.error("Please upload the payment screenshot");

    setLoading(true);
    try {
      const res = await fetch("/api/vendor/wallet/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountDue, 
          type: "Deposit",   
          method: formData.get("method"),
          transactionId: formData.get("trxId"),
          proofImage: proof
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Payment submitted for approval!");
        setOpen(false);
        setProof(""); 
        if (onPaymentSuccess) onPaymentSuccess(); 
      } else {
        toast.error(json.error || "Submission failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
           Pay Dues (Rs. {amountDue})
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear Your Dues</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
             Please send <b>Rs. {amountDue}</b> to <b>0300-1234567 (EasyPaisa)</b> and upload the proof below.
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select name="method" defaultValue="EasyPaisa" required>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EasyPaisa">EasyPaisa</SelectItem>
                <SelectItem value="JazzCash">JazzCash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transaction ID (Trx ID)</Label>
            <Input name="trxId" placeholder="e.g. 8452XXXXXX" required />
          </div>

          <div className="space-y-2">
            <Label>Screenshot Proof</Label>
            {/* ✅ UPDATED COMPONENT */}
            <ImageUpload 
                label="Upload Screenshot" 
                onUpload={setProof} 
                value={proof} 
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Submit Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}