"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DialogFooter, 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ✅ IMPORT NEW UPLOADER
import ImageUpload from "@/components/seller/image-upload"; 

export default function ProductForm ({ product, onSave, onCancel, isLoading }) {
  const initialState = { 
    name: '', 
    description: '', 
    category: '', 
    price: 0, 
    stock: 0, 
    unit: 'pcs', 
    barcode:'', 
    isActive: true, 
    imageUrl: '' 
  };
  
  const [formData, setFormData] = useState(product || initialState);

  useEffect(() => {
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
      
      {/* 1. NAME */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" placeholder="e.g., Shan Chana Masala 50g" required />
      </div>

      {/* 2. DESCRIPTION */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">Description</Label>
        <Textarea id="description" value={formData.description} onChange={handleChange} className="col-span-3" placeholder="Provide a brief product description" required />
      </div>

      {/* 3. CATEGORY */}
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
            {/* Fresh & Perishables */}
            <SelectItem value="fruits-vegetables">Fruits & Vegetables</SelectItem>
            <SelectItem value="dairy-bakery">Dairy, Bread & Eggs</SelectItem>
            <SelectItem value="meat-seafood">Meat & Seafood</SelectItem>
            <SelectItem value="frozen-food">Frozen Food</SelectItem>

            {/* Pantry & Cooking */}
            <SelectItem value="staples">Atta, Rice, Oil & Dals</SelectItem>
            <SelectItem value="spices-masalas">Spices, Salt & Sugar</SelectItem>
            <SelectItem value="sauces-spreads">Sauces & Spreads</SelectItem>

            {/* Snacks & Drinks */}
            <SelectItem value="snacks-biscuits">Biscuits & Snacks</SelectItem>
            <SelectItem value="beverages">Cold Drinks & Juices</SelectItem>
            <SelectItem value="tea-coffee">Tea & Coffee</SelectItem>
            <SelectItem value="chocolates-desserts">Chocolates & Sweets</SelectItem>

            {/* Personal & Home */}
            <SelectItem value="personal-care">Personal Care & Beauty</SelectItem>
            <SelectItem value="household-cleaning">Household & Cleaning</SelectItem>
            <SelectItem value="health-wellness">Pharma & Wellness</SelectItem>
            <SelectItem value="baby-care">Baby Care</SelectItem>
            <SelectItem value="pet-care">Pet Care</SelectItem>

            {/* General Merchandise */}
            <SelectItem value="electronics">Electronics & Accessories</SelectItem>
            <SelectItem value="stationery">Stationery & Office</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 4. PRICE */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">Price (Rs)</Label>
        <Input id="price" type="number" value={formData.price} onChange={handleChange} className="col-span-3" placeholder="e.g., 120" required />
      </div>

      {/* 5. STOCK & UNIT */}
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

      {/* 6. BARCODE */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="barcode" className="text-right">Barcode</Label>
        <Input id="barcode" type="number" value={formData.barcode} onChange={handleChange} className="col-span-3" placeholder="e.g., 120" required />
      </div>

      {/* 7. IMAGE UPLOADER (Updated) */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right mt-2">Image</Label>
        <div className="col-span-3">
          <ImageUpload 
            label="Product Image" 
            onUpload={handleImageUpload} 
            value={formData.imageUrl} 
            // Note: We don't force 'capture' here so user can choose gallery OR camera
          />
        </div>
      </div>

      {/* 8. ACTIVE SWITCH */}
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


