import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to Macrohard.');
      navigate('/sell');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 grid grid-cols-2 gap-0.5 p-0.5 mx-auto mb-5 shadow-xl">
            <div className="bg-[#00a651]"></div>
            <div className="bg-[#0078d4]"></div>
            <div className="bg-[#ffb900]"></div>
            <div className="bg-[#e81123]"></div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">CREATE ACCOUNT</h1>
          <p className="text-gray-600">Join the Macrohard marketplace — buy and sell anything</p>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 grid grid-cols-4">
            <div className="bg-[#00a651]"></div>
            <div className="bg-[#0078d4]"></div>
            <div className="bg-[#ffb900]"></div>
            <div className="bg-[#e81123]"></div>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-black text-gray-900">Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                  Full Name / Business Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Silva or Silva Electronics"
                  className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                  Confirm Password
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gray-900 hover:bg-gray-700 text-white font-black text-base mt-2"
                size="lg"
              >
                {loading ? 'CREATING ACCOUNT...' : (
                  <>
                    CREATE ACCOUNT
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-[#0078d4] hover:underline font-bold">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing up, you agree to our Terms of Service. Your account connects to the User Service to manage authentication.
        </p>
      </div>
    </div>
  );
}
