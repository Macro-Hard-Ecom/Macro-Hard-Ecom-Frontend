import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate, Link } from "react-router";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Package,
  Plus,
  Minus,
  Tag,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { createOrder } from "../../services/orderService";

const ACCENT_COLORS = ["#0078d4", "#00a651", "#ffb900", "#e81123"];
const ACCENT_BG    = ["#e8f4fc", "#e8f7ef", "#fff8e1", "#fde8e8"];

export function Cart() {
  const { cart, removeFromCart, clearCart, addToCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const total     = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to place an order");
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      const res = await createOrder(items, token);
      clearCart();
      toast.success("Order created! Proceeding to payment…");
      navigate(`/payment/${res.data._id}`);
    } catch {
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Empty cart ─────────────────────────────────────────────────────────── */
  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="relative mx-auto mb-8 w-28 h-28">
            <div className="absolute inset-0 bg-gray-900 grid grid-cols-2 gap-0.5 p-0.5">
              <div className="bg-[#00a651]" /><div className="bg-[#0078d4]" />
              <div className="bg-[#ffb900]" /><div className="bg-[#e81123]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">CART IS EMPTY</h2>
          <p className="text-gray-500 mb-8 font-medium leading-relaxed">
            Browse the marketplace and find something great.
          </p>
          <Link to="/products">
            <Button className="bg-gray-900 hover:bg-gray-700 text-white font-black px-10 h-14 text-base shadow-xl gap-2">
              BROWSE PRODUCTS <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ── Cart with items ────────────────────────────────────────────────────── */
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">

      {/* Hero banner */}
      <div className="bg-gray-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 grid grid-cols-12 gap-1 p-2">
          {[...Array(48)].map((_, i) => (
            <div key={i} className={`aspect-square ${
              i%4===0?"bg-[#00a651]":i%4===1?"bg-[#0078d4]":i%4===2?"bg-[#ffb900]":"bg-[#e81123]"
            }`} />
          ))}
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex gap-1.5 mb-3">
            <div className="w-2.5 h-2.5 bg-[#00a651]" /><div className="w-2.5 h-2.5 bg-[#0078d4]" />
            <div className="w-2.5 h-2.5 bg-[#ffb900]" /><div className="w-2.5 h-2.5 bg-[#e81123]" />
          </div>
          <h1 className="text-5xl font-black tracking-tight">YOUR CART</h1>
          <p className="text-gray-400 mt-1 font-medium">
            {itemCount} item{itemCount !== 1 ? "s" : ""} ready for checkout
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Link to="/products" className="hover:text-[#0078d4] transition-colors">Products</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-bold">Cart</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-400">Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ── Left: Cart items ──────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-3">
            <AnimatePresence>
              {cart.map((item, index) => {
                const color = ACCENT_COLORS[index % 4];
                const bg    = ACCENT_BG[index % 4];
                return (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="bg-white shadow-md overflow-hidden group"
                  >
                    <div className="h-1" style={{ backgroundColor: color }} />
                    <div className="p-5 flex items-center gap-4">

                      {/* Product icon */}
                      <div className="w-16 h-16 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                        <Package className="h-7 w-7" style={{ color }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 truncate text-base">{item.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5 font-medium">${item.price.toFixed(2)} each</p>

                        {/* Qty controls */}
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            onClick={() => {
                              removeFromCart(item.productId);
                              if (item.quantity > 1) {
                                addToCart({ ...item, quantity: item.quantity - 1 });
                              } else {
                                toast.success("Item removed");
                              }
                            }}
                            className="w-7 h-7 border-2 border-gray-200 flex items-center justify-center hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-black text-gray-900 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => addToCart({ ...item, quantity: 1 })}
                            className="w-7 h-7 border-2 border-gray-200 flex items-center justify-center hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Price + remove */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <p className="font-black text-xl" style={{ color }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => { removeFromCart(item.productId); toast.success("Item removed"); }}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#e81123] transition-colors font-semibold"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <Link
              to="/products"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0078d4] font-semibold transition-colors pt-2 group"
            >
              <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
          </div>

          {/* ── Right: Summary ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 sticky top-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white shadow-xl overflow-hidden"
            >
              {/* Rainbow top bar */}
              <div className="h-2 grid grid-cols-4">
                <div className="bg-[#00a651]" /><div className="bg-[#0078d4]" />
                <div className="bg-[#ffb900]" /><div className="bg-[#e81123]" />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Tag className="h-5 w-5 text-[#0078d4]" />
                  <h2 className="font-black text-gray-900 text-lg uppercase tracking-wide">Order Summary</h2>
                </div>

                {/* Item breakdown */}
                <div className="space-y-2 mb-5">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between items-baseline gap-2 text-sm">
                      <span className="text-gray-600 truncate flex-1 font-medium">{item.name}</span>
                      <span className="text-gray-400 flex-shrink-0 text-xs">×{item.quantity}</span>
                      <span className="font-bold text-gray-900 flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t-2 border-gray-900 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-gray-900 text-sm uppercase tracking-widest">Total</span>
                    <span className="font-black text-3xl text-[#0078d4]">${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* CTA */}
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full h-14 bg-[#00a651] hover:bg-[#008a44] text-white font-black text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                  size="lg"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> CREATING ORDER…</>
                  ) : (
                    <>PLACE ORDER &amp; PAY <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>

                <p className="text-center text-xs text-gray-400 mt-3 leading-relaxed">
                  You'll choose your payment method on the next screen.
                </p>

                {/* Steps indicator */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-gray-900 text-white flex items-center justify-center text-[10px] font-black">1</div>
                      <span className="text-gray-900">Cart</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200 mx-2" />
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-[#0078d4] text-white flex items-center justify-center text-[10px] font-black">2</div>
                      <span className="text-[#0078d4]">Payment</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200 mx-2" />
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] font-black">3</div>
                      <span className="text-gray-400">Done</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}