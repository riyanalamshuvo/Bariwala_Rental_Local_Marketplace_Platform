/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { marketplaceApi, messagesApi, reportsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { OptimizedImage } from '@/components/OptimizedImage';

export default function MarketplaceItemPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState('fake_listing');
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');

  useEffect(() => {
    if (id) {
      marketplaceApi.get(id as string)
        .then(setItem)
        .catch(() => setItem(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleContact = useCallback(async () => {
    if (!token) { router.push('/login'); return; }
    if (!msg.trim()) return;
    try {
      await messagesApi.send({ receiverId: item.sellerId, content: msg }, token);
      setSent(true);
    } catch {}
  }, [token, msg, item, router]);

  const handleReport = useCallback(async () => {
    if (!token) { router.push('/login'); return; }
    setReportSubmitting(true);
    try {
      await reportsApi.create({ type: reportType, targetType: 'marketplace_item', targetId: id as string, reason: reportReason }, token);
      setReportFeedback('Report submitted successfully.');
      setShowReport(false);
      setReportReason('');
    } catch { setReportFeedback('Failed to submit report.'); }
    setReportSubmitting(false);
  }, [token, id, reportType, reportReason, router]);

  if (loading) return <div className="surface-card max-w-4xl mx-auto mt-8 text-center py-20 text-gray-500">Loading...</div>;
  if (!item) return <div className="surface-card max-w-4xl mx-auto mt-8 text-center py-20 text-gray-500">Item not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-in">
      <div className="surface-card mb-6 p-5 md:p-6 border-l-4 border-l-purple-600">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-purple-700 font-semibold">Marketplace Item</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mt-1">{item.title}</h1>
            {item.city && <p className="text-gray-600 mt-2">📍 {item.city}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">{item.category}</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">{item.condition?.replace('_', ' ')}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.isSold ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {item.isSold ? 'SOLD' : 'AVAILABLE'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="surface-card overflow-hidden h-80 bg-gray-200">
          <OptimizedImage
            src={item.imageUrls?.[0]}
            alt={item.title}
            fallback="📦"
            fill
            className="h-full w-full"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div>
          <p className="text-3xl font-bold text-emerald-700 mb-4">৳{Number(item.price).toLocaleString()}</p>
          {item.seller && <p className="text-gray-600 mb-4">Sold by: <span className="font-medium">{item.seller.fullName}</span></p>}

          <div className="surface-card p-4 mb-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{item.description || 'No description.'}</p>
          </div>

          <div className="mb-4 rounded-xl border border-purple-100 bg-purple-50 p-3">
            <p className="text-xs text-purple-700 font-semibold">Buyer Tip</p>
            <p className="text-xs text-purple-800 mt-1">Ask condition details, warranty, and pickup/delivery before finalizing.</p>
          </div>

          {/* Contact seller */}
          {user && user.id !== item.sellerId && !sent && (
            <div className="surface-card p-4">
              <h3 className="font-semibold mb-2">Contact Seller</h3>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Hi, I'm interested in this item..."
                rows={3}
                className="input-field mb-2"
              />
              <button
                onClick={handleContact}
                className="btn-primary w-full"
              >
                Send Message
              </button>
            </div>
          )}
          {sent && <p className="text-green-600 font-medium">Message sent to seller!</p>}
          {!user && (
            <button onClick={() => router.push('/login')} className="btn-primary w-full">
              Login to Contact Seller
            </button>
          )}

          {/* Report Item */}
          {user && (
            <div className="mt-4">
              <button onClick={() => setShowReport(!showReport)} className="text-red-500 text-sm hover:underline">
                🚩 Report this item
              </button>
              {reportFeedback && <p className="text-sm text-green-600 mt-1">{reportFeedback}</p>}
              {showReport && (
                <div className="bg-red-50 rounded-xl p-4 mt-2 space-y-3 border border-red-100">
                  <h3 className="font-semibold text-red-700 text-sm">Report this item</h3>
                  <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field border-red-200 focus:border-red-400 focus:ring-red-200">
                    <option value="fake_listing">Fake Listing</option>
                    <option value="bad_behavior">Bad Behavior</option>
                    <option value="spam">Spam</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea placeholder="Describe your reason..." value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="input-field border-red-200 focus:border-red-400 focus:ring-red-200" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={handleReport} disabled={reportSubmitting || !reportReason.trim()} className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50">
                      {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                    <button onClick={() => setShowReport(false)} className="btn-secondary text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
