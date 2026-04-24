import { useEffect, useState } from 'react';
import { User, Mail, Package, ShoppingBag, ShieldCheck, Lock, Pencil, X, Check, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../lib/auth';
import { userService, type UserProfile } from '../lib/api';
import { toast } from 'sonner';

const ROLE_LABELS: Record<string, string> = {
  USER: 'Member',
  ADMIN: 'Administrator',
  SELLER: 'Seller',
};

function displayRole(role: string) {
  return ROLE_LABELS[role.toUpperCase()] || role;
}

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit personal info state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    userService.getProfile(user.id)
      .then((res) => {
        setProfile(res.data);
        setEditName(res.data.name);
        setEditEmail(res.data.email);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    if (!editName.trim() || !editEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      await userService.updateProfile(profile.id, { name: editName.trim(), email: editEmail.trim() });
      setProfile((prev) => prev ? { ...prev, name: editName.trim(), email: editEmail.trim() } : prev);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditName(profile.name);
      setEditEmail(profile.email);
    }
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (!profile) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await userService.changePassword(profile.id, { currentPassword, newPassword, confirmPassword });
      toast.success(res.data.message);
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to change password';
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500">Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500">Could not load profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* ── Stats Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-110">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Welcome back</p>
              <p className="font-bold text-gray-900 text-lg">{profile.name}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-110">
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Orders</p>
              <p className="font-bold text-gray-900 text-lg">{profile.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-110">
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Listed Products</p>
              <p className="font-bold text-gray-900 text-lg">{profile.totalListings}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Account Information ────────────────────────────────────── */}
      <Card className="mb-6 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Account Information</CardTitle>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="transition-colors duration-200 hover:bg-blue-50 hover:text-[#0078d4]">
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div>
                <Label htmlFor="editName" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                  Full Name
                </Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11 transition-colors duration-200"
                />
              </div>
              <div>
                <Label htmlFor="editEmail" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11 transition-colors duration-200"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveProfile} disabled={saving} className="bg-[#0078d4] hover:bg-[#006abc] text-white transition-all duration-200 hover:shadow-md">
                  <Check className="h-4 w-4 mr-1" /> {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={saving} className="transition-colors duration-200">
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-50">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold text-gray-900">{profile.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-50">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-semibold text-gray-900">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-50">
                <ShieldCheck className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <Badge variant="secondary" className="capitalize">{displayRole(profile.role)}</Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Change Password ────────────────────────────────────────── */}
      <Card className="mb-6 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Security</CardTitle>
          {!showPasswordForm && (
            <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(true)} className="transition-colors duration-200 hover:bg-red-50 hover:text-[#e81123]">
              <Lock className="h-4 w-4 mr-1" /> Change Password
            </Button>
          )}
        </CardHeader>
        {showPasswordForm && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11 transition-colors duration-200"
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11 transition-colors duration-200"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="mt-1.5 border-2 border-gray-200 focus:border-[#0078d4] h-11 transition-colors duration-200"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleChangePassword} disabled={changingPassword} className="bg-[#e81123] hover:bg-[#c70e1a] text-white transition-all duration-200 hover:shadow-md">
                <Lock className="h-4 w-4 mr-1" /> {changingPassword ? 'Changing…' : 'Change Password'}
              </Button>
              <Button variant="outline" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} disabled={changingPassword} className="transition-colors duration-200">
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ── Recent Payments / Activity ─────────────────────────────── */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.recentPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No recent payments</p>
              <p className="text-sm mt-2">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-sm">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">Payment #{payment.id}</p>
                      <p className="text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">Rs. {payment.amount.toLocaleString()}</p>
                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="capitalize text-xs">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}