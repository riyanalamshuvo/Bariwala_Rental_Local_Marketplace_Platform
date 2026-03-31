/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { adminApi } from '@/lib/api';

export default function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.push('/dashboard');
  }, [authLoading, user, router]);

  const handleTabChange = useCallback((t: string) => setTab(t), []);

  if (authLoading || !user) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="dashboard-readable max-w-7xl mx-auto px-4 py-8 fade-in">
      <div className="surface-card mb-8 border-l-4 border-l-red-600 p-5 md:p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-700">Welcome, {user.fullName}! <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full ml-1 font-semibold">Admin</span></p>
      </div>

      <div className="soft-panel p-2 flex gap-2 mb-6 overflow-x-auto">
        <TabBtn label="Overview" tabKey="overview" active={tab === 'overview'} onTabChange={handleTabChange} />
        <TabBtn label="Users" tabKey="users" active={tab === 'users'} onTabChange={handleTabChange} />
        <TabBtn label="Properties" tabKey="properties" active={tab === 'properties'} onTabChange={handleTabChange} />
        <TabBtn label="Applications" tabKey="applications" active={tab === 'applications'} onTabChange={handleTabChange} />
        <TabBtn label="Marketplace" tabKey="marketplace" active={tab === 'marketplace'} onTabChange={handleTabChange} />
        <TabBtn label="Payments" tabKey="payments" active={tab === 'payments'} onTabChange={handleTabChange} />
        <TabBtn label="Reports" tabKey="reports" active={tab === 'reports'} onTabChange={handleTabChange} />
        <TabBtn label="Reviews" tabKey="reviews" active={tab === 'reviews'} onTabChange={handleTabChange} />
      </div>

      {tab === 'overview' && <OverviewTab token={token!} />}
      {tab === 'users' && <UsersTab token={token!} />}
      {tab === 'properties' && <PropertiesTab token={token!} />}
      {tab === 'applications' && <ApplicationsTab token={token!} />}
      {tab === 'marketplace' && <MarketplaceTab token={token!} />}
      {tab === 'payments' && <PaymentsTab token={token!} />}
      {tab === 'reports' && <ReportsTab token={token!} />}
      {tab === 'reviews' && <ReviewsTab token={token!} />}
    </div>
  );
}

const TabBtn = memo(function TabBtn({ label, tabKey, active, onTabChange }: { label: string; tabKey: string; active: boolean; onTabChange: (key: string) => void }) {
  const handleClick = useCallback(() => onTabChange(tabKey), [onTabChange, tabKey]);
  return (
    <button onClick={handleClick} className={`dashboard-tab ${active ? 'dashboard-tab-active bg-red-600' : 'dashboard-tab-inactive'}`}>
      {label}
    </button>
  );
});

function OverviewTab({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminApi.stats(token).then((data) => setStats(data)).catch(() => {});
  }, [token]);

  if (!stats) return <p className="text-gray-500">Loading stats...</p>;

  const cards = [
    { icon: '👥', label: 'Total Users', value: stats.totalUsers },
    { icon: '🏠', label: 'Total Properties', value: stats.totalProperties },
    { icon: '✅', label: 'Available Properties', value: stats.availableProperties },
    { icon: '📋', label: 'Applications', value: stats.totalApplications },
    { icon: '🛒', label: 'Marketplace Items', value: stats.totalMarketplaceItems },
    { icon: '💳', label: 'Payments', value: stats.totalPayments },
    { icon: '🏘️', label: 'Landlords', value: stats.landlords },
    { icon: '🔑', label: 'Tenants', value: stats.tenants },
    { icon: '🚩', label: 'Total Reports', value: stats.totalReports ?? 0 },
    { icon: '⏳', label: 'Pending Reports', value: stats.pendingReports ?? 0 },
    { icon: '⭐', label: 'Total Reviews', value: stats.totalReviews ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="dashboard-card p-5">
          <div className="text-2xl mb-2">{c.icon}</div>
          <p className="text-sm text-gray-500">{c.label}</p>
          <p className="text-2xl font-bold text-gray-800">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.users(token).then((data) => setUsers(data as any[])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  const handleToggle = async (id: string) => {
    await adminApi.toggleUser(id, token);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await adminApi.deleteUser(id, token);
    load();
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.fullName}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'landlord' ? 'bg-emerald-100 text-emerald-700' : u.role === 'tenant' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {u.role?.replace('_', '/')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleToggle(u.id)} className="dashboard-action text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDelete(u.id)} className="dashboard-action text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PropertiesTab({ token }: { token: string }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.properties(token).then((data) => setProperties(data as any[])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    await adminApi.deleteProperty(id, token);
    load();
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-4 fade-in">
      {properties.map((p) => (
        <div key={p.id} className="dashboard-card p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-800">{p.title}</h3>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">{p.propertyType}</span>
              </div>
              <p className="text-sm text-gray-500">{p.address}, {p.city}</p>
              <p className="text-sm text-gray-600 mt-1">Rent: ৳{Number(p.rentAmount).toLocaleString()}/mo — Listed by: {p.landlord?.fullName || 'Unknown'}</p>
              {p.facilities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.facilities.map((f: string) => (
                    <span key={f} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {p.isAvailable ? 'Available' : 'Rented'}
              </span>
              <button onClick={() => handleDelete(p.id)} className="dashboard-action text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplicationsTab({ token }: { token: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.applications(token).then((data) => setApps(data as any[])).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tenant</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Message</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {apps.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{a.property?.title || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{a.tenant?.fullName || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${a.status === 'approved' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{a.message || '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {apps.length === 0 && <p className="text-gray-500 text-center py-8">No applications yet.</p>}
    </div>
  );
}

function MarketplaceTab({ token }: { token: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.marketplace(token).then((data) => setItems(data as any[])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this marketplace item?')) return;
    await adminApi.deleteMarketplaceItem(id, token);
    load();
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-4 fade-in">
      {items.map((item) => (
        <div key={item.id} className="dashboard-card p-4 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">{item.title}</h3>
            <p className="text-sm text-gray-500">
              ৳{Number(item.price).toLocaleString()} — {item.category} — Seller: {item.seller?.fullName || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.isSold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {item.isSold ? 'Sold' : 'Available'}
            </span>
            <button onClick={() => handleDelete(item.id)} className="dashboard-action text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">
              Delete
            </button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-gray-500 text-center py-8">No marketplace items.</p>}
    </div>
  );
}

function PaymentsTab({ token }: { token: string }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.payments(token).then((data) => setPayments(data as any[])).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tenant</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Landlord</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">TXN ID</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800">৳{Number(p.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{p.property?.title || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{p.tenant?.fullName || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{p.landlord?.fullName || '—'}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{p.paymentMethod?.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.transactionId || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {payments.length === 0 && <p className="text-gray-500 text-center py-8">No payments recorded.</p>}
    </div>
  );
}

function ReportsTab({ token }: { token: string }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.reports(token).then((data) => setReports(data as any[])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  const handleUpdate = async (id: string) => {
    await adminApi.updateReport(id, { status: editStatus, adminNotes: editNotes }, token);
    setEditingId(null);
    load();
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  const statusColor = (s: string) => {
    if (s === 'resolved') return 'bg-green-100 text-green-700';
    if (s === 'dismissed') return 'bg-gray-100 text-gray-600';
    if (s === 'reviewed') return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="space-y-4 fade-in">
      {reports.length === 0 && <p className="text-gray-500 text-center py-8">No reports yet.</p>}
      {reports.map((r) => (
        <div key={r.id} className="dashboard-card p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full capitalize">{r.type?.replace('_', ' ')}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor(r.status)}`}>{r.status}</span>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full capitalize">{r.targetType?.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1"><strong>Reason:</strong> {r.reason}</p>
              <p className="text-xs text-gray-400 mt-1">Reported by: {r.reporter?.fullName || 'Unknown'} — {new Date(r.createdAt).toLocaleDateString()}</p>
              {r.adminNotes && <p className="text-xs text-blue-600 mt-1"><strong>Admin Notes:</strong> {r.adminNotes}</p>}
            </div>
            <div>
              {editingId !== r.id ? (
                <button onClick={() => { setEditingId(r.id); setEditStatus(r.status); setEditNotes(r.adminNotes || ''); }} className="dashboard-action text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
                  Review
                </button>
              ) : (
                <div className="space-y-2 min-w-[220px]">
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-2 py-1 border rounded text-sm">
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Admin notes..." className="w-full px-2 py-1 border rounded text-sm" rows={2} />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(r.id)} className="dashboard-action text-xs px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200">Save</button>
                    <button onClick={() => setEditingId(null)} className="dashboard-action text-xs px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsTab({ token }: { token: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.reviews(token).then((data) => setReviews(data as any[])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await adminApi.deleteReview(id, token);
    load();
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-4 fade-in">
      {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet.</p>}
      {reviews.map((r) => (
        <div key={r.id} className="dashboard-card p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-500 text-sm">{'⭐'.repeat(r.rating)}</span>
                {r.reviewType && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full capitalize">{r.reviewType?.replace(/_/g, ' ')}</span>}
              </div>
              <p className="text-sm text-gray-700">{r.comment}</p>
              <div className="text-xs text-gray-400 mt-1 space-x-2">
                <span>By: {r.reviewer?.fullName || 'Unknown'}</span>
                <span>→ {r.targetUser?.fullName || '—'}</span>
                {r.property && <span>| Property: {r.property.title}</span>}
                <span>| {new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <button onClick={() => handleDelete(r.id)} className="dashboard-action text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
