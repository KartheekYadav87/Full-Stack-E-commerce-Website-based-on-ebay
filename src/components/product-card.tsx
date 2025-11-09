"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, Package, Gavel } from "lucide-react";
import toast from "react-hot-toast";

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  imageUrl?: string | null;
  saleType?: string;
  onAddToCart?: () => void;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  category,
  rating,
  imageUrl,
  saleType = "fixed",
  onAddToCart,
}: ProductCardProps) {
  const isAuction = saleType === "auction";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isAuction) {
      // For auction items, don't prevent default - let the link navigate
      return;
    }
    
    try {
      const currentUser = 6;
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser,
          productId: id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        toast.success("Added to cart!");
        onAddToCart?.();
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Link href={`/products/${id}`}>
      <Card className="h-full hover:shadow-xl transition-all duration-200 border-gray-200 overflow-hidden group">
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative aspect-square bg-white border-b overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <Package className="h-20 w-20 text-gray-300" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                toast.success("Added to watchlist!");
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
            {isAuction ? (
              <Badge className="absolute top-2 left-2 bg-[#E53238] hover:bg-[#E53238] flex items-center gap-1">
                <Gavel className="h-3 w-3" />
                Auction
              </Badge>
            ) : rating >= 4.5 ? (
              <Badge className="absolute top-2 left-2 bg-[#E53238] hover:bg-[#E53238]">
                Trending
              </Badge>
            ) : null}
          </div>

          {/* Product Info */}
          <div className="p-3">
            <div className="mb-1">
              <h3 className="font-semibold line-clamp-2 text-[#191919] leading-tight mb-1 group-hover:text-[#0064D2] transition-colors">
                {name}
              </h3>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({rating.toFixed(1)})</span>
            </div>

            <div className="mb-3">
              <div className="text-2xl font-bold text-[#191919]">
                {isAuction ? "Starting bid: " : ""}${price.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Free shipping
              </div>
            </div>

            <Button
              className={`w-full font-semibold ${
                isAuction 
                  ? "bg-[#E53238] hover:bg-[#C52128]" 
                  : "bg-[#3665F3] hover:bg-[#0064D2]"
              }`}
              onClick={isAuction ? undefined : handleAddToCart}
              size="sm"
            >
              {isAuction ? (
                <>
                  <Gavel className="h-4 w-4 mr-2" />
                  Place Bid
                </>
              ) : (
                "Buy It Now"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}