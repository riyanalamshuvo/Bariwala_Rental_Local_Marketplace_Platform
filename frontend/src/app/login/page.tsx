'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 fade-in">
      <div className="surface-card p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-2">Welcome Back</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Sign in to continue to your dashboard.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-100">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-emerald-600 font-medium hover:underline">
            Register
          </Link>
        </p>

        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-200">
          <p className="font-semibold mb-1">Demo Accounts (password: 123456789)</p>
          <p>Landlord: riyanalam76@gmail.com</p>
          <p>Tenant: tenant76@gmail.com</p>
          <p>Buyer/Seller: buyer76@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
