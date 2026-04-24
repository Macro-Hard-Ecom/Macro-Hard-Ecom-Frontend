import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AuthProvider } from './lib/auth';
  import { CartProvider } from "./context/CartContext";
function App() {
  return (
  

<AuthProvider>
  <CartProvider>
    <Toaster richColors position="top-right" />
    <RouterProvider router={router} />
  </CartProvider>
</AuthProvider>
  );
}

export default App;