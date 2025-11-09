"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingCart, Gavel, ArrowLeft, Package, TrendingUp, Clock, Heart, Shield, Truck } from "lucide-react";
import toast from "react-hot-toast";

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

interface Bid {
  id: number;
  productId: number;
  userId: number;
  amount: number;
  bidDate: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const currentUser = 6;

  const [product, setProduct] = useState<Product | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [highestBid, setHighestBid] = useState<Bid | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingBid, setSubmittingBid] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    fetchBids();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const [bidsRes, highestRes] = await Promise.all([
        fetch(`/api/bids?product_id=${productId}`),
        fetch(`/api/bids/highest?product_id=${productId}`),
      ]);

      if (bidsRes.ok) {
        const bidsData = await bidsRes.json();
        setBids(bidsData);
      }

      if (highestRes.ok) {
        const highestData = await highestRes.json();
        setHighestBid(highestData);
      }
    } catch (error) {
      console.error("Failed to fetch bids:", error);
    }
  };

  const handleAddToCart = async () => {
    if (product?.saleType === "auction") {
      toast.error("This item is auction only. Please place a bid instead.");
      return;
    }
    
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser,
          productId: parseInt(productId),
          quantity: 1,
        }),
      });

      if (res.ok) {
        toast.success("Added to cart!");
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleDirectBuy = async () => {
    if (product?.saleType === "auction") {
      toast.error("This item is auction only. Please place a bid instead.");
      return;
    }
    
    try {
      const res = await fetch("/api/direct-buys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(productId),
          buyerId: currentUser,
        }),
      });

      if (res.ok) {
        toast.success("Purchase successful!");
        router.push("/orders");
      } else {
        toast.error("Failed to complete purchase");
      }
    } catch (error) {
      toast.error("Failed to complete purchase");
    }
  };

  const handlePlaceBid = async () => {
    if (!bidAmount || isNaN(parseFloat(bidAmount))) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    const amount = parseFloat(bidAmount);
    const minBid = highestBid ? highestBid.amount + 1 : product!.price;

    if (amount < minBid) {
      toast.error(`Bid must be at least $${minBid.toFixed(2)}`);
      return;
    }

    try {
      setSubmittingBid(true);
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(productId),
          userId: currentUser,
          amount,
        }),
      });

      if (res.ok) {
        toast.success("Bid placed successfully!");
        setBidAmount("");
        fetchBids();
      } else {
        toast.error("Failed to place bid");
      }
    } catch (error) {
      toast.error("Failed to place bid");
    } finally {
      setSubmittingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const isAuction = product.saleType === "auction";

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="container py-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to search results
        </Button>

        <div className={`grid ${isAuction ? "lg:grid-cols-5" : "lg:grid-cols-2"} gap-6`}>
          {/* Left Column - Product Image */}
          <div className={isAuction ? "lg:col-span-2" : ""}>
            <Card className="overflow-hidden border-2">
              <CardContent className="p-0">
                <div className="aspect-square bg-white border-b-2 flex items-center justify-center relative">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <Package className="h-32 w-32 text-gray-300" />
                    </div>
                  )}
                  {isAuction ? (
                    <Badge className="absolute top-4 left-4 bg-[#E53238] hover:bg-[#E53238] flex items-center gap-1">
                      <Gavel className="h-4 w-4" />
                      Auction Item
                    </Badge>
                  ) : product.rating >= 4.5 ? (
                    <Badge className="absolute top-4 left-4 bg-[#E53238] hover:bg-[#E53238] flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </Badge>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-[#0064D2]" />
                <span className="font-medium">eBay Money Back Guarantee</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-[#0064D2]" />
                <span className="font-medium">Free shipping on this item</span>
              </div>
            </div>
          </div>

          {/* Middle Column - Product Info */}
          <div className={`${isAuction ? "lg:col-span-2" : ""} space-y-4`}>
            <Card className="border-2">
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3">{product.category}</Badge>
                <h1 className="text-3xl font-bold mb-4 text-[#191919]">{product.name}</h1>

                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.rating.toFixed(1)} out of 5 stars</span>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-1">
                    {isAuction ? "Starting bid:" : "Price:"}
                  </div>
                  <div className="text-4xl font-bold text-[#191919]">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-600 font-medium mt-1">
                    Free shipping
                  </div>
                </div>

                {!isAuction && (
                  <>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-[#0064D2] mt-0.5" />
                        <div>
                          <div className="font-semibold text-[#0064D2]">Limited quantity available</div>
                          <div className="text-sm text-muted-foreground">More than 50% sold</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button 
                        onClick={handleDirectBuy} 
                        className="w-full h-12 text-base font-semibold bg-[#3665F3] hover:bg-[#0064D2]"
                        size="lg"
                      >
                        Buy It Now
                      </Button>
                      <Button
                        onClick={handleAddToCart}
                        variant="outline"
                        className="w-full h-12 text-base font-semibold border-2 border-[#0064D2] text-[#0064D2] hover:bg-blue-50"
                        size="lg"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to cart
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-12 text-base font-semibold border-2"
                        size="lg"
                        onClick={() => toast.success("Added to watchlist!")}
                      >
                        <Heart className="h-5 w-5 mr-2" />
                        Add to Watchlist
                      </Button>
                    </div>
                  </>
                )}

                {isAuction && (
                  <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
                    <div className="flex items-start gap-3">
                      <Gavel className="h-5 w-5 text-[#E53238] mt-0.5" />
                      <div>
                        <div className="font-semibold text-[#E53238]">Auction Only</div>
                        <div className="text-sm text-muted-foreground">This item can only be purchased through bidding. Place your bid to the right.</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-2">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3">About this item</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bidding (only for auction items) */}
          {isAuction && (
            <div className="lg:col-span-1">
              <Card className="border-2 border-[#E53238] sticky top-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Gavel className="h-6 w-6 text-[#E53238]" />
                    <h2 className="text-xl font-bold">Place a Bid</h2>
                  </div>

                  {highestBid && (
                    <div className="mb-4 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-300">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Current bid</div>
                      <div className="text-3xl font-bold text-[#191919]">${highestBid.amount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {bids.length} {bids.length === 1 ? 'bid' : 'bids'}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Enter your bid
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Min: $${(highestBid ? highestBid.amount + 1 : product.price).toFixed(2)}`}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="h-11 border-2 text-lg"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Minimum bid: ${(highestBid ? highestBid.amount + 1 : product.price).toFixed(2)}
                      </div>
                    </div>
                    <Button
                      onClick={handlePlaceBid}
                      disabled={submittingBid}
                      className="w-full h-11 font-semibold bg-[#E53238] hover:bg-[#C52128]"
                    >
                      <Gavel className="h-4 w-4 mr-2" />
                      {submittingBid ? "Placing Bid..." : "Place Bid"}
                    </Button>
                  </div>

                  {bids.length > 0 && (
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3 text-sm">Bid History ({bids.length})</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {bids
                          .sort((a, b) => b.amount - a.amount)
                          .map((bid, idx) => (
                            <div
                              key={bid.id}
                              className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm"
                            >
                              <span className="font-medium">
                                {idx === 0 ? "🏆 " : ""}User {bid.userId}
                              </span>
                              <span className="font-bold">${bid.amount.toFixed(2)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}