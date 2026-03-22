import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'sonner';
import { Login } from './pages/Login';
import { Home } from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;