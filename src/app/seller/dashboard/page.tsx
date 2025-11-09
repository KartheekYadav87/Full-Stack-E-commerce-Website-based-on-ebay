"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit, Trash2, Star, DollarSign, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  sellerId: number;
}

const CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books"];

export default function SellerDashboardPage() {
  const currentUser = 1;
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    initializeSeller();
  }, []);

  const initializeSeller = async () => {
    try {
      const sellersRes = await fetch("/api/sellers");
      if (sellersRes.ok) {
        const sellers = await sellersRes.json();
        const userSeller = sellers.find((s: any) => s.userId === currentUser);
        
        if (userSeller) {
          setSellerId(userSeller.id);
          fetchProducts(userSeller.id);
        } else {
          const createRes = await fetch("/api/sellers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser }),
          });
          
          if (createRes.ok) {
            const newSeller = await createRes.json();
            setSellerId(newSeller.id);
            setLoading(false);
          }
        }
      }
    } catch (error) {
      console.error("Failed to initialize seller:", error);
      setLoading(false);
    }
  };

  const fetchProducts = async (sellerIdToFetch: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?limit=100");
      if (res.ok) {
        const allProducts = await res.json();
        const sellerProducts = allProducts.filter(
          (p: Product) => p.sellerId === sellerIdToFetch
        );
        setProducts(sellerProducts);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sellerId) {
      toast.error("Seller account not initialized");
      return;
    }

    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price),
          }),
        });

        if (res.ok) {
          toast.success("Product updated successfully!");
          setIsDialogOpen(false);
          resetForm();
          fetchProducts(sellerId);
        } else {
          toast.error("Failed to update product");
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price),
            sellerId,
            rating: 0,
          }),
        });

        if (res.ok) {
          toast.success("Product listed successfully!");
          setIsDialogOpen(false);
          resetForm();
          fetchProducts(sellerId);
        } else {
          toast.error("Failed to create product");
        }
      }
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Product deleted successfully!");
        fetchProducts(sellerId!);
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
    });
    setEditingProduct(null);
  };

  const calculateStats = () => {
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    const avgRating = products.length > 0 
      ? products.reduce((sum, p) => sum + p.rating, 0) / products.length 
      : 0;
    return { totalValue, avgRating };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#191919]">Seller Hub</h1>
            <p className="text-muted-foreground">
              Manage your listings and grow your business
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-[#3665F3] hover:bg-[#0064D2]">
                <Plus className="h-5 w-5 mr-2" />
                Create Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingProduct ? "Edit Listing" : "Create New Listing"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? "Update your product details"
                    : "List a new item for sale"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-semibold">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter product name"
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your item"
                    rows={4}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="font-semibold">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      className="mt-1.5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="font-semibold">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      required
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#3665F3] hover:bg-[#0064D2]">
                    {editingProduct ? "Update Listing" : "List Item"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-[#0064D2]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                  <p className="text-3xl font-bold text-[#191919]">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                  <p className="text-3xl font-bold text-[#191919]">${stats.totalValue.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-3xl font-bold text-[#191919]">{stats.avgRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <Package className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No listings yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first listing to start selling
              </p>
              <Button onClick={() => setIsDialogOpen(true)} size="lg" className="bg-[#3665F3] hover:bg-[#0064D2]">
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-all border-2 overflow-hidden group">
                <CardContent className="p-0">
                  <div className="aspect-square bg-white border-b-2 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <Package className="h-20 w-20 text-gray-300" />
                    </div>
                    {product.rating >= 4.5 && (
                      <Badge className="absolute top-3 left-3 bg-[#E53238] hover:bg-[#E53238]">
                        Hot Item
                      </Badge>
                    )}
                  </div>

                  <div className="p-4">
                    <Badge variant="secondary" className="mb-2">
                      {product.category}
                    </Badge>
                    <h3 className="font-bold text-lg line-clamp-2 mb-2 text-[#191919] group-hover:text-[#0064D2] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-4 text-[#191919]">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-2 border-[#0064D2] text-[#0064D2] hover:bg-blue-50 font-semibold"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-2 hover:border-red-500 hover:text-red-500 font-semibold"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}