
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter, // <-- Add this back
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import ImageUploader from "@/components/seller/ImageUploader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function ProductForm ({ product, onSave, onCancel, isLoading }) {
  const initialState = { name: '', description: '', category: '', price: 0, stock: 0, unit: 'pcs',barcode:'', isActive: true, imageUrl: '' };
  const [formData, setFormData] = useState(product || initialState);

  useEffect(() => {
    // When the product prop changes, update the form data
    setFormData(product || initialState);
  }, [product]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const handleCheckedChange = (checked) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  }
  const handleImageUpload = (url) => {
  setFormData(prev => ({ ...prev, imageUrl: url }));
};
  const handleUnitChange = (value) => {
      setFormData(prev => ({...prev, unit: value}));
  }
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {/* Form fields now match the schema */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" placeholder="e.g., Shan Chana Masala 50g" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">Description</Label>
        <Textarea id="description" value={formData.description} onChange={handleChange} className="col-span-3" placeholder="Provide a brief product description" required />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
  <Label htmlFor="category" className="text-right">Category</Label>
  <Select
    value={formData.category}
    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
  >
    <SelectTrigger className="col-span-3">
      <SelectValue placeholder="Select a category" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="spices">Spices</SelectItem>
      <SelectItem value="dairy">Dairy</SelectItem>
      <SelectItem value="snacks">Snacks</SelectItem>
      <SelectItem value="beverages">Beverages</SelectItem>
      <SelectItem value="grains">Grains</SelectItem>
      <SelectItem value="household">Household</SelectItem>
    </SelectContent>
  </Select>
</div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">Price (Rs)</Label>
        <Input id="price" type="number" value={formData.price} onChange={handleChange} className="col-span-3" placeholder="e.g., 120" required />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="stock" className="text-right">Stock</Label>
        <Input id="stock" type="number" value={formData.stock} onChange={handleChange} className="col-span-2" placeholder="e.g., 50" required />
        <Select value={formData.unit} onValueChange={handleUnitChange}>
            <SelectTrigger className="col-span-1">
                <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="pcs">pcs</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="litre">litre</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="barcode" className="text-right">Barcode</Label>
        <Input id="barcode" type="number" value={formData.barcode} onChange={handleChange} className="col-span-3" placeholder="e.g., 120" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="imageUrl" className="text-right">Image</Label>
       <ImageUploader label="Product Image" onUpload={handleImageUpload} value={formData.imageUrl} disableScrollbarFix={false} className="col-span-3"/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="isActive" className="text-right">Active</Label>
        <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleCheckedChange} />
      </div>
<DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Product
        </Button>
      </DialogFooter>
    </form>
  );
};



