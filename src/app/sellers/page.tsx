"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Store, Package, Calendar, Mail, User, ChevronLeft, ChevronRight } from "lucide-react";

interface Seller {
  id: number;
  userId: number;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface SellerWithUser extends Seller {
  user: User | null;
  productsCount: number;
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<SellerWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const sellersPerPage = 10;

  useEffect(() => {
    fetchSellersWithUsers();
  }, []);

  const fetchSellersWithUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch sellers, users, and products in parallel
      const [sellersRes, usersRes, productsRes] = await Promise.all([
        fetch("/api/sellers?limit=100"),
        fetch("/api/users?limit=100"),
        fetch("/api/products?limit=100"),
      ]);

      if (sellersRes.ok && usersRes.ok && productsRes.ok) {
        const sellersData: Seller[] = await sellersRes.json();
        const usersData: User[] = await usersRes.json();
        const productsData = await productsRes.json();

        // Map sellers with their user information and product count
        const sellersWithUsers = sellersData.map((seller) => {
          const user = usersData.find((u) => u.id === seller.userId) || null;
          const productsCount = productsData.filter(
            (p: any) => p.sellerId === seller.id
          ).length;

          return {
            ...seller,
            user,
            productsCount,
          };
        });

        setSellers(sellersWithUsers);
      }
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(sellers.length / sellersPerPage);
  const startIndex = (currentPage - 1) * sellersPerPage;
  const endIndex = startIndex + sellersPerPage;
  const currentSellers = sellers.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalProducts = sellers.reduce((sum, seller) => sum + seller.productsCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <div className="container py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Card className="border-2">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#E53238] rounded-lg">
              <Store className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#191919]">Sellers</h1>
              <p className="text-muted-foreground">
                View all registered sellers on the platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-base px-4 py-2">
              Total Sellers: {sellers.length}
            </Badge>
            <Badge variant="outline" className="text-base px-4 py-2">
              Total Products: {totalProducts}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Store className="h-6 w-6 text-[#E53238]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Sellers</p>
                  <p className="text-3xl font-bold text-[#191919]">{sellers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-[#0064D2]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                  <p className="text-3xl font-bold text-[#191919]">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Products/Seller</p>
                  <p className="text-3xl font-bold text-[#191919]">
                    {sellers.length > 0 ? (totalProducts / sellers.length).toFixed(1) : "0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sellers Table */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">All Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            {currentSellers.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No sellers found</h3>
                <p className="text-muted-foreground">
                  No sellers registered yet
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Seller ID</TableHead>
                        <TableHead className="font-bold">User Info</TableHead>
                        <TableHead className="font-bold">Email</TableHead>
                        <TableHead className="font-bold">Products</TableHead>
                        <TableHead className="font-bold">Joined Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSellers.map((seller) => (
                        <TableRow key={seller.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#E53238] to-[#C52128] flex items-center justify-center text-white font-bold text-sm">
                                {seller.id}
                              </div>
                              <span className="font-semibold">#{seller.id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {seller.user ? (
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0064D2] to-[#3665F3] flex items-center justify-center text-white font-semibold text-sm">
                                  {seller.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold">{seller.user.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    User ID: #{seller.userId}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>User #{seller.userId}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {seller.user ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {seller.user.email}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={seller.productsCount > 0 ? "default" : "secondary"}
                              className={
                                seller.productsCount > 0
                                  ? "bg-[#0064D2] hover:bg-[#0064D2]"
                                  : ""
                              }
                            >
                              <Package className="h-3 w-3 mr-1" />
                              {seller.productsCount} {seller.productsCount === 1 ? "product" : "products"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(seller.createdAt)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, sellers.length)} of{" "}
                      {sellers.length} sellers
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              currentPage === page
                                ? "bg-[#0064D2] hover:bg-[#0064D2]"
                                : ""
                            }
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}