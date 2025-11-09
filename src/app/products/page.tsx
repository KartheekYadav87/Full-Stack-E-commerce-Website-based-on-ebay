"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  sellerId: number;
  imageUrl?: string | null;
  saleType?: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?limit=100");
      if (res.ok) {
        const data = await res.json();
        const filtered = category 
          ? data.filter((p: Product) => 
              p.category.trim().toLowerCase() === category.trim().toLowerCase()
            ).slice(0, 3)
          : data;
        setProducts(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        {/* Category Title */}
        <h1 className="text-3xl font-bold mb-8 text-[#191919]">
          {category || "All Products"}
        </h1>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No products found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={fetchProducts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}