"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gavel, Package, TrendingUp, Clock } from "lucide-react";
import Image from "next/image";

interface Bid {
  id: number;
  productId: number;
  userId: number;
  amount: number;
  bidDate: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
  imageUrl?: string | null;
}

interface BidWithProduct extends Bid {
  product?: Product;
  isHighest?: boolean;
}

export default function BidsPage() {
  const router = useRouter();
  const currentUser = 6; // Same as in other components
  
  const [bids, setBids] = useState<BidWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBids();
  }, []);

  const fetchUserBids = async () => {
    try {
      setLoading(true);
      // Fetch all user's bids
      const bidsRes = await fetch(`/api/bids?user_id=${currentUser}`);
      if (!bidsRes.ok) {
        setLoading(false);
        return;
      }
      
      const bidsData: Bid[] = await bidsRes.json();
      
      // Fetch product details and highest bid for each unique product
      const uniqueProductIds = [...new Set(bidsData.map(b => b.productId))];
      const productsPromises = uniqueProductIds.map(id => 
        fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null)
      );
      const highestBidsPromises = uniqueProductIds.map(id =>
        fetch(`/api/bids/highest?product_id=${id}`).then(r => r.ok ? r.json() : null)
      );
      
      const [products, highestBids] = await Promise.all([
        Promise.all(productsPromises),
        Promise.all(highestBidsPromises)
      ]);
      
      // Map products and highest bids to product IDs
      const productMap = new Map(products.filter(p => p).map(p => [p.id, p]));
      const highestBidMap = new Map(highestBids.filter(b => b).map(b => [b.productId, b]));
      
      // Enrich bids with product info and highest bid status
      const enrichedBids = bidsData.map(bid => ({
        ...bid,
        product: productMap.get(bid.productId),
        isHighest: highestBidMap.get(bid.productId)?.id === bid.id
      }));
      
      // Sort by date (newest first)
      enrichedBids.sort((a, b) => new Date(b.bidDate).getTime() - new Date(a.bidDate).getTime());
      
      setBids(enrichedBids);
    } catch (error) {
      console.error("Failed to fetch bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container py-8">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Gavel className="h-8 w-8 text-[#E53238]" />
          <h1 className="text-4xl font-bold text-[#191919]">My Bids</h1>
        </div>

        {bids.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Gavel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No bids yet</h2>
              <p className="text-muted-foreground mb-6">
                Start bidding on products to see them here
              </p>
              <Button onClick={() => router.push("/products")}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => (
              <Card 
                key={bid.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${
                  bid.isHighest ? 'border-green-500 bg-green-50/50' : ''
                }`}
                onClick={() => router.push(`/products/${bid.productId}`)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border-2">
                      {bid.product?.imageUrl ? (
                        <Image
                          src={bid.product.imageUrl}
                          alt={bid.product.name || "Product"}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Bid Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          {bid.product && (
                            <Badge variant="secondary" className="mb-2">
                              {bid.product.category}
                            </Badge>
                          )}
                          <h3 className="text-xl font-bold text-[#191919] mb-1 hover:text-[#0064D2]">
                            {bid.product?.name || `Product #${bid.productId}`}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(bid.bidDate)}</span>
                          </div>
                        </div>
                        
                        {bid.isHighest && (
                          <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Highest Bid
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Your bid amount</div>
                          <div className="text-3xl font-bold text-[#191919]">
                            ${bid.amount.toFixed(2)}
                          </div>
                        </div>

                        {bid.product && (
                          <div className="text-right space-y-1">
                            <div className="text-sm text-muted-foreground">Buy It Now price</div>
                            <div className="text-2xl font-bold text-gray-600">
                              ${bid.product.price.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
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
