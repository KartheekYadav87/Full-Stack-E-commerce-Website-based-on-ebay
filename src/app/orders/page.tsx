"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Package, Calendar, DollarSign, Truck, CheckCircle, Clock, ShoppingBag, CreditCard, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  orderDate: string;
  status: string;
  paymentType?: string | null;
}

interface Feedback {
  id: number;
  comments: string;
  orderId: number;
  createdAt: string;
}

export default function OrdersPage() {
  const currentUser = 6;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, Feedback>>({});
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchAllFeedback();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?user_id=${currentUser}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFeedback = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data: Feedback[] = await res.json();
        const map: Record<number, Feedback> = {};
        data.forEach((fb) => {
          map[fb.orderId] = fb;
        });
        setFeedbackMap(map);
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    }
  };

  const handleGiveFeedback = (orderId: number) => {
    setSelectedOrderId(orderId);
    setFeedbackText("");
    setFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedOrderId || !feedbackText.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId,
          comments: feedbackText.trim(),
        }),
      });

      if (res.ok) {
        const newFeedback: Feedback = await res.json();
        setFeedbackMap((prev) => ({
          ...prev,
          [selectedOrderId]: newFeedback,
        }));
        toast.success("Feedback submitted successfully!");
        setFeedbackDialogOpen(false);
        setFeedbackText("");
        setSelectedOrderId(null);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 hover:bg-green-200 border-green-300";
      case "shipped":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300";
      case "processing":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return CheckCircle;
      case "shipped":
        return Truck;
      case "pending":
        return Clock;
      case "processing":
        return Package;
      default:
        return Package;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPaymentType = (paymentType?: string | null) => {
    if (!paymentType) return "Not specified";
    
    switch (paymentType.toLowerCase()) {
      case "credit_card":
        return "Credit Card";
      case "debit_card":
        return "Debit Card";
      case "upi":
        return "UPI";
      default:
        return paymentType;
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[#191919]">Purchase History</h1>
          <p className="text-muted-foreground">
            View and track all your orders
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                When you make a purchase, your orders will appear here
              </p>
              <Button 
                onClick={() => window.location.href = "/"} 
                size="lg" 
                className="bg-[#3665F3] hover:bg-[#0064D2]"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              const hasFeedback = !!feedbackMap[order.id];
              
              return (
                <Card key={order.id} className="hover:shadow-lg transition-all border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#0064D2]/10 rounded-lg">
                          <Package className="h-6 w-6 text-[#0064D2]" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-[#191919]">Order #{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(order.orderDate)}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} border font-semibold px-4 py-1`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <Calendar className="h-5 w-5 text-[#0064D2]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Order Date</p>
                          <p className="font-semibold text-sm">{formatDate(order.orderDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Amount</p>
                          <p className="font-bold text-sm text-[#191919]">${order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <CreditCard className="h-5 w-5 text-[#0064D2]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Payment Method</p>
                          <p className="font-semibold text-sm">{formatPaymentType(order.paymentType)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center sm:justify-end gap-2">
                        <Button variant="outline" className="border-2 border-[#0064D2] text-[#0064D2] hover:bg-blue-50 font-semibold">
                          View Details
                        </Button>
                        {hasFeedback ? (
                          <Button
                            variant="outline"
                            className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold"
                            disabled
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Feedback Given
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleGiveFeedback(order.id)}
                            className="bg-[#0064D2] hover:bg-[#0052A3] text-white font-semibold"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Give Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Give Feedback</DialogTitle>
            <DialogDescription>
              Share your experience with Order #{selectedOrderId}. Your feedback helps us improve.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Write your feedback here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[150px] resize-none"
              disabled={submitting}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {feedbackText.length} characters
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={submitting || !feedbackText.trim()}
              className="bg-[#0064D2] hover:bg-[#0052A3]"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}