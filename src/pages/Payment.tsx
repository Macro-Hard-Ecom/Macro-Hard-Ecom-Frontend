import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Smartphone,
  Building2,
  Wallet,
  ReceiptText,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { getOrderById } from "../services/orderService";
import { processPayment } from "../services/Paymentservice";

const PAYMENT_METHODS = [
  {
    id: "mock",
    label: "Mock Pay",
    description: "Instant simulated payment",
    icon: Wallet,
    color: "#0078d4",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex",
    icon: CreditCard,
    color: "#00a651",
  },
  {
    id: "mobile",
    label: "Mobile Payment",
    description: "Apple Pay, Google Pay",
    icon: Smartphone,
    color: "#ffb900",
  },
  {
    id: "bank",
    label: "Bank Transfer",
    description: "Direct debit",
    icon: Building2,
    color: "#e81123",
  },
];

type PaymentState = "idle" | "processing" | "success" | "failed";

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

export function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("mock");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentResult, setPaymentResult] = useState<{ paymentId?: string; status?: string } | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setOrderError("Please login to continue");
      setLoadingOrder(false);
      return;
    }
    try {
      const res = await getOrderById(orderId!, token);
      setOrder(res.data);
    } catch {
      setOrderError("Failed to load order");
    } finally {
      setLoadingOrder(false);
    }
  };

  const handlePay = async () => {
    const token = localStorage.getItem("token");
    if (!token || !order) return;

    setPaymentState("processing");

    try {
      const res = await processPayment(order._id, selectedMethod, token);
      const { payment } = res.data;

      if (payment.status === "success") {
        setPaymentState("success");
        setPaymentResult({ paymentId: payment.paymentId, status: "success" });
        toast.success("Payment successful!");
      } else {
        setPaymentState("failed");
        setPaymentResult({ status: "failed" });
        toast.error("Payment failed. Please try again.");
      }
    } catch {
      setPaymentState("failed");
      setPaymentResult({ status: "failed" });
      toast.error("Payment processing error.");
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

  if (orderError || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-[#e81123] w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">ORDER NOT FOUND</h2>
          <p className="text-gray-500 mb-6">{orderError || "Could not retrieve order."}</p>
          <Link to="/orders">
            <Button className="bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold">
              <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO ORDERS
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Success Screen ───────────────────────────────────────────────────────
  if (paymentState === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="w-24 h-24 bg-[#00a651] flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            PAYMENT SUCCESSFUL
          </h1>
          <p className="text-gray-500 mb-2 font-medium">
            Your order has been marked as <span className="text-[#00a651] font-bold">Paid</span>.
          </p>
          {paymentResult?.paymentId && (
            <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-100 px-3 py-2 inline-block">
              Payment ID: {paymentResult.paymentId}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Link to={`/orders/${order._id}`}>
              <Button className="bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold w-full sm:w-auto">
                <ReceiptText className="mr-2 h-4 w-4" />
                VIEW ORDER
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="outline" className="font-bold border-2 w-full sm:w-auto">
                ALL ORDERS
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Failed Screen ────────────────────────────────────────────────────────
  if (paymentState === "failed") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="w-24 h-24 bg-[#e81123] flex items-center justify-center mx-auto mb-6 shadow-xl">
            <XCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            PAYMENT FAILED
          </h1>
          <p className="text-gray-500 mb-8 font-medium">
            Something went wrong. Please try a different payment method.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setPaymentState("idle")}
              className="bg-[#e81123] hover:bg-[#c70e1a] text-white font-bold"
            >
              TRY AGAIN
            </Button>
            <Link to="/orders">
              <Button variant="outline" className="font-bold border-2">
                BACK TO ORDERS
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main Payment UI ──────────────────────────────────────────────────────
  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to={`/orders/${order._id}`}
            className="inline-flex items-center text-gray-500 hover:text-[#0078d4] font-semibold transition-colors text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 min-h-[calc(100vh-8rem)] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex gap-2 mb-3">
              <div className="w-3 h-3 bg-[#00a651]"></div>
              <div className="w-3 h-3 bg-[#0078d4]"></div>
              <div className="w-3 h-3 bg-[#ffb900]"></div>
              <div className="w-3 h-3 bg-[#e81123]"></div>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">CHECKOUT</h1>
            <p className="text-gray-500 font-medium mt-1">Complete your purchase securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left — Payment Method Selection */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-1.5 grid grid-cols-4">
                  <div className="bg-[#00a651]"></div>
                  <div className="bg-[#0078d4]"></div>
                  <div className="bg-[#ffb900]"></div>
                  <div className="bg-[#e81123]"></div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="font-black text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#0078d4]" />
                    SELECT PAYMENT METHOD
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full flex items-center gap-4 p-4 border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? "border-[#0078d4] bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: isSelected ? method.color : "#f3f4f6" }}
                        >
                          <Icon
                            className="h-6 w-6"
                            style={{ color: isSelected ? "#fff" : method.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${isSelected ? "text-[#0078d4]" : "text-gray-900"}`}>
                            {method.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                            isSelected
                              ? "border-[#0078d4] bg-[#0078d4]"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Security badge */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-[#00a651] flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-700">Secured by Macrohard Pay.</span>{" "}
                  Your payment information is encrypted and never stored on our servers.
                </p>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-0 shadow-lg overflow-hidden sticky top-24">
                <div className="h-1 bg-[#ffb900]" />
                <CardHeader className="pb-2">
                  <CardTitle className="font-black text-gray-900 text-base">ORDER SUMMARY</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order ID */}
                  <div className="bg-gray-50 px-3 py-2">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Order ID</p>
                    <p className="font-mono text-xs text-gray-700 mt-0.5 truncate">{order._id}</p>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-start text-sm py-1.5 border-b border-gray-100 last:border-0">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-semibold text-gray-800 truncate text-xs">
                            {item.name || item.productId || "Product"}
                          </p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-900 text-xs flex-shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-gray-900 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-gray-900 text-sm uppercase tracking-wide">Total</span>
                      <span className="font-black text-2xl text-[#0078d4]">
                        ${order.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <AnimatePresence mode="wait">
                    {paymentState === "processing" ? (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-14 bg-gray-100 flex items-center justify-center gap-3"
                      >
                        <Loader2 className="h-5 w-5 animate-spin text-[#0078d4]" />
                        <span className="font-black text-gray-600 text-sm">PROCESSING…</span>
                      </motion.div>
                    ) : (
                      <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Button
                          onClick={handlePay}
                          className="w-full h-14 bg-[#00a651] hover:bg-[#008a44] text-white font-black text-base shadow-lg hover:shadow-xl transition-all"
                          size="lg"
                        >
                          <ShieldCheck className="mr-2 h-5 w-5" />
                          PAY ${order.totalAmount?.toFixed(2)}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-center text-xs text-gray-400">
                    By placing this order you agree to our Terms of Service.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}