import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AuthProvider } from './lib/auth';

function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;