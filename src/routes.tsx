import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'login', Component: Login },
      { path: 'profile', Component: Profile },
      { path: 'products', Component: () => <div className="p-8 text-center text-gray-500">Products page coming soon</div> },
      { path: 'products/:id', Component: () => <div className="p-8 text-center text-gray-500">Product detail coming soon</div> },
      { path: 'sell', Component: () => <div className="p-8 text-center text-gray-500">Sell page coming soon</div> },
      { path: 'cart', Component: () => <div className="p-8 text-center text-gray-500">Cart coming soon</div> },
      { path: 'register', Component: () => <div className="p-8 text-center text-gray-500">Register coming soon</div> },
      { path: '*', Component: () => <div className="p-8 text-center text-gray-500">Page not found</div> },
    ],
  },
]);