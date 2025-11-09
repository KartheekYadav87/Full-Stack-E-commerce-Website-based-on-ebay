"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

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

const CATEGORIES = [
  { 
    name: "Electronics", 
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/12385318-5f59-4ee8-bc4f-772ff3d19483/generated_images/modern-electronics-category-icon-flat-la-958f0625-20251109071430.jpg" 
  },
  { 
    name: "Home & Garden", 
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/12385318-5f59-4ee8-bc4f-772ff3d19483/generated_images/home-and-garden-category-icon-flat-lay-c-549b7eef-20251109071431.jpg" 
  },
  { 
    name: "Fashion", 
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/12385318-5f59-4ee8-bc4f-772ff3d19483/generated_images/fashion-category-icon-flat-lay-compositi-5dfac02e-20251109071431.jpg" 
  },
  { 
    name: "Sports", 
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/12385318-5f59-4ee8-bc4f-772ff3d19483/generated_images/sports-and-fitness-category-icon-flat-la-9b0cca68-20251109071431.jpg" 
  },
  { 
    name: "Books", 
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/12385318-5f59-4ee8-bc4f-772ff3d19483/generated_images/books-category-icon-flat-lay-composition-d732752e-20251109071431.jpg" 
  },
  { 
    name: "Tools", 
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/12385318-5f59-4ee8-bc4f-772ff3d19483/generated_images/tools-and-hardware-category-icon-flat-la-b6461990-20251109071427.jpg" 
  },
];

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollDeals = (direction: 'left' | 'right') => {
    const container = document.getElementById('deals-scroll');
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Get top-rated products for Today's Deals (limit to 8)
  const todaysDeals = products
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      {/* Welcome Section */}
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-3 text-[#191919]">
          Welcome to eBay
        </h1>
        <p className="text-lg text-gray-600">
          Discover amazing deals on products you love
        </p>
      </div>

      {/* Shop by Category */}
      <div className="container pb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 max-w-5xl mx-auto">
          {CATEGORIES.map((category) => (
            <div
              key={category.name}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => router.push(`/products?category=${encodeURIComponent(category.name)}`)}
            >
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-3 overflow-hidden group-hover:shadow-lg transition-shadow border-2 border-gray-200 group-hover:border-[#0064D2] relative">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <h3 className="font-semibold text-center group-hover:text-[#0064D2] transition-colors">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Deals */}
      <div className="bg-gray-50 py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Today&apos;s Deals</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollDeals('left')}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollDeals('right')}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div
              id="deals-scroll"
              className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {todaysDeals.map((product) => (
                <div key={product.id} className="min-w-[280px] snap-start">
                  <ProductCard {...product} onAddToCart={fetchProducts} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}