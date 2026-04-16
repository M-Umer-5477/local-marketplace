"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowDownLeft, Loader2 } from "lucide-react";

export default function WithdrawModal({ balance, savedPayoutDetails, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(savedPayoutDetails?.method || "EasyPaisa");
  const [bankName, setBankName] = useState(savedPayoutDetails?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(savedPayoutDetails?.accountNumber || "");
  const [accountTitle, setAccountTitle] = useState(savedPayoutDetails?.accountTitle || "");

  // ✅ Auto-Fill from previous session
  useEffect(() => {
    if (savedPayoutDetails) {
      if (savedPayoutDetails.method) setMethod(savedPayoutDetails.method);
      if (savedPayoutDetails.bankName) setBankName(savedPayoutDetails.bankName);
      if (savedPayoutDetails.accountNumber) setAccountNumber(savedPayoutDetails.accountNumber);
      if (savedPayoutDetails.accountTitle) setAccountTitle(savedPayoutDetails.accountTitle);
    }
  }, [savedPayoutDetails]);
  
  const handleSubmit = async () => {
    if (!amount || !accountNumber || !accountTitle) {
      return toast.error("Please fill all fields");
    }
    if (method === "Bank Transfer" && !bankName) {
      return toast.error("Please enter a Bank Name");
    }
    if (Number(amount) < 500) {
        return toast.error("Minimum withdrawal is Rs. 500");
    }
    if (Number(amount) > balance) {
        return toast.error("Insufficient balance");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vendor/wallet/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "Withdrawal", // Triggers the Debit logic
          amount: Number(amount),
          method,
          bankDetails: {
              bankName: method === "Bank Transfer" ? bankName : method, // e.g. "EasyPaisa"
              accountNumber,
              accountTitle
          }
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Withdrawal Requested!");
        setOpen(false);
        onSuccess(); // Refresh parent page
      } else {
        toast.error(data.error || "Failed");
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2 text-green-700 bg-white hover:bg-gray-100 shadow-sm">
           <ArrowDownLeft className="h-4 w-4" /> Withdraw Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          
          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount to Withdraw</Label>
            <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-bold">Rs.</span>
                <Input 
                    type="number" 
                    className="pl-10"
                    placeholder="Min 500" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <p className="text-xs text-muted-foreground text-right">Available: Rs. {balance.toLocaleString()}</p>
          </div>

          {/* Method */}
          <div className="space-y-2">
             <Label>Payment Method</Label>
             <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
             >
                 <option value="EasyPaisa">EasyPaisa</option>
                 <option value="JazzCash">JazzCash</option>
                 <option value="Bank Transfer">Bank Transfer</option>
             </select>
          </div>

          {/* Conditional Bank Name */}
          {method === "Bank Transfer" && (
            <div className="space-y-2">
               <Label>Bank Name</Label>
               <Input 
                  placeholder="e.g. Meezan Bank, HBL" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
               />
            </div>
          )}

          {/* Account Details */}
          <div className="space-y-2">
             <Label>Account Number / IBAN</Label>
             <Input 
                placeholder="0300-1234567" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
             />
          </div>
          <div className="space-y-2">
             <Label>Account Title</Label>
             <Input 
                placeholder="e.g. Ali Khan" 
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
             />
          </div>

        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Submit Request"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}