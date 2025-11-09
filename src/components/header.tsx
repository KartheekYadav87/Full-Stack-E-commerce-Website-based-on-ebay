"use client";

import Link from "next/link";
import { ShoppingCart, Search, ChevronDown, Menu, User, Heart, Bell, Gavel, Receipt, Users, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const CATEGORIES = [
  "Electronics",
  "Home & Garden",
  "Fashion",
  "Sports",
  "Books",
  "Tools"
];

export function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [currentUser] = useState(6);

  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const res = await fetch(`/api/cart?user_id=${currentUser}`);
      if (res.ok) {
        const items = await res.json();
        setCartCount(items.length);
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      {/* Top Bar */}
      <div className="border-b bg-muted/30">
        <div className="container flex h-10 items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Link href="/register" className="hover:underline font-semibold">
              Register
            </Link>
            <Link href="/products" className="hover:underline">
              Daily Deals
            </Link>
            <Link href="/seller/dashboard" className="hover:underline">
              Sell
            </Link>
            <Link href="/users" className="hover:underline flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </Link>
            <Link href="/sellers" className="hover:underline flex items-center gap-1">
              <Store className="h-4 w-4" />
              <span>Sellers</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/bids" className="hover:underline flex items-center gap-1">
              <Gavel className="h-4 w-4" />
              <span>My Bids</span>
            </Link>
            <Link href="/orders" className="hover:underline flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              <span>Orders</span>
            </Link>
            <Link href="/cart" className="hover:underline flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container">
        <div className="flex h-16 items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-[#E53238]">e</span>
              <span className="text-3xl font-bold text-[#0064D2]">Bay</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-3xl">
            <div className="relative flex items-center">
              <Input
                type="text"
                placeholder="Search for anything"
                className="pr-32 h-11 rounded-r-none border-2 border-r-0 border-gray-300 focus-visible:ring-0 focus-visible:border-[#0064D2]"
              />
              <Button
                variant="ghost"
                className="absolute right-24 h-8 px-3 hover:bg-transparent"
              >
                <span className="text-sm text-muted-foreground">All Categories</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              <Button className="h-11 rounded-l-none bg-[#3665F3] hover:bg-[#0064D2] px-8 font-semibold">
                Search
              </Button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="hidden lg:flex">
              <Heart className="h-5 w-5 mr-1" />
              Watchlist
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="border-t bg-white">
        <div className="container">
          <div className="flex items-center h-12 gap-1">
            <Button variant="ghost" size="sm" className="font-semibold">
              <Menu className="h-4 w-4 mr-2" />
              Shop by category
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
            {CATEGORIES.map((category) => (
              <Link key={category} href={`/products?category=${category}`}>
                <Button variant="ghost" size="sm" className="text-sm">
                  {category}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}