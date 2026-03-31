/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { propertiesApi, paymentsApi, clearApiCache } from '@/lib/api';

export default function TenantDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Clear stale cache whenever the dashboard mounts (e.g. navigating back from properties page)
  useEffect(() => {
    clearApiCache();
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'tenant')) router.push('/dashboard');
  }, [authLoading, user, router]);

  const handleTabChange = useCallback((t: string) => {
    clearApiCache();
    setRefreshKey((k) => k + 1);
    setTab(t);
  }, []);

  if (authLoading || !user) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="dashboard-readable max-w-7xl mx-auto px-4 py-8 fade-in">
      <div className="surface-card mb-8 border-l-4 border-l-blue-600 p-5 md:p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Tenant Dashboard</h1>
        <p className="mt-2 text-gray-700">Welcome, {user.fullName}! <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full ml-1 font-semibold">Tenant</span></p>
      </div>

      <div className="soft-panel p-2 flex gap-2 mb-6 overflow-x-auto">
        <TabBtn label="Overview" tabKey="overview" active={tab === 'overview'} onTabChange={handleTabChange} />
        <TabBtn label="My Applications" tabKey="applications" active={tab === 'applications'} onTabChange={handleTabChange} />
        <TabBtn label="Payments" tabKey="payments" active={tab === 'payments'} onTabChange={handleTabChange} />
      </div>

      {tab === 'overview' && <OverviewTab user={user} token={token!} refreshKey={refreshKey} />}
      {tab === 'applications' && <MyApplicationsTab token={token!} refreshKey={refreshKey} />}
      {tab === 'payments' && <PaymentsTab token={token!} refreshKey={refreshKey} />}
    </div>
  );
}

const TabBtn = memo(function TabBtn({ label, tabKey, active, onTabChange }: { label: string; tabKey: string; active: boolean; onTabChange: (key: string) => void }) {
  const handleClick = useCallback(() => onTabChange(tabKey), [onTabChange, tabKey]);
  return (
    <button onClick={handleClick} className={`dashboard-tab ${active ? 'dashboard-tab-active bg-blue-600' : 'dashboard-tab-inactive'}`}>
      {label}
    </button>
  );
});

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="dashboard-card p-6">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function OverviewTab({ user, token, refreshKey }: { user: any; token: string; refreshKey: number }) {
  const [apps, setApps] = useState<any[]>([]);
  useEffect(() => {
    propertiesApi.myApplications(token).then((data) => setApps(data as any)).catch(() => {});
  }, [token, refreshKey]);

  const approved = apps.filter(a => a.status === 'approved').length;
  const pending = apps.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon="📋" label="Total Applications" value={apps.length} />
        <StatCard icon="✅" label="Approved" value={approved} />
        <StatCard icon="⏳" label="Pending" value={pending} />
        <StatCard icon="📧" label="Email" value={user.email} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/properties" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
              <span className="text-xl">🔍</span>
              <div>
                <p className="font-medium text-gray-800">Browse Properties</p>
                <p className="text-sm text-gray-500">Find your next home</p>
              </div>
            </Link>
            <Link href="/messages" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
              <span className="text-xl">💬</span>
              <div>
                <p className="font-medium text-gray-800">Messages</p>
                <p className="text-sm text-gray-500">Chat with landlords</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-4">Profile</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{user.fullName}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium">{user.phone || 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyApplicationsTab({ token, refreshKey }: { token: string; refreshKey: number }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    propertiesApi.myApplications(token).then((data) => setApps(data as any)).catch(() => {}).finally(() => setLoading(false));
  }, [token, refreshKey]);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-4 fade-in">
      {apps.length === 0 ? (
        <div className="text-center py-12 surface-card">
          <p className="text-gray-500 mb-4">You haven&apos;t applied to any properties yet.</p>
          <Link href="/properties" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700">
            Browse Properties
          </Link>
        </div>
      ) : (
        apps.map((a) => (
          <div key={a.id} className="dashboard-card p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{a.property?.title}</h3>
                <p className="text-sm text-gray-500">{a.property?.address}, {a.property?.city}</p>
                <p className="text-sm text-gray-600 mt-1">Rent: ৳{Number(a.property?.rentAmount || 0).toLocaleString()}/mo</p>
                {a.message && <p className="text-sm text-gray-400 mt-1 italic">&quot;{a.message}&quot;</p>}
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${a.status === 'approved' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {a.status}
                </span>
                <p className="text-xs text-gray-400 mt-2">{new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function PaymentsTab({ token, refreshKey }: { token: string; refreshKey: number }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayForm, setShowPayForm] = useState(false);
  const [apps, setApps] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [monthPeriod, setMonthPeriod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paying, setPaying] = useState(false);
  const [payFeedback, setPayFeedback] = useState('');
  const [invoice, setInvoice] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentData, appData] = await Promise.all([
        paymentsApi.list(token),
        propertiesApi.myApplications(token),
      ]);
      setPayments(paymentData);
      setApps(appData.filter((a: any) => a.status === 'approved'));
    } catch {} finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handlePay = async () => {
    if (!selectedProperty || !monthPeriod) return;
    setPaying(true);
    setPayFeedback('');
    try {
      await paymentsApi.create({
        landlordId: selectedProperty.property.landlordId || selectedProperty.property.landlord?.id,
        propertyId: selectedProperty.property.id,
        amount: Number(selectedProperty.property.rentAmount),
        paymentMethod,
        monthPeriod,
      }, token);
      setPayFeedback('Payment created! Click "Simulate Payment" to complete.');
      setShowPayForm(false);
      await loadData();
    } catch (err: any) {
      setPayFeedback(err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleSimulateComplete = async (paymentId: string) => {
    try {
      await paymentsApi.complete(paymentId, token);
      await loadData();
    } catch {}
  };

  const handleViewInvoice = async (paymentId: string) => {
    try {
      const inv = await paymentsApi.invoice(paymentId, token);
      setInvoice(inv);
    } catch {}
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Pay Rent Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
        {apps.length > 0 && (
          <button
            onClick={() => setShowPayForm(!showPayForm)}
            className="dashboard-action bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition text-sm"
          >
            {showPayForm ? 'Cancel' : '💳 Pay Rent'}
          </button>
        )}
      </div>

      {payFeedback && (
        <p className={`text-sm p-3 rounded-lg ${payFeedback.includes('created') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {payFeedback}
        </p>
      )}

      {/* Pay Rent Form */}
      {showPayForm && (
        <div className="dashboard-card p-6 border-2 border-emerald-200">
          <h3 className="font-semibold text-gray-800 mb-4">💳 Pay Rent</h3>
      <div className="space-y-6 fade-in">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Select Property</label>
              <select
                value={selectedProperty?.id || ''}
                onChange={(e) => setSelectedProperty(apps.find((a: any) => a.id === e.target.value))}
                className="input-field"
              >
                <option value="">-- Select an approved property --</option>
                {apps.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.property?.title} — ৳{Number(a.property?.rentAmount || 0).toLocaleString()}/mo
                  </option>
                ))}
              </select>
            </div>

            {selectedProperty && (
              <>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Property: <strong>{selectedProperty.property?.title}</strong></p>
                  <p className="text-sm text-gray-600">Monthly Rent: <strong>৳{Number(selectedProperty.property?.rentAmount || 0).toLocaleString()}</strong></p>
                  <p className="text-sm text-gray-600">Address: {selectedProperty.property?.address}, {selectedProperty.property?.city}</p>
                </div>

                <div className="dashboard-card p-4">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Month / Period</label>
                  <input
                    type="text"
                    placeholder="e.g. January 2025"
                    value={monthPeriod}
                    onChange={(e) => setMonthPeriod(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-field"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <button
                  onClick={handlePay}
                  disabled={paying || !monthPeriod}
                  className="btn-primary dashboard-action w-full py-3"
                >
                  {paying ? 'Processing...' : `Pay ৳${Number(selectedProperty.property?.rentAmount || 0).toLocaleString()}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">🧾 Invoice</h3>
              <button onClick={() => setInvoice(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="border-t pt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Invoice ID</span><span className="font-mono font-medium">{invoice.invoiceId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><span className="font-mono">{invoice.transactionId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Property</span><span className="font-medium">{invoice.property?.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tenant</span><span>{invoice.tenant?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Landlord</span><span>{invoice.landlord?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Period</span><span>{invoice.monthPeriod || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="capitalize">{invoice.paymentMethod}</span></div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-800 font-semibold">Amount</span>
                <span className="text-emerald-700 font-bold text-lg">৳{Number(invoice.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${invoice.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {invoice.status}
                </span>
              </div>
              {invoice.paidAt && (
                <div className="flex justify-between"><span className="text-gray-500">Paid At</span><span>{new Date(invoice.paidAt).toLocaleString()}</span></div>
              )}
            </div>
            <button onClick={() => setInvoice(null)} className="w-full mt-6 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="surface-card border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-cyan-50/50 py-10 text-center">
          <p className="mb-2 font-medium text-slate-700">No payment records yet.</p>
          {apps.length === 0 && (
            <p className="text-sm text-slate-500">Apply for a property and get approved to make payments.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="dashboard-card p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">৳{Number(p.amount).toLocaleString()}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{p.property?.title} — {p.paymentMethod}</p>
                  {p.monthPeriod && <p className="text-xs text-gray-400">Period: {p.monthPeriod}</p>}
                  <p className="text-xs text-gray-400">TXN: {p.transactionId} • {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  {p.status === 'pending' && (
                    <button
                      onClick={() => handleSimulateComplete(p.id)}
                      className="btn-primary dashboard-action px-3 py-1.5 text-xs"
                    >
                      ✓ Simulate Payment
                    </button>
                  )}
                  <button
                    onClick={() => handleViewInvoice(p.id)}
                    className="dashboard-action inline-flex items-center justify-center rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    🧾 Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
