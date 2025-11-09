"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, Minus, ShoppingBag, Package, Shield, ArrowRight, CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

export default function CartPage() {
  const router = useRouter();
  const currentUser = 6;
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentType, setPaymentType] = useState<string>("credit_card");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cart?user_id=${currentUser}`);
      if (res.ok) {
        const items = await res.json();
        const itemsWithProducts = await Promise.all(
          items.map(async (item: CartItem) => {
            const productRes = await fetch(`/api/products/${item.productId}`);
            if (productRes.ok) {
              const product = await productRes.json();
              return { ...item, product };
            }
            return item;
          })
        );
        setCartItems(itemsWithProducts);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (res.ok) {
        fetchCart();
      } else {
        toast.error("Failed to update quantity");
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Item removed from cart");
        fetchCart();
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    const total = calculateTotal();
    
    if (!paymentType) {
      toast.error("Please select a payment method");
      return;
    }
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser,
          totalAmount: total,
          status: "pending",
          paymentType: paymentType,
        }),
      });

      if (res.ok) {
        await Promise.all(cartItems.map((item) => removeItem(item.id)));
        toast.success("Order placed successfully!");
        router.push("/orders");
      } else {
        toast.error("Failed to place order");
      }
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground mb-6">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>

        {cartItems.length === 0 ? (
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Shop today's deals and discover millions of items
              </p>
              <Button onClick={() => router.push("/")} size="lg" className="bg-[#3665F3] hover:bg-[#0064D2]">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 bg-white border-2 rounded-lg flex items-center justify-center shrink-0">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-full h-full rounded flex items-center justify-center">
                          <Package className="h-16 w-16 text-gray-300" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-2 text-[#191919]">
                          {item.product?.name || "Product"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.product?.description}
                        </p>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="text-2xl font-bold text-[#191919]">
                            ${(item.product?.price || 0).toFixed(2)}
                          </div>
                          <div className="text-sm text-green-600 font-medium">Free shipping</div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 border-2 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-bold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-[#0064D2] hover:text-[#E53238] font-semibold"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="sticky top-6 border-2">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Summary</h2>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                      <span className="font-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-bold text-green-600">FREE</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between mb-6">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-3xl font-bold text-[#191919]">${calculateTotal().toFixed(2)}</span>
                  </div>

                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="h-5 w-5 text-[#0064D2]" />
                      <h3 className="font-semibold text-[#0064D2]">Select Payment Method</h3>
                    </div>
                    <RadioGroup value={paymentType} onValueChange={setPaymentType} className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label htmlFor="credit_card" className="flex-1 cursor-pointer font-medium">
                          Credit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors">
                        <RadioGroupItem value="debit_card" id="debit_card" />
                        <Label htmlFor="debit_card" className="flex-1 cursor-pointer font-medium">
                          Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex-1 cursor-pointer font-medium">
                          UPI
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button 
                    onClick={handleCheckout} 
                    className="w-full h-12 text-base font-semibold bg-[#3665F3] hover:bg-[#0064D2]" 
                    size="lg"
                  >
                    Go to checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <div className="mt-6 pt-6 border-t space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="h-5 w-5 text-[#0064D2]" />
                      <span>eBay Money Back Guarantee</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Get the item you ordered or your money back
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}