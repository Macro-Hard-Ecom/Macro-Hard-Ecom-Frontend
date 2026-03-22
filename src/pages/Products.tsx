import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Filter, Package, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { motion } from 'motion/react';
import { productService, type Product, CATEGORIES } from '../lib/api';
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

// Fallback images per category
const CATEGORY_IMAGES: Record<string, string> = {
  Electronics: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400',
  Vehicles: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400',
  Property: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
  Furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
  Fashion: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
  Services: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400',
  'Food & Beverages': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  'Sports & Leisure': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
  Other: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
};

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, availableOnly]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedCategory) params.category = selectedCategory;
      if (availableOnly) params.available = 'true';
      const res = await productService.getAll(params);
      setProducts(res.data.data);
    } catch {
      toast.error('Failed to load products. Is the Product Service running?');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    search === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header banner */}
      <section className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 grid grid-cols-8 gap-2 p-4">
            {[...Array(64)].map((_, i) => (
              <div key={i} className={`aspect-square ${i % 4 === 0 ? 'bg-[#00a651]' : i % 4 === 1 ? 'bg-[#0078d4]' : i % 4 === 2 ? 'bg-[#ffb900]' : 'bg-[#e81123]'}`} />
            ))}
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex gap-2 mb-4">
            <div className="w-3 h-3 bg-[#00a651]"></div>
            <div className="w-3 h-3 bg-[#0078d4]"></div>
            <div className="w-3 h-3 bg-[#ffb900]"></div>
            <div className="w-3 h-3 bg-[#e81123]"></div>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-3">
            MARKETPLACE
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            {products.length} listings across all categories
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-2 border-gray-200 focus:border-[#0078d4] h-11"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 text-sm font-bold transition-all ${selectedCategory === '' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                ALL
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                  className="px-4 py-2 text-sm font-bold transition-all"
                  style={
                    selectedCategory === cat
                      ? { backgroundColor: CATEGORY_COLORS[cat], color: '#fff' }
                      : { backgroundColor: '#f3f4f6', color: '#374151' }
                  }
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Available toggle */}
            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-2 transition-all ${availableOnly ? 'border-[#00a651] bg-[#00a651] text-white' : 'border-gray-300 text-gray-600 hover:border-[#00a651]'}`}
            >
              <Filter className="h-4 w-4" />
              AVAILABLE ONLY
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12 bg-gray-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white shadow-lg overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="bg-[#0078d4] w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">NO ITEMS FOUND</h2>
              <p className="text-gray-500 font-medium mb-8">
                {search || selectedCategory ? 'Try adjusting your filters.' : 'No listings yet. Be the first to post one!'}
              </p>
              {(search || selectedCategory) && (
                <Button onClick={() => { setSearch(''); setSelectedCategory(''); setAvailableOnly(false); }} className="bg-[#0078d4] hover:bg-[#006cc1] text-white font-bold">
                  CLEAR FILTERS
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 font-semibold mb-6">{filtered.length} ITEM{filtered.length !== 1 ? 'S' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map((product, index) => {
                  const accentColor = CATEGORY_COLORS[product.category] || '#0078d4';
                  const fallbackImg = CATEGORY_IMAGES[product.category] || CATEGORY_IMAGES.Other;
                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                    >
                      <Link to={`/products/${product._id}`}>
                        <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 overflow-hidden bg-white">
                          <div className="h-1" style={{ backgroundColor: accentColor }} />
                          <div className="relative overflow-hidden bg-gray-100">
                            <img
                              src={product.imageUrl || fallbackImg}
                              alt={product.name}
                              className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                            />
                            {!product.isAvailable && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white font-black text-lg">SOLD OUT</span>
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <span className="text-white text-xs font-black px-2 py-1" style={{ backgroundColor: accentColor }}>
                                {product.category.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0078d4] transition-colors min-h-[2.5rem] text-sm leading-tight">
                              {product.name}
                            </h3>
                            <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <p className="font-black text-2xl" style={{ color: accentColor }}>
                                ${product.price.toFixed(2)}
                              </p>
                              {product.stock > 0 && (
                                <span className="text-xs text-gray-400 font-semibold">{product.stock} left</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA for sellers */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex gap-2 mb-6">
            <div className="w-3 h-3 bg-[#00a651]"></div>
            <div className="w-3 h-3 bg-[#0078d4]"></div>
            <div className="w-3 h-3 bg-[#ffb900]"></div>
            <div className="w-3 h-3 bg-[#e81123]"></div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">HAVE SOMETHING TO SELL?</h2>
          <p className="text-gray-600 mb-8 text-lg">Post your listing on Macrohard — electronics, vehicles, services, and more.</p>
          <Link to="/sell">
            <Button size="lg" className="bg-[#00a651] hover:bg-[#008a44] text-white font-black px-8 h-14 text-lg shadow-lg">
              POST A LISTING
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
