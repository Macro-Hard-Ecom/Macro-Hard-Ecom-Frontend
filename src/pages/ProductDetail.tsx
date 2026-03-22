import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Package, TrendingUp, ShoppingCart, BarChart2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'motion/react';
import { productService, type Product } from '../lib/api';
import { toast } from 'sonner';

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: '#0078d4',
  Vehicles: '#e81123',
  Property: '#00a651',
  Furniture: '#ffb900',
  Fashion: '#e81123',
  Services: '#0078d4',
  'Food & Beverages': '#00a651',
  'Sports & Leisure': '#ffb900',
  Other: '#0078d4',
};

const CATEGORY_IMAGES: Record<string, string> = {
  Electronics: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
  Vehicles: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
  Property: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
  Furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  Fashion: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
  Services: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
  'Food & Beverages': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  'Sports & Leisure': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
  Other: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
};

interface OrderStats {
  orderCount: number;
  totalRevenue: number;
  orderServiceAvailable: boolean;
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    try {
      // Try to get stats (includes product + order data)
      const res = await productService.getStats(productId);
      setProduct(res.data.data.product);
      setOrderStats(res.data.data.orderStats);
    } catch {
      // Fallback to just product data
      try {
        const res = await productService.getById(productId);
        setProduct(res.data.data);
      } catch {
        toast.error('Product not found');
        setProduct(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="h-96 bg-gray-200" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-[#e81123] w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">PRODUCT NOT FOUND</h2>
          <Link to="/products">
            <Button className="bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold">
              <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO MENU
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const accentColor = CATEGORY_COLORS[product.category] || '#0078d4';
  const fallbackImg = CATEGORY_IMAGES[product.category] || CATEGORY_IMAGES.Other;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/products" className="inline-flex items-center text-gray-500 hover:text-[#0078d4] font-semibold transition-colors text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative overflow-hidden shadow-2xl">
              <div className="h-2" style={{ backgroundColor: accentColor }} />
              <img
                src={product.imageUrl || fallbackImg}
                alt={product.name}
                className="w-full h-[400px] object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
              />
              {!product.isAvailable && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-black text-2xl border-4 border-white px-6 py-2">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-between"
          >
            <div>
              {/* Category badge */}
              <span className="inline-block text-white text-xs font-black px-3 py-1.5 mb-4 shadow-lg" style={{ backgroundColor: accentColor }}>
                {product.category.toUpperCase()}
              </span>

              <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
                {product.name}
              </h1>

              <p className="text-5xl font-black mb-6" style={{ color: accentColor }}>
                ${product.price.toFixed(2)}
              </p>

              <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                {product.description}
              </p>

              {/* Meta info */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2" style={{ backgroundColor: accentColor }}></div>
                  <span className="text-gray-600 text-sm">
                    <span className="font-bold">Stock:</span> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2" style={{ backgroundColor: accentColor }}></div>
                  <span className="text-gray-600 text-sm">
                    <span className="font-bold">Status:</span>{' '}
                    {product.isAvailable ? (
                      <span className="text-[#00a651] font-bold">Available</span>
                    ) : (
                      <span className="text-[#e81123] font-bold">Unavailable</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2" style={{ backgroundColor: accentColor }}></div>
                  <span className="text-gray-600 text-sm">
                    <span className="font-bold">Listed:</span> {new Date(product.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full h-14 text-lg font-black text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: accentColor }}
                disabled={!product.isAvailable}
                onClick={() => toast.success('Added to cart! (Order Service integration coming soon)')}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.isAvailable ? 'ADD TO CART' : 'SOLD OUT'}
              </Button>
              <Link to="/products">
                <Button variant="outline" size="lg" className="w-full h-14 font-bold border-2 border-gray-300 hover:border-gray-900">
                  CONTINUE BROWSING
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Order Stats — from Order Service integration */}
        {orderStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-4 h-4" style={{ backgroundColor: accentColor }}></div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">ORDER STATISTICS</h2>
              {!orderStats.orderServiceAvailable && (
                <Badge variant="secondary" className="text-xs">Order Service Offline</Badge>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-1 bg-[#0078d4]" />
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#0078d4] w-14 h-14 flex items-center justify-center shadow-lg">
                      <BarChart2 className="h-7 w-7 text-white" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-gray-900">{orderStats.orderCount}</p>
                      <p className="text-gray-500 font-semibold text-sm">TOTAL ORDERS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-1 bg-[#00a651]" />
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#00a651] w-14 h-14 flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-7 w-7 text-white" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-gray-900">${orderStats.totalRevenue.toFixed(2)}</p>
                      <p className="text-gray-500 font-semibold text-sm">TOTAL REVENUE</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
