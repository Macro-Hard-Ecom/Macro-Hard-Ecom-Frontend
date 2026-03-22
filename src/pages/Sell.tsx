import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Pencil, Trash2, Package, X, Check, AlertTriangle, LayoutDashboard, ShoppingBag, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { productService, type Product, type ProductInput, CATEGORIES } from '../lib/api';
import { useAuth } from '../lib/auth';
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProductStats {
  orderCount: number;
  totalRevenue: number;
  orderServiceAvailable: boolean;
}

// ── Product Form Modal ────────────────────────────────────────────────────────
interface ProductFormProps {
  initial?: Partial<ProductInput>;
  onSubmit: (data: ProductInput) => Promise<void>;
  onClose: () => void;
  mode: 'add' | 'edit';
}

function ProductForm({ initial, onSubmit, onClose, mode }: ProductFormProps) {
  const [form, setForm] = useState<ProductInput>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? 0,
    category: initial?.category ?? 'Electronics',
    imageUrl: initial?.imageUrl ?? '',
    stock: initial?.stock ?? 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof ProductInput, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-900 text-white p-6 flex items-center justify-between">
          <div>
            <div className="inline-flex gap-1.5 mb-2">
              <div className="w-2.5 h-2.5 bg-[#00a651]"></div>
              <div className="w-2.5 h-2.5 bg-[#0078d4]"></div>
              <div className="w-2.5 h-2.5 bg-[#ffb900]"></div>
              <div className="w-2.5 h-2.5 bg-[#e81123]"></div>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {mode === 'add' ? 'ADD NEW LISTING' : 'EDIT LISTING'}
            </h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <Label htmlFor="name" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
              Title *
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. iPhone 14 Pro, Toyota Prius, Web Design Service"
              className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
              Description *
            </Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe your listing, condition, features..."
              rows={3}
              className="mt-1.5 w-full border-2 border-gray-200 focus:border-[#0078d4] px-3 py-2.5 text-sm outline-none resize-none focus:outline-none focus:ring-0 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                Price ($) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11"
                required
              />
            </div>
            <div>
              <Label htmlFor="stock" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                Quantity
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set('stock', parseInt(e.target.value) || 0)}
                className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11"
              />
            </div>
          </div>

          <div>
            <Label className="font-bold text-gray-700 text-xs uppercase tracking-wider">
              Category *
            </Label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className="py-2 px-1 text-xs font-bold transition-all border-2 leading-tight"
                  style={
                    form.category === cat
                      ? { backgroundColor: CATEGORY_COLORS[cat] ?? '#0078d4', color: '#fff', borderColor: CATEGORY_COLORS[cat] ?? '#0078d4' }
                      : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
              Image URL (optional)
            </Label>
            <Input
              id="imageUrl"
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 h-12 font-black text-white bg-gray-900 hover:bg-gray-700 transition-colors"
            >
              {submitting ? 'SAVING...' : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {mode === 'add' ? 'POST LISTING' : 'SAVE CHANGES'}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 font-bold border-2">
              CANCEL
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
function ConfirmDeleteModal({ productName, onConfirm, onClose }: { productName: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full max-w-sm shadow-2xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#e81123] w-16 h-16 flex items-center justify-center mx-auto mb-5 shadow-lg">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">DELETE LISTING?</h3>
        <p className="text-gray-600 mb-6 text-sm">
          <strong className="text-gray-900">"{productName}"</strong> will be permanently removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button onClick={onConfirm} className="flex-1 bg-[#e81123] hover:bg-[#c70e1a] text-white font-black h-12">
            DELETE
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 border-2 font-bold h-12">
            CANCEL
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export function Sell() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, ProductStats>>({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMyProducts();
  }, [isAuthenticated]);

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ createdBy: user?.id });
      const prods = res.data.data;
      setProducts(prods);
      // Fetch order stats for all products in parallel — non-blocking
      fetchAllStats(prods);
    } catch {
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  // Calls GET /api/products/:id/stats for each product in parallel.
  // Product Service handles the Order Service call internally.
  // Uses Promise.allSettled so one failure doesn't block the rest.
  const fetchAllStats = async (prods: Product[]) => {
    if (prods.length === 0) return;
    const results = await Promise.allSettled(
      prods.map((p) => productService.getStats(p._id))
    );
    const map: Record<string, ProductStats> = {};
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const { orderStats } = result.value.data.data;
        map[prods[i]._id] = orderStats;
      } else {
        // Order Service unavailable for this product — show zeros
        map[prods[i]._id] = { orderCount: 0, totalRevenue: 0, orderServiceAvailable: false };
      }
    });
    setStatsMap(map);
  };

  const handleAdd = async (data: ProductInput) => {
    try {
      await productService.create(data);
      toast.success('Listing posted successfully!');
      setShowAddForm(false);
      fetchMyProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add listing';
      toast.error(msg);
    }
  };

  const handleEdit = async (data: ProductInput) => {
    if (!editingProduct) return;
    try {
      await productService.update(editingProduct._id, data);
      toast.success('Listing updated!');
      setEditingProduct(null);
      fetchMyProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update listing';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await productService.delete(deletingProduct._id);
      toast.success('Listing deleted');
      setDeletingProduct(null);
      fetchMyProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete listing';
      toast.error(msg);
    }
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gray-900 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-3 h-3 bg-[#00a651]"></div>
              <div className="w-3 h-3 bg-[#0078d4]"></div>
              <div className="w-3 h-3 bg-[#ffb900]"></div>
              <div className="w-3 h-3 bg-[#e81123]"></div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">SELLER DASHBOARD</h1>
          <p className="text-gray-600 mb-8 text-lg">Sign in to manage your listings — electronics, vehicles, services, and more.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto bg-[#e81123] hover:bg-[#c70e1a] text-white font-black px-8 h-12">
                SIGN IN
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-black px-8 h-12">
                CREATE ACCOUNT
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Aggregate stats across all products ───────────────────────────────────
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const available = products.filter((p) => p.isAvailable).length;
  const totalOrders = Object.values(statsMap).reduce((sum, s) => sum + s.orderCount, 0);
  const totalRevenue = Object.values(statsMap).reduce((sum, s) => sum + s.totalRevenue, 0);

  return (
    <div>
      {/* Dashboard Header */}
      <section className="bg-gray-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 grid grid-cols-8 gap-2 p-4">
            {[...Array(64)].map((_, i) => (
              <div key={i} className={`aspect-square ${i % 4 === 0 ? 'bg-[#00a651]' : i % 4 === 1 ? 'bg-[#0078d4]' : i % 4 === 2 ? 'bg-[#ffb900]' : 'bg-[#e81123]'}`} />
            ))}
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex gap-2 mb-3">
                <div className="w-3 h-3 bg-[#00a651]"></div>
                <div className="w-3 h-3 bg-[#0078d4]"></div>
                <div className="w-3 h-3 bg-[#ffb900]"></div>
                <div className="w-3 h-3 bg-[#e81123]"></div>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <LayoutDashboard className="h-6 w-6 text-gray-400" />
                <h1 className="text-4xl font-black tracking-tight">SELLER DASHBOARD</h1>
              </div>
              <p className="text-gray-400 font-medium">
                Managing listings for <span className="text-white font-bold">{user?.email}</span>
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowAddForm(true)}
              className="bg-[#00a651] hover:bg-[#008a44] text-white font-black px-8 h-12 shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              POST LISTING
            </Button>
          </div>

          {/* Stats row — product counts + order stats from Order Service */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/5 border border-white/10 p-5">
              <div className="text-3xl font-black text-white">{products.length}</div>
              <div className="text-xs text-gray-400 font-semibold mt-1">TOTAL LISTINGS</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-5">
              <div className="text-3xl font-black text-[#00a651]">{available}</div>
              <div className="text-xs text-gray-400 font-semibold mt-1">AVAILABLE</div>
            </div>
            {/* Live from Order Service */}
            <div className="bg-white/5 border border-white/10 p-5">
              <div className="text-3xl font-black text-[#ffb900]">{totalOrders}</div>
              <div className="text-xs text-gray-400 font-semibold mt-1">TOTAL ORDERS</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-5">
              <div className="text-3xl font-black text-[#00a651]">${totalRevenue.toFixed(2)}</div>
              <div className="text-xs text-gray-400 font-semibold mt-1">TOTAL REVENUE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product List */}
      <section className="py-10 bg-gray-50 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="bg-[#0078d4] w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">NO LISTINGS YET</h2>
              <p className="text-gray-500 font-medium mb-8">Post your first listing to start selling on Macrohard.</p>
              <Button
                size="lg"
                onClick={() => setShowAddForm(true)}
                className="bg-[#00a651] hover:bg-[#008a44] text-white font-black px-8 h-12"
              >
                <Plus className="mr-2 h-5 w-5" />
                POST YOUR FIRST LISTING
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500 font-semibold">{products.length} LISTING{products.length !== 1 ? 'S' : ''}</p>
                <Link to="/products" className="text-sm text-[#0078d4] font-bold hover:underline">
                  View on Marketplace →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => {
                  const accentColor = CATEGORY_COLORS[product.category] ?? '#0078d4';
                  const stats = statsMap[product._id];
                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                    >
                      <Card className="border-0 shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow">
                        <div className="h-1.5" style={{ backgroundColor: accentColor }} />
                        <div className="relative">
                          <img
                            src={product.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                            alt={product.name}
                            className="w-full h-44 object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'; }}
                          />
                          <div className="absolute top-3 left-3">
                            <span className="text-white text-xs font-black px-2 py-1" style={{ backgroundColor: accentColor }}>
                              {product.category.toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            {product.isAvailable ? (
                              <Badge className="bg-[#00a651] text-white font-bold text-xs px-2">LIVE</Badge>
                            ) : (
                              <Badge variant="secondary" className="font-bold text-xs px-2">OFFLINE</Badge>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-black text-gray-900 mb-1 text-base leading-tight">{product.name}</h3>
                          <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>

                          <div className="flex items-center justify-between mb-3">
                            <p className="font-black text-xl" style={{ color: accentColor }}>${product.price.toFixed(2)}</p>
                            <span className="text-gray-400 text-xs font-semibold">{product.stock} in stock</span>
                          </div>

                          {/* Order stats from Order Service */}
                          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-1.5">
                              <ShoppingBag className="h-3.5 w-3.5 text-[#0078d4]" />
                              <div>
                                <div className="text-sm font-black text-gray-900">
                                  {stats ? stats.orderCount : <span className="text-gray-300 animate-pulse">—</span>}
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold uppercase">Orders</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="h-3.5 w-3.5 text-[#00a651]" />
                              <div>
                                <div className="text-sm font-black text-gray-900">
                                  {stats ? `$${stats.totalRevenue.toFixed(2)}` : <span className="text-gray-300 animate-pulse">—</span>}
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold uppercase">Revenue</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-2 border-[#0078d4] text-[#0078d4] hover:bg-[#0078d4] hover:text-white font-bold transition-all h-9"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Pencil className="mr-1.5 h-3.5 w-3.5" />
                              EDIT
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-2 border-[#e81123] text-[#e81123] hover:bg-[#e81123] hover:text-white font-bold transition-all h-9"
                              onClick={() => setDeletingProduct(product)}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              DELETE
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showAddForm && (
          <ProductForm mode="add" onSubmit={handleAdd} onClose={() => setShowAddForm(false)} />
        )}
        {editingProduct && (
          <ProductForm
            mode="edit"
            initial={editingProduct}
            onSubmit={handleEdit}
            onClose={() => setEditingProduct(null)}
          />
        )}
        {deletingProduct && (
          <ConfirmDeleteModal
            productName={deletingProduct.name}
            onConfirm={handleDelete}
            onClose={() => setDeletingProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
