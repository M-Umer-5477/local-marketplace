"use client";

import { useState, useEffect } from "react";

import { useSeller } from "@/app/(vendor)/SellerContext"; 
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import ProductForm from "@/components/seller/ProductForm";

export default function ManageProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormSaving, setIsFormSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);



 
  const { user } = useSeller(); 
  const userId = user.id; 

  const fetchProducts = async () => {
    if (!userId) return; // This check is still good practice
    setIsLoading(true);
    try {
      const response = await fetch(`/api/vendor/products?shopId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  //  Fetch once userId is available from our context
  useEffect(() => {
    // If component renders, we are "authenticated"
    // Just wait for userId to be available.
    if (userId) {
      fetchProducts();
    }
  }, [userId]); // 👈 CHANGED dependency

  //  Add Product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  //  Edit Product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  //  Delete Product
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || !userId) return;

    try {
      // 'userId' is now from useSeller()
      const response = await fetch(`/api/vendor/products/${productToDelete._id}?shopId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      toast.success(`Product "${productToDelete.name}" deleted successfully.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  //  Save Product (Create or Update)
  const handleSaveProduct = async (productData) => {
    if (!userId) return; // 'userId' is now from useSeller()
    setIsFormSaving(true);

    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct
      ? `/api/vendor/products/${editingProduct._id}`
      : "/api/vendor/products";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productData,
          shopId: userId, // 'userId' is now from useSeller()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      const savedProduct = await response.json();

      setProducts((prev) =>
        editingProduct
          ? prev.map((p) => (p._id === savedProduct._id ? savedProduct : p))
          : [savedProduct, ...prev]
      );

      toast.success(editingProduct ? "Product updated successfully." : "Product created successfully.");
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsFormSaving(false);
    }
  };

  //  Toggle Active
  const handleToggleActive = async (product, checked) => {
    // This function did not depend on userId, so it is unchanged.
    try {
      const response = await fetch(`/api/vendor/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isActive: checked,
          shopId: userId 
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: checked } : p))
      );
      toast.success(`"${product.name}" status updated.`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  //  Render (This entire section is unchanged)
  return (
    <div className="flex-1 space-y-4 p-4 bg-background md:">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Products</h2>
          <p className="text-muted-foreground">Here's a list of all products in your shop.</p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen} modal={false}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProduct}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Make changes to your product here. Click save when you're done."
                  : "Fill in the details for your new product."}
              </DialogDescription>
            </DialogHeader>

            <ProductForm
              product={editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isFormSaving}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <img
                      src={product.imageUrl || "https://placehold.co/40x40/e2e8f0/e2e8f0"}
                      alt={product.name}
                      width="40"
                      height="40"
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.isActive}
                      onCheckedChange={(checked) => handleToggleActive(product, checked)}
                    />
                  </TableCell>
                  <TableCell>Rs {product.price}</TableCell>
                  <TableCell>
                    {product.stock > 0 ? (
                      `${product.stock} ${product.unit}`
                    ) : (
                      <span className="text-red-500">Out of Stock</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found. Start by adding one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product{" "}
              <span className="font-bold">"{productToDelete?.name}"</span> from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
