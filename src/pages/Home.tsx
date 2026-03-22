import { Link } from 'react-router';
import { ArrowRight, Package, Shield, Zap, TrendingUp, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { mockProducts } from '../data/mockProducts';
import { motion } from 'motion/react';

export function Home() {
  const featuredProducts = mockProducts.slice(0, 4);

  return (
    <div>
      {/* Hero Section with Microsoft-inspired grid */}
      <section className="relative bg-white overflow-hidden">
        {/* Animated four-square grid background */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute inset-0 grid grid-cols-12 gap-4 p-8 rotate-12 scale-150">
            {[...Array(48)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square ${
                  i % 4 === 0 ? 'bg-[#00a651]' :
                  i % 4 === 1 ? 'bg-[#0078d4]' :
                  i % 4 === 2 ? 'bg-[#ffb900]' :
                  'bg-[#e81123]'
                }`}
              ></div>
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Four-square accent */}
            <div className="inline-flex gap-2 mb-8">
              <div className="w-3 h-3 bg-[#00a651]"></div>
              <div className="w-3 h-3 bg-[#0078d4]"></div>
              <div className="w-3 h-3 bg-[#ffb900]"></div>
              <div className="w-3 h-3 bg-[#e81123]"></div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
              <span className="text-gray-900">MACRO</span>
              <span className="text-[#0078d4]">HARD</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-4 text-gray-700 max-w-3xl mx-auto font-semibold">
              It's not <span className="line-through text-gray-400">Micro</span><span className="text-[#0078d4] font-black">HARD</span> work.
            </p>
            
            <p className="text-lg md:text-xl mb-10 text-gray-600 max-w-2xl mx-auto">
              The marketplace with windows of opportunity. Buy, sell, and maximize your potential.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto bg-[#00a651] hover:bg-[#008a44] text-white font-bold px-8 h-14 text-lg shadow-lg hover:shadow-xl transition-all">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold px-8 h-14 text-lg transition-all"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Stats with four colors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white p-6 border-l-4 border-[#00a651] shadow-lg">
                <div className="text-3xl font-black text-gray-900">{mockProducts.length}+</div>
                <div className="text-sm text-gray-600 font-semibold">PRODUCTS</div>
              </div>
              <div className="bg-white p-6 border-l-4 border-[#0078d4] shadow-lg">
                <div className="text-3xl font-black text-gray-900">100%</div>
                <div className="text-sm text-gray-600 font-semibold">RELIABLE</div>
              </div>
              <div className="bg-white p-6 border-l-4 border-[#ffb900] shadow-lg">
                <div className="text-3xl font-black text-gray-900">24/7</div>
                <div className="text-sm text-gray-600 font-semibold">SUPPORT</div>
              </div>
              <div className="bg-white p-6 border-l-4 border-[#e81123] shadow-lg">
                <div className="text-3xl font-black text-gray-900">∞</div>
                <div className="text-sm text-gray-600 font-semibold">POTENTIAL</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with four-color theme */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 tracking-tight">
              Why MACROHARD?
            </h2>
            <p className="text-gray-600 text-lg font-medium">
              Because soft just doesn't cut it anymore.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'MAXIMUM SPEED',
                description: 'Lightning fast performance. No lag, no waiting. Just pure, unadulterated speed. Your time is valuable.',
                color: '#ffb900',
                bgColor: 'bg-[#ffb900]'
              },
              {
                icon: Shield,
                title: 'ULTRA SECURE',
                description: 'Military-grade protection. Your data is locked down tighter than Fort Knox. Shop and sell with absolute confidence.',
                color: '#0078d4',
                bgColor: 'bg-[#0078d4]'
              },
              {
                icon: TrendingUp,
                title: 'MEGA GROWTH',
                description: 'Scale without limits. From your first sale to your millionth, we grow with you. No ceilings, only floors.',
                color: '#00a651',
                bgColor: 'bg-[#00a651]'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden group">
                  <div className={`h-2 ${feature.bgColor}`}></div>
                  <CardContent className="pt-8 pb-8 px-6">
                    <div className={`${feature.bgColor} w-16 h-16 flex items-center justify-center mb-6 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-gray-900 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">FEATURED</h2>
              <p className="text-gray-600 font-medium">Premium selections from our marketplace</p>
            </div>
            <Link to="/products">
              <Button variant="outline" size="lg" className="group border-2 border-[#ffb900] text-[#ffb900] hover:bg-[#ffb900] hover:text-gray-900 font-bold">
                VIEW ALL
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => {
              const colors = ['#00a651', '#0078d4', '#ffb900', '#e81123'];
              const accentColor = colors[index % 4];
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link to={`/products/${product.id}`}>
                    <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 overflow-hidden bg-white">
                      <div className="h-1" style={{ backgroundColor: accentColor }}></div>
                      <div className="relative overflow-hidden bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.price === 0 && (
                          <div className="absolute top-3 right-3 bg-[#00a651] text-white px-3 py-1 font-black text-xs shadow-lg">
                            FREE
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0078d4] transition-colors min-h-[3rem]">
                          {product.name}
                        </h3>
                        <p className="font-black text-2xl mb-2" style={{ color: accentColor }}>
                          ${product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Users className="h-3.5 w-3.5 mr-1.5" />
                          {product.sellerName}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials with four-color accents */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">TRUSTED WORLDWIDE</h2>
            <p className="text-gray-600 text-lg font-medium">What our power users are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Bill Doors', role: 'Software Mogul', quote: 'Finally, a marketplace that just WORKS. No bugs, no crashes, pure POWER.', color: '#0078d4' },
              { name: 'Steve Occupations', role: 'Hardware Visionary', quote: 'The interface is so intuitive, I was selling within SECONDS. This is the future.', color: '#00a651' },
              { name: 'Satya Radella', role: 'Cloud Pioneer', quote: 'Macrohard takes e-commerce to the NEXT LEVEL. It\'s reliable, fast, and HARD.', color: '#e81123' }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg h-full bg-white overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: testimonial.color }}></div>
                  <CardContent className="pt-6 pb-6 px-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" style={{ color: testimonial.color }} viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed font-medium">"{testimonial.quote}"</p>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 font-medium">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with four-square grid */}
      <section className="relative bg-gray-900 text-white py-24 overflow-hidden">
        {/* Four-square pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 grid grid-cols-8 gap-2 p-4">
            {[...Array(64)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square ${
                  i % 4 === 0 ? 'bg-[#00a651]' :
                  i % 4 === 1 ? 'bg-[#0078d4]' :
                  i % 4 === 2 ? 'bg-[#ffb900]' :
                  'bg-[#e81123]'
                }`}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex gap-3 mb-8">
              <div className="w-6 h-6 bg-[#00a651]"></div>
              <div className="w-6 h-6 bg-[#0078d4]"></div>
              <div className="w-6 h-6 bg-[#ffb900]"></div>
              <div className="w-6 h-6 bg-[#e81123]"></div>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">READY TO GO HARD?</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
              Join the marketplace that doesn't do things halfway. It's time to upgrade from soft to HARD.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-[#e81123] hover:bg-[#c70e1a] text-white font-black px-8 h-14 text-lg shadow-xl">
                  START NOW
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-gray-900 font-black px-8 h-14 text-lg">
                  EXPLORE
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}