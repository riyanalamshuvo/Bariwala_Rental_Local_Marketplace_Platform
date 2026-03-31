/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { marketplaceApi, uploadApi } from '@/lib/api';

export default function MarketplaceDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'buyer_seller')) router.push('/dashboard');
  }, [authLoading, user, router]);

  const handleTabChange = useCallback((t: string) => setTab(t), []);

  if (authLoading || !user) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="dashboard-readable max-w-7xl mx-auto px-4 py-8 fade-in">
      <div className="surface-card mb-8 border-l-4 border-l-purple-600 p-5 md:p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Marketplace Dashboard</h1>
        <p className="mt-2 text-gray-700">Welcome, {user.fullName}! <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full ml-1 font-semibold">Buyer/Seller</span></p>
      </div>

      <div className="soft-panel p-2 flex gap-2 mb-6 overflow-x-auto">
        <TabBtn label="Overview" tabKey="overview" active={tab === 'overview'} onTabChange={handleTabChange} />
        <TabBtn label="My Items" tabKey="items" active={tab === 'items'} onTabChange={handleTabChange} />
        <TabBtn label="Post Item" tabKey="post-item" active={tab === 'post-item'} onTabChange={handleTabChange} />
      </div>

      {tab === 'overview' && <OverviewTab user={user} token={token!} />}
      {tab === 'items' && <MyItemsTab token={token!} />}
      {tab === 'post-item' && <PostItemTab token={token!} onDone={() => setTab('items')} />}
    </div>
  );
}

const TabBtn = memo(function TabBtn({ label, tabKey, active, onTabChange }: { label: string; tabKey: string; active: boolean; onTabChange: (key: string) => void }) {
  const handleClick = useCallback(() => onTabChange(tabKey), [onTabChange, tabKey]);
  return (
    <button onClick={handleClick} className={`dashboard-tab ${active ? 'dashboard-tab-active bg-purple-600' : 'dashboard-tab-inactive'}`}>
      {label}
    </button>
  );
});

function OverviewTab({ user, token }: { user: any; token: string }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    marketplaceApi.myItems(token).then((data) => setItems(data as any)).catch(() => {});
  }, [token]);

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card p-6">
          <div className="text-2xl mb-2">📦</div>
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-lg font-semibold text-gray-800">{items.length}</p>
        </div>
        <div className="dashboard-card p-6">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-lg font-semibold text-gray-800">{items.filter(i => !i.isSold).length}</p>
        </div>
        <div className="dashboard-card p-6">
          <div className="text-2xl mb-2">💰</div>
          <p className="text-sm text-gray-500">Sold</p>
          <p className="text-lg font-semibold text-gray-800">{items.filter(i => i.isSold).length}</p>
        </div>
        <div className="dashboard-card p-6">
          <div className="text-2xl mb-2">📧</div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg font-semibold text-gray-800 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/marketplace" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
              <span className="text-xl">🛒</span>
              <div>
                <p className="font-medium text-gray-800">Browse Marketplace</p>
                <p className="text-sm text-gray-500">Find items to buy</p>
              </div>
            </Link>
            <Link href="/messages" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
              <span className="text-xl">💬</span>
              <div>
                <p className="font-medium text-gray-800">Messages</p>
                <p className="text-sm text-gray-500">Chat with buyers/sellers</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Items</h3>
          {items.slice(0, 3).map(item => (
            <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-sm text-gray-500">৳{Number(item.price).toLocaleString()}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${item.isSold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {item.isSold ? 'Sold' : 'Available'}
              </span>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-sm">No items posted yet.</p>}
        </div>
      </div>
    </div>
  );
}

function MyItemsTab({ token }: { token: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceApi.myItems(token).then((data) => setItems(data as any)).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-4 fade-in">
      {items.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t posted any items yet.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="dashboard-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">৳{Number(item.price).toLocaleString()} — <span className="capitalize">{item.category}</span> — <span className="capitalize">{item.condition?.replace('_', ' ')}</span></p>
                {item.description && <p className="text-sm text-gray-400 mt-1">{item.description}</p>}
                {item.city && <p className="text-xs text-gray-400 mt-1">📍 {item.city}</p>}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.isSold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {item.isSold ? 'Sold' : 'Available'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function PostItemTab({ token, onDone }: { token: string; onDone: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', price: 0, category: 'electronics', condition: 'used', city: '', imageUrls: [''] });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - selectedFiles.length);
      setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrls = form.imageUrls.filter(Boolean);

      // Upload selected files first
      if (selectedFiles.length > 0) {
        const uploaded = await uploadApi.upload(selectedFiles, token);
        imageUrls = [...uploaded, ...imageUrls];
      }

      await marketplaceApi.create({ ...form, imageUrls }, token);
      onDone();
    } catch {}
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="dashboard-card p-6 max-w-2xl space-y-4 fade-in">
      <h2 className="text-xl font-semibold">Post New Item</h2>
      <input type="text" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
      <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
      <div className="grid grid-cols-2 gap-4">
        <input type="number" placeholder="Price (৳)" required value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input-field" />
        <input type="text" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
          <option value="vehicles">Vehicles</option>
          <option value="books">Books</option>
          <option value="services">Services</option>
          <option value="other">Other</option>
        </select>
        <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="input-field">
          <option value="new">New</option>
          <option value="like_new">Like New</option>
          <option value="used">Used</option>
          <option value="refurbished">Refurbished</option>
        </select>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images (max 5)</label>
        <label className="flex items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition">
          <div className="text-center">
            <p className="text-gray-400 text-sm">📷 Click to select images</p>
            <p className="text-gray-300 text-xs">JPG, PNG, GIF, WebP — up to 5 MB each</p>
          </div>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        </label>
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedFiles.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">
                {f.name.length > 20 ? f.name.slice(0, 17) + '...' : f.name}
                <button type="button" onClick={() => removeFile(i)} className="ml-1 text-purple-400 hover:text-purple-700">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Fallback URL input */}
      <input type="url" placeholder="Or paste an image URL (optional)" value={form.imageUrls[0]} onChange={(e) => setForm({ ...form, imageUrls: [e.target.value] })} className="input-field" />

      <button type="submit" disabled={submitting} className="dashboard-action w-full inline-flex items-center justify-center rounded-xl bg-purple-600 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50">
        {submitting ? 'Posting...' : 'Post Item'}
      </button>
    </form>
  );
}
