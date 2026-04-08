"use client";
import { useEffect, useState } from "react";
import { 
  Loader2, 
  Check, 
  X, 
  FileText, 
  Eye, 
  Search,
  MapPin,
  Calendar,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VerificationsPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null); 

  // 1. Fetch Pending Sellers
  const fetchPending = async () => {
    try {
      const res = await fetch("/api/admin/pending-sellers");
      const data = await res.json();
      if (data.success) {
        setSellers(data.sellers);
      }
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // 2. Handle Decision
  const handleAction = async (sellerId, action) => {
    toast.loading(`Processing ${action}...`);
    try {
      const res = await fetch("/api/admin/verify-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, action }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(`Seller ${action} Successfully`);
        setSellers((prev) => prev.filter((s) => s._id !== sellerId));
      } else {
        toast.dismiss();
        toast.error(data.error || "Operation failed");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Network Error");
    }
  };

  const filteredSellers = sellers.filter(s => 
    s.shopName.toLowerCase().includes(filter.toLowerCase()) || 
    s.cnic.includes(filter)
  );

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Seller Applications</h2>
          <p className="text-muted-foreground">Review documents and approve new shops.</p>
        </div>
        <div className="relative w-full md:w-72">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
           <Input 
             placeholder="Search by Shop Name or CNIC..." 
             className="pl-9 bg-background" 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           />
        </div>
      </div>

      {/* List */}
      {filteredSellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 dark:bg-muted/10 rounded-xl border border-dashed border-border">
           <div className="bg-background p-4 rounded-full shadow-sm mb-4">
             <Check className="h-8 w-8 text-green-500 dark:text-green-400" />
           </div>
           <h3 className="font-bold text-lg text-foreground">All Caught Up!</h3>
           <p className="text-muted-foreground">There are no pending applications right now.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredSellers.map((seller) => (
            <Card key={seller._id} className="overflow-hidden border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col xl:flex-row gap-6">
                  
                  {/* Left: Shop Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                       <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                            <AvatarImage src={seller.shopLogo} />
                            <AvatarFallback className="font-bold text-lg bg-muted text-foreground">{seller.shopName.substring(0,2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                {seller.shopName}
                                <Badge variant="secondary" className="text-xs font-normal">{seller.shopType}</Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" /> {seller.shopAddress}
                            </p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 dark:bg-muted/20 p-4 rounded-lg text-sm">
                        <div>
                            <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Owner Name</span>
                            <span className="font-medium text-foreground">{seller.fullName}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">CNIC Number</span>
                            <span className="font-medium font-mono tracking-wide text-foreground">{seller.cnic}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Phone</span>
                            <span className="font-medium text-foreground">{seller.phone}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Applied On</span>
                            <span className="font-medium flex items-center gap-1 text-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(seller.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                  </div>

                  {/* Middle: Documents */}
                  <div className="flex-1 border rounded-lg p-4 bg-background dark:bg-zinc-900/50">
                    <h4 className="font-semibold text-sm mb-4 flex items-center gap-2 border-b border-border pb-2 text-foreground">
                      <FileText className="h-4 w-4 text-primary" /> Verification Documents
                    </h4>
                    <div className="space-y-3">
                      {seller.verificationDocs?.length > 0 ? (
                        seller.verificationDocs.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-muted/40 hover:bg-muted transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium text-sm text-foreground">{doc.docType}</span>
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-2"
                                onClick={() => setSelectedDoc(doc)}
                            >
                                View <Eye className="h-3 w-3" />
                            </Button>

                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm italic">
                            No documents uploaded.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col justify-center gap-3 min-w-40 border-t xl:border-t-0 xl:border-l border-border pt-4 xl:pt-0 xl:pl-6">
                    <p className="text-xs text-muted-foreground text-center mb-2">Make a decision</p>
                    <Button 
                      onClick={() => handleAction(seller._id, "Approved")} 
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white shadow-sm w-full h-11"
                    >
                      <Check className="mr-2 h-4 w-4" /> Approve Shop
                    </Button>
                    <Button 
                      onClick={() => handleAction(seller._id, "Rejected")} 
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 w-full h-11"
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- DOCUMENT VIEWER DIALOG --- */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
            <DialogHeader className="p-4 border-b border-border">
                <DialogTitle className="flex items-center justify-between text-foreground">
                    <span>Viewing: {selectedDoc?.docType}</span>
                    <Button variant="outline" size="sm" asChild>
                        <a href={selectedDoc?.docURL} target="_blank" rel="noopener noreferrer" className="gap-2">
                            <Download className="h-4 w-4" /> Open Original
                        </a>
                    </Button>
                </DialogTitle>
            </DialogHeader>
            <div className="flex-1 bg-muted/20 dark:bg-zinc-950 p-4 flex items-center justify-center overflow-auto">
                {selectedDoc && (
                    <img 
                        src={selectedDoc.docURL} 
                        alt={selectedDoc.docType} 
                        className="max-w-full max-h-full object-contain rounded-md shadow-lg border border-border"
                    />
                )}
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}