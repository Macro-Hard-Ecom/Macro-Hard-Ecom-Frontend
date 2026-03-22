import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Sell } from './pages/Sell';
import { Register } from './pages/Register';
import { Cart } from './pages/orderservice/Cart';
import { Orders } from './pages/orderservice/Orders'; 
import { OrderDetails } from './pages/orderservice/OrderDetails'; 

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      { path: 'profile', Component: Profile },
      { path: 'products', Component: Products },
      { path: 'products/:id', Component: ProductDetail },
      { path: 'sell', Component: Sell },
      { path: 'cart', Component: () => <div className="p-8 text-center text-gray-500">Cart coming soon</div> },
      { path: '*', Component: () => <div className="p-8 text-center text-gray-500">Page not found</div> },
      { path: 'cart', Component: Cart },
      { path: 'orders', Component: Orders },
      { path: 'orders/:id', Component: OrderDetails },
      { path: '*', Component: () => <div className="p-8 text-center text-gray-500">Page not found</div> },

    ],
  },
]);
