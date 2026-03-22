import { Link, Outlet } from 'react-router';
import { ShoppingCart, LogIn, LogOut, User, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 grid grid-cols-2 gap-0.5 p-0.5 bg-gray-900 group-hover:rotate-180 transition-transform duration-500">
                  <div className="bg-[#00a651]"></div>
                  <div className="bg-[#0078d4]"></div>
                  <div className="bg-[#ffb900]"></div>
                  <div className="bg-[#e81123]"></div>
                </div>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-gray-900">
                  MACRO<span className="text-[#0078d4]">HARD</span>
                </span>
                <div className="text-[10px] text-gray-500 -mt-1 font-semibold tracking-wider">MARKETPLACE</div>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-1">
              <Link to="/products" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium">
                Products
              </Link>
              <Link to="/sell" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium">
                {isAuthenticated ? 'Dashboard' : 'Sell'}
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-2">
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="hover:bg-yellow-50 hover:text-[#ffb900]">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" className="hover:bg-green-50 hover:text-[#00a651]">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/sell">
                    <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-[#0078d4] font-semibold text-gray-600 gap-1.5">
                      <LayoutDashboard className="h-4 w-4" />
                      {user?.email?.split('@')[0]}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-2 border-gray-300 hover:border-[#e81123] hover:text-[#e81123] font-bold transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-1.5" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" className="hover:bg-green-50 hover:text-[#00a651]">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button className="bg-[#e81123] hover:bg-[#c70e1a] text-white shadow-md hover:shadow-lg transition-all duration-300 font-bold">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              <Link to="/products" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                Products
              </Link>
              <Link to="/sell" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                {isAuthenticated ? 'Dashboard' : 'Sell'}
              </Link>
              <Link to="/cart" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                Cart
              </Link>
              <Link to="/profile" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-[#e81123] hover:bg-red-50 rounded-lg font-medium"
                >
                  Sign Out ({user?.email?.split('@')[0]})
                </button>
              ) : (
                <Link to="/login" className="block px-4 py-3 bg-[#e81123] text-white rounded-lg text-center font-medium shadow-md" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 grid grid-cols-2 gap-0.5 p-0.5 bg-white">
                  <div className="bg-[#00a651]"></div>
                  <div className="bg-[#0078d4]"></div>
                  <div className="bg-[#ffb900]"></div>
                  <div className="bg-[#e81123]"></div>
                </div>
                <span className="text-2xl font-black text-white">MACRO<span className="text-[#0078d4]">HARD</span></span>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                The hardest working marketplace on the internet. Buy and sell with confidence, powered by technology that actually works.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/products" className="text-gray-400 hover:text-blue-400 transition-colors">Browse Products</Link></li>
                <li><Link to="/sell" className="text-gray-400 hover:text-blue-400 transition-colors">Seller Dashboard</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-blue-400 transition-colors">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <p className="text-gray-400 text-sm mb-2">Email: support@macrohard.com</p>
              <p className="text-gray-400 text-sm">Available 24/7</p>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © 2026 Macrohard Marketplace. No relation to Microsoft. We promise. 😉
            </div>
            <div className="flex gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
