import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Building2,
  Package,
  ReceiptText,
  Upload,
  Eye,
  EyeOff,
  FileImage,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { getOrderById } from "../services/orderService";
import { processPayment } from "../services/Paymentservice";

type PaymentMethodId = "card" | "bank" | "cod";

const PAYMENT_METHODS: {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  accentBg: string;
}[] = [
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex",
    icon: CreditCard,
    color: "#0078d4",
    accentBg: "#f0f7ff",
  },
  {
    id: "bank",
    label: "Bank Deposit",
    description: "Upload transfer slip",
    icon: Building2,
    color: "#e81123",
    accentBg: "#fff5f5",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when you receive",
    icon: Package,
    color: "#00a651",
    accentBg: "#f0fdf4",
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("card");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentResult, setPaymentResult] = useState<{ paymentId?: string; status?: string } | null>(null);

  // Card form
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Bank slip
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pay button gating
  const cardComplete =
    cardNumber.replace(/\s/g, "").length === 16 &&
    cardName.trim().length >= 2 &&
    cardExpiry.length === 5 &&
    cardCvv.length >= 3;

  const isPayEnabled =
    selectedMethod === "cod" ||
    (selectedMethod === "card" && cardComplete) ||
    (selectedMethod === "bank" && slipFile !== null);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const getCardBrand = () => {
    const num = cardNumber.replace(/\s/g, "");
    if (num.startsWith("4")) return "VISA";
    if (num.startsWith("5") || num.startsWith("2")) return "MASTERCARD";
    if (num.startsWith("34") || num.startsWith("37")) return "AMEX";
    return null;
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlipFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSlipPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeSlip = () => {
    setSlipFile(null);
    setSlipPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">PAYMENT SUCCESSFUL</h1>
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
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">PAYMENT FAILED</h1>
          <p className="text-gray-500 mb-8 font-medium">
            Something went wrong. Please try a different payment method.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setPaymentState("idle")} className="bg-[#e81123] hover:bg-[#c70e1a] text-white font-bold">
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

  return (
    <div>
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
          <div className="mb-8">
            <div className="inline-flex gap-2 mb-3">
              <div className="w-3 h-3 bg-[#00a651]" />
              <div className="w-3 h-3 bg-[#0078d4]" />
              <div className="w-3 h-3 bg-[#ffb900]" />
              <div className="w-3 h-3 bg-[#e81123]" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">CHECKOUT</h1>
            <p className="text-gray-500 font-medium mt-1">Complete your purchase securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left — methods */}
            <div className="lg:col-span-3 space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;

                return (
                  <div
                    key={method.id}
                    className={`overflow-hidden bg-white transition-all duration-200 ${
                      isSelected
                        ? "border-2 border-gray-900 shadow-md"
                        : "border-2 border-gray-200 shadow-sm hover:border-gray-300"
                    }`}
                  >
                    {/* Selector row */}
                    <button
                      onClick={() => setSelectedMethod(method.id)}
                      className="w-full flex items-center gap-4 p-4 text-left"
                    >
                      <div
                        className="w-11 h-11 flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                        style={{ backgroundColor: isSelected ? method.color : "#f3f4f6" }}
                      >
                        <Icon className="h-5 w-5" style={{ color: isSelected ? "#fff" : method.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-gray-900">{method.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{method.description}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? "border-gray-900 bg-gray-900" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>

                    {/* Expandable panels */}
                    <AnimatePresence initial={false}>

                      {/* ── Card ─────────────────────────────────────── */}
                      {isSelected && method.id === "card" && (
                        <motion.div
                          key="card-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="border-t border-gray-100 px-5 py-5 space-y-5" style={{ backgroundColor: method.accentBg }}>

                            {/* Card preview */}
                            <div
                              className="relative w-full select-none cursor-pointer rounded-2xl"
                              style={{ height: 172, perspective: 1000 }}
                              onClick={() => setCardFlipped((f) => !f)}
                            >
                              <motion.div
                                animate={{ rotateY: cardFlipped ? 180 : 0 }}
                                transition={{ duration: 0.45 }}
                                style={{ transformStyle: "preserve-3d", width: "100%", height: "100%", position: "relative" }}
                              >
                                {/* Front */}
                                <div
                                  className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
                                  style={{
                                    backfaceVisibility: "hidden",
                                    background: "linear-gradient(135deg, #0f2027 0%, #203a43 55%, #2c5364 100%)",
                                    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                                  }}
                                >
                                  <div className="flex justify-between items-start">
                                    {/* EMV chip */}
                                    <div className="w-10 h-7 rounded-sm bg-gradient-to-br from-yellow-300 to-yellow-500 grid grid-cols-3 grid-rows-3 gap-px p-1 opacity-90">
                                      {Array.from({ length: 9 }).map((_, i) => (
                                        <div key={i} className="bg-yellow-700/30 rounded-[1px]" />
                                      ))}
                                    </div>
                                    {/* Brand */}
                                    <div className="h-7 flex items-center">
                                      {getCardBrand() === "VISA" && (
                                        <span className="text-white font-black text-xl italic tracking-tighter">VISA</span>
                                      )}
                                      {getCardBrand() === "MASTERCARD" && (
                                        <div className="flex items-center">
                                          <div className="w-7 h-7 rounded-full bg-[#eb001b]" />
                                          <div className="w-7 h-7 rounded-full bg-[#f79e1b] -ml-3.5 mix-blend-multiply" />
                                        </div>
                                      )}
                                      {getCardBrand() === "AMEX" && (
                                        <span className="text-white font-black text-sm tracking-widest">AMEX</span>
                                      )}
                                    </div>
                                  </div>
                                  <p className="font-mono text-white text-[15px] tracking-[0.22em] mt-1">
                                    {cardNumber || "•••• •••• •••• ••••"}
                                  </p>
                                  <div className="flex justify-between items-end">
                                    <div>
                                      <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">Card Holder</p>
                                      <p className="text-white font-bold text-xs tracking-wide uppercase truncate max-w-[160px]">
                                        {cardName || "YOUR NAME"}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">Expires</p>
                                      <p className="text-white font-bold text-xs">{cardExpiry || "MM/YY"}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Back */}
                                <div
                                  className="absolute inset-0 rounded-2xl flex flex-col justify-center"
                                  style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                    background: "linear-gradient(135deg, #0f2027 0%, #203a43 55%, #2c5364 100%)",
                                    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                                  }}
                                >
                                  <div className="h-10 bg-black/60 w-full mb-5" />
                                  <div className="px-5 flex items-center gap-3">
                                    <div className="flex-1 h-8 bg-white/10 rounded" />
                                    <div className="w-14 h-8 bg-white rounded flex items-center justify-center shadow-inner">
                                      <span className="font-mono font-black text-gray-800 text-sm tracking-widest">
                                        {cardCvv || "•••"}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-white/25 text-[9px] text-center mt-4 tracking-widest uppercase">
                                    tap to flip
                                  </p>
                                </div>
                              </motion.div>
                            </div>

                            {/* Fields */}
                            <div className="space-y-1">
                              <Label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Card Number</Label>
                              <div className="relative">
                                <Input
                                  placeholder="1234 5678 9012 3456"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                  className="font-mono text-sm border-2 border-white bg-white focus:border-[#0078d4] h-11 pr-10 shadow-sm"
                                  maxLength={19}
                                />
                                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Cardholder Name</Label>
                              <Input
                                placeholder="JOHN DOE"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                className="font-mono text-sm border-2 border-white bg-white focus:border-[#0078d4] h-11 uppercase shadow-sm"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Expiry</Label>
                                <Input
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                  className="font-mono text-sm border-2 border-white bg-white focus:border-[#0078d4] h-11 shadow-sm"
                                  maxLength={5}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">CVV</Label>
                                <div className="relative">
                                  <Input
                                    type={showCvv ? "text" : "password"}
                                    placeholder="•••"
                                    value={cardCvv}
                                    onChange={(e) => {
                                      setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
                                      setCardFlipped(true);
                                    }}
                                    onFocus={() => setCardFlipped(true)}
                                    onBlur={() => setCardFlipped(false)}
                                    className="font-mono text-sm border-2 border-white bg-white focus:border-[#0078d4] h-11 pr-10 shadow-sm"
                                    maxLength={4}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowCvv((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                                  >
                                    {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Completion hint */}
                            <div className={`flex items-center gap-2 text-xs font-bold transition-colors duration-300 ${cardComplete ? "text-[#00a651]" : "text-gray-400"}`}>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${cardComplete ? "border-[#00a651] bg-[#00a651]" : "border-gray-300"}`}>
                                {cardComplete && <CheckCircle className="h-3 w-3 text-white" strokeWidth={3} />}
                              </div>
                              {cardComplete ? "All details complete — ready to pay" : "Fill all fields above to enable payment"}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* ── Bank ─────────────────────────────────────── */}
                      {isSelected && method.id === "bank" && (
                        <motion.div
                          key="bank-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="border-t border-gray-100 px-5 py-5 space-y-4" style={{ backgroundColor: method.accentBg }}>

                            {/* Account details card */}
                            <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Transfer To</p>
                              <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-xs">
                                <span className="text-gray-400 font-semibold">Bank</span>
                                <span className="font-bold text-gray-900">Commercial Bank PLC</span>
                                <span className="text-gray-400 font-semibold">Account Name</span>
                                <span className="font-bold text-gray-900">Macro-Hard Pvt Ltd</span>
                                <span className="text-gray-400 font-semibold">Account No.</span>
                                <span className="font-mono font-black text-gray-900">8001-1234-5678</span>
                                <span className="text-gray-400 font-semibold">Branch</span>
                                <span className="font-bold text-gray-900">Colombo 03</span>
                                <span className="text-gray-400 font-semibold">Reference</span>
                                <span className="font-mono font-black text-[#e81123]">
                                  {order._id.slice(-8).toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Upload zone */}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={handleSlipUpload}
                            />

                            {!slipFile ? (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-red-200 hover:border-[#e81123] bg-white hover:bg-red-50 transition-all duration-200 py-7 flex flex-col items-center gap-2.5 group rounded-xl"
                              >
                                <div className="w-12 h-12 rounded-xl bg-red-50 group-hover:bg-[#e81123] transition-colors flex items-center justify-center">
                                  <Upload className="h-6 w-6 text-[#e81123] group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                  <p className="font-black text-gray-700 text-sm group-hover:text-[#e81123] transition-colors">
                                    Upload Bank Slip
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG or PDF — max 10MB</p>
                                </div>
                              </button>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative border-2 border-[#00a651] bg-white rounded-xl overflow-hidden shadow-sm"
                              >
                                {slipPreview && slipFile.type.startsWith("image/") ? (
                                  <img src={slipPreview} alt="Transfer slip" className="w-full max-h-48 object-contain" />
                                ) : (
                                  <div className="flex items-center gap-3 p-4">
                                    <FileImage className="h-8 w-8 text-[#00a651]" />
                                    <div>
                                      <p className="font-bold text-gray-900 text-sm">{slipFile.name}</p>
                                      <p className="text-xs text-gray-500">{(slipFile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={removeSlip}
                                  className="absolute top-2 right-2 w-7 h-7 bg-[#e81123] text-white rounded-full flex items-center justify-center hover:bg-[#c70e1a] transition-colors shadow-md"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                                <div className="px-4 py-2.5 bg-[#00a651]/10 border-t border-[#00a651]/20 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-[#00a651]" />
                                  <span className="text-xs font-bold text-[#00a651]">Slip attached — ready to submit</span>
                                </div>
                              </motion.div>
                            )}

                            <div className={`flex items-center gap-2 text-xs font-bold transition-colors duration-300 ${slipFile ? "text-[#00a651]" : "text-gray-400"}`}>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${slipFile ? "border-[#00a651] bg-[#00a651]" : "border-gray-300"}`}>
                                {slipFile && <CheckCircle className="h-3 w-3 text-white" strokeWidth={3} />}
                              </div>
                              {slipFile ? "Slip uploaded — ready to pay" : "Upload your transfer slip to continue"}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* ── COD ──────────────────────────────────────── */}
                      {isSelected && method.id === "cod" && (
                        <motion.div
                          key="cod-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="border-t border-gray-100 px-5 py-4" style={{ backgroundColor: method.accentBg }}>
                            <div className="bg-white border border-green-200 rounded-xl p-4 flex gap-3 shadow-sm">
                              <Package className="h-5 w-5 text-[#00a651] flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <p className="font-black text-sm text-gray-900">Pay on delivery</p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                  Have the exact amount of{" "}
                                  <span className="font-black text-gray-900">${order.totalAmount?.toFixed(2)}</span>{" "}
                                  ready when your order arrives. Our delivery partner will collect payment at the door.
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Security badge */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-[#00a651] flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-700">Secured by Macrohard Pay.</span>{" "}
                  Your payment information is encrypted and never stored on our servers.
                </p>
              </div>
            </div>

            {/* Right — Order summary */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg overflow-hidden sticky top-24">
                <div className="h-1 bg-[#ffb900]" />
                <div className="p-5 space-y-4">
                  <p className="font-black text-gray-900">ORDER SUMMARY</p>

                  <div className="bg-gray-50 px-3 py-2">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Order ID</p>
                    <p className="font-mono text-xs text-gray-700 mt-0.5 truncate">{order._id}</p>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0">
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

                  <div className="border-t-2 border-gray-900 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-gray-900 text-sm uppercase tracking-wide">Total</span>
                      <span className="font-black text-2xl text-[#0078d4]">
                        ${order.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Pay button */}
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
                          disabled={!isPayEnabled}
                          className="w-full h-14 font-black text-sm shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none bg-[#00a651] hover:bg-[#008a44] text-white"
                          size="lg"
                        >
                          {isPayEnabled ? (
                            <>
                              <ShieldCheck className="mr-2 h-5 w-5" />
                              PAY ${order.totalAmount?.toFixed(2)}
                            </>
                          ) : (
                            <>
                              <ChevronRight className="mr-2 h-5 w-5" />
                              {selectedMethod === "card"
                                ? "Complete Card Details"
                                : selectedMethod === "bank"
                                ? "Upload Slip to Continue"
                                : "Place Order"}
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-center text-xs text-gray-400">
                    By placing this order you agree to our Terms of Service.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}