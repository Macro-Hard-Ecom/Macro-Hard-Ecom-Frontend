import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  CreditCard,
  RefreshCcw,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { getOrderById } from "../../services/orderService";
import { getPaymentByOrder, refundPayment } from "../../services/Paymentservice";

interface OrderItem {
  name?: string;
  productId?: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface PaymentInfo {
  paymentId: string;
  status: string;
  paymentMethod: string;
  amount: number;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Paid:       { label: "Paid",       color: "#00a651", bg: "bg-green-50",  icon: CheckCircle },
  completed:  { label: "Completed",  color: "#00a651", bg: "bg-green-50",  icon: CheckCircle },
  pending:    { label: "Pending",    color: "#ffb900", bg: "bg-yellow-50", icon: Clock },
  Pending:    { label: "Pending",    color: "#ffb900", bg: "bg-yellow-50", icon: Clock },
  failed:     { label: "Failed",     color: "#e81123", bg: "bg-red-50",    icon: XCircle },
  Refunded:   { label: "Refunded",   color: "#0078d4", bg: "bg-blue-50",   icon: RefreshCcw },
  refunded:   { label: "Refunded",   color: "#0078d4", bg: "bg-blue-50",   icon: RefreshCcw },
};

const getStatusCfg = (status: string) =>
  STATUS_CONFIG[status] ?? { label: status || "Processing", color: "#0078d4", bg: "bg-blue-50", icon: Clock };

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [error, setError] = useState("");
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    if (!id) { setError("Order ID not found"); setLoadingOrder(false); return; }
    const token = localStorage.getItem("token");
    if (!token) { setError("Please login to view order details"); setLoadingOrder(false); return; }

    try {
      const res = await getOrderById(id, token);
      setOrder(res.data);
      // After order loads, try to fetch payment info
      fetchPayment(id, token);
    } catch {
      setError("Failed to load order details");
    } finally {
      setLoadingOrder(false);
    }
  };

  const fetchPayment = async (orderId: string, token: string) => {
    try {
      const res = await getPaymentByOrder(orderId, token);
      setPayment(res.data.payment);
    } catch {
      // No payment yet — that's fine
      setPayment(null);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleRefund = async () => {
    if (!payment) return;
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please login"); return; }

    setRefunding(true);
    try {
      await refundPayment(payment.paymentId, "Customer requested refund", token);
      toast.success("Refund processed successfully");
      // Re-fetch to get updated status
      fetchOrder();
    } catch {
      toast.error("Failed to process refund");
    } finally {
      setRefunding(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loadingOrder) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0078d4] mx-auto" />
          <p className="text-gray-500 font-semibold">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-[#e81123] w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">OOPS</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/orders">
            <Button className="bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold">
              <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO ORDERS
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const orderStatus = getStatusCfg(order.status);
  const OrderStatusIcon = orderStatus.icon;

  const isPaid = order.status === "Paid" || order.status === "completed";
  const isRefunded = order.status === "Refunded" || payment?.status === "refunded";
  const needsPayment = !isPaid && !isRefunded;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/orders"
            className="inline-flex items-center text-gray-500 hover:text-[#0078d4] font-semibold transition-colors text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 min-h-[calc(100vh-8rem)] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-8">
            <div className="inline-flex gap-2 mb-3">
              <div className="w-3 h-3 bg-[#00a651]"></div>
              <div className="w-3 h-3 bg-[#0078d4]"></div>
              <div className="w-3 h-3 bg-[#ffb900]"></div>
              <div className="w-3 h-3 bg-[#e81123]"></div>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">ORDER DETAILS</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column — Order info + items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order meta */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-1.5 grid grid-cols-4">
                  <div className="bg-[#00a651]"></div>
                  <div className="bg-[#0078d4]"></div>
                  <div className="bg-[#ffb900]"></div>
                  <div className="bg-[#e81123]"></div>
                </div>
                <CardContent className="pt-6 pb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Order ID</p>
                      <p className="font-mono text-sm text-gray-700 break-all">{order._id}</p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 ${orderStatus.bg} self-start sm:self-auto`}
                    >
                      <OrderStatusIcon className="h-4 w-4" style={{ color: orderStatus.color }} />
                      <span className="font-bold text-sm" style={{ color: orderStatus.color }}>
                        {orderStatus.label}
                      </span>
                    </div>
                  </div>
                  {order.createdAt && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Date</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-gray-900 uppercase tracking-wide text-sm">Order Total</span>
                      <span className="font-black text-2xl text-[#0078d4]">
                        ${order.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-1 bg-[#0078d4]" />
                <CardHeader className="pb-2">
                  <CardTitle className="font-black text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#0078d4]" />
                    ITEMS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                          <div className="bg-gray-100 w-10 h-10 flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {item.name || item.productId || "Unknown Product"}
                            </p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                          </div>
                          <p className="font-black text-gray-900 text-sm flex-shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-6">No items found</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column — Payment panel */}
            <div className="space-y-4">
              {/* Payment status card */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-1 bg-[#00a651]" />
                <CardHeader className="pb-2">
                  <CardTitle className="font-black text-gray-900 flex items-center gap-2 text-base">
                    <CreditCard className="h-5 w-5 text-[#00a651]" />
                    PAYMENT
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingPayment ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : payment ? (
                    <div className="space-y-3">
                      {/* Payment status */}
                      {(() => {
                        const cfg = getStatusCfg(payment.status);
                        const Icon = cfg.icon;
                        return (
                          <div className={`flex items-center gap-2 px-3 py-2 ${cfg.bg}`}>
                            <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                            <span className="font-bold text-sm" style={{ color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </div>
                        );
                      })()}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Method</span>
                          <span className="font-semibold text-gray-800 capitalize">{payment.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount</span>
                          <span className="font-black text-[#0078d4]">${payment.amount?.toFixed(2)}</span>
                        </div>
                        {payment.createdAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Date</span>
                            <span className="font-semibold text-gray-800">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 text-xs">Payment ID</span>
                          <p className="font-mono text-xs text-gray-600 break-all mt-0.5">{payment.paymentId}</p>
                        </div>
                      </div>

                      {/* Refund button — only if paid and not already refunded */}
                      {isPaid && !isRefunded && payment.status !== "refunded" && (
                        <Button
                          onClick={handleRefund}
                          disabled={refunding}
                          variant="outline"
                          className="w-full border-2 border-[#e81123] text-[#e81123] hover:bg-red-50 font-bold"
                        >
                          {refunding ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              PROCESSING…
                            </>
                          ) : (
                            <>
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              REQUEST REFUND
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2 space-y-3">
                      <p className="text-sm text-gray-500">No payment recorded yet.</p>
                    </div>
                  )}

                  {/* Pay Now button — visible when order not paid */}
                  {needsPayment && (
                    <Button
                      onClick={() => navigate(`/payment/${order._id}`)}
                      className="w-full h-12 bg-[#00a651] hover:bg-[#008a44] text-white font-black shadow-md hover:shadow-lg transition-all"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      PAY NOW — ${order.totalAmount?.toFixed(2)}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}