/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { propertiesApi, reviewsApi, messagesApi, reportsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { OptimizedImage } from '@/components/OptimizedImage';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyMsg, setApplyMsg] = useState('');
  const [applying, setApplying] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contacting, setContacting] = useState(false);
  const [contactFeedback, setContactFeedback] = useState('');
  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [landlordAvg, setLandlordAvg] = useState<{ averageRating: number; totalReviews: number } | null>(null);
  // Report
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportType, setReportType] = useState('fake_listing');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');

  useEffect(() => {
    if (id) {
      Promise.all([
        propertiesApi.get(id as string),
        reviewsApi.byProperty(id as string).catch(() => []),
      ]).then(([prop, revs]) => {
        setProperty(prop);
        setReviews(revs);
        // Load landlord average rating
        if (prop.landlord?.id) {
          reviewsApi.avgRating(prop.landlord.id).then((data) => setLandlordAvg(data as any)).catch(() => {});
        }
      }).catch(() => {
        setProperty(null);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleApply = useCallback(async () => {
    if (!token) { router.push('/login'); return; }
    setApplying(true);
    try {
      await propertiesApi.apply(id as string, { message: applyMsg }, token);
      setFeedback('Application submitted successfully!');
    } catch (err: any) {
      setFeedback(err.message);
    } finally {
      setApplying(false);
    }
  }, [token, id, applyMsg, router]);

  const handleContactLandlord = useCallback(async () => {
    if (!token) { router.push('/login'); return; }
    if (!contactMsg.trim()) return;
    setContacting(true);
    try {
      await messagesApi.send(
        { receiverId: property.landlord.id, content: contactMsg, propertyId: id },
        token,
      );
      setContactFeedback('Message sent to landlord!');
      setContactMsg('');
    } catch (err: any) {
      setContactFeedback(err.message);
    } finally {
      setContacting(false);
    }
  }, [token, contactMsg, property, id, router]);

  const handleReviewSubmit = useCallback(async () => {
    if (!token) { router.push('/login'); return; }
    setReviewSubmitting(true);
    setReviewFeedback('');
    try {
      await reviewsApi.create({
        propertyId: id,
        targetUserId: property.landlord?.id,
        reviewType: user?.role === 'tenant' ? 'tenant_to_landlord' : 'property',
        rating: reviewRating,
        comment: reviewComment,
      }, token);
      setReviewFeedback('Review submitted!');
      setReviewComment('');
      setReviewRating(5);
      // Refresh reviews
      const revs = await reviewsApi.byProperty(id as string).catch(() => []);
      setReviews(revs);
      if (property.landlord?.id) {
        reviewsApi.avgRating(property.landlord.id).then((data) => setLandlordAvg(data as any)).catch(() => {});
      }
    } catch (err: any) {
      setReviewFeedback(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  }, [token, id, property, user, reviewRating, reviewComment, router]);

  const handleReport = useCallback(async () => {
    if (!token) { router.push('/login'); return; }
    if (!reportReason.trim()) return;
    setReportSubmitting(true);
    try {
      await reportsApi.create({
        type: reportType,
        targetType: 'property',
        targetId: id,
        reason: reportReason,
      }, token);
      setReportFeedback('Report submitted. Admin will review it.');
      setShowReport(false);
      setReportReason('');
    } catch (err: any) {
      setReportFeedback(err.message);
    } finally {
      setReportSubmitting(false);
    }
  }, [token, id, reportType, reportReason, router]);

  if (loading) return <div className="surface-card max-w-4xl mx-auto mt-8 text-center py-20 text-gray-500">Loading...</div>;
  if (!property) return <div className="surface-card max-w-4xl mx-auto mt-8 text-center py-20 text-gray-500">Property not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-in">
      <div className="surface-card mb-6 p-5 md:p-6 border-l-4 border-l-emerald-600">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Property Detail</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mt-1">{property.title}</h1>
            <p className="text-gray-600 mt-2">📍 {property.address}, {property.city}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">{property.propertyType}</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">🛏 {property.bedrooms} bed</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">🚿 {property.bathrooms} bath</span>
            {property.areaSqft && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">📐 {property.areaSqft} sqft</span>}
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden h-64 md:h-96 bg-gray-200 mb-6">
        <OptimizedImage
          src={property.imageUrls?.[0]}
          alt={property.title}
          fallback="🏠"
          fill
          className="h-full w-full"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="mb-6 flex flex-wrap gap-2">
            {property.distanceFromRoad && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">🛣️ {property.distanceFromRoad} from road</span>}
            {property.advanceDeposit && <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">💰 Deposit ৳{Number(property.advanceDeposit).toLocaleString()}</span>}
            {property.landlord?.fullName && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">👤 {property.landlord.fullName}</span>}
          </div>

          {/* Facilities */}
          {property.facilities?.length > 0 && (
            <div className="surface-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Facilities</h2>
              <div className="flex flex-wrap gap-2">
                {property.facilities.map((f: string) => (
                  <span key={f} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Map Location */}
          {property.mapLatitude && property.mapLongitude && (
            <div className="surface-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <div className="bg-gray-100 rounded-lg overflow-hidden h-48">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${property.mapLatitude},${property.mapLongitude}&z=15&output=embed`}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">📍 {property.mapLatitude.toFixed(4)}, {property.mapLongitude.toFixed(4)}</p>
            </div>
          )}

          <div className="surface-card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{property.description || 'No description provided.'}</p>
          </div>

          <div className="surface-card p-6">
            <h2 className="text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>

            {/* Landlord Rating Summary */}
            {landlordAvg && landlordAvg.totalReviews > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3 mb-4 flex items-center gap-3">
                <div className="text-2xl">⭐</div>
                <div>
                  <p className="font-semibold text-gray-800">{landlordAvg.averageRating}/5 Landlord Rating</p>
                  <p className="text-xs text-gray-500">Based on {landlordAvg.totalReviews} review(s)</p>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-400">No reviews yet.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {reviews.map((r: any) => (
                  <div key={r.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">{r.reviewer?.fullName}</span>
                      <span className="text-yellow-500">{'⭐'.repeat(r.rating)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Write a Review Form */}
            {user && (
              <div className="border-t pt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Write a Review</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-2xl transition ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Write your review comment..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="input-field"
                    rows={3}
                  />
                  <button
                    onClick={handleReviewSubmit}
                    disabled={reviewSubmitting}
                    className="btn-primary text-sm"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  {reviewFeedback && (
                    <p className={`text-sm ${reviewFeedback.includes('submitted') ? 'text-green-600' : 'text-red-600'}`}>
                      {reviewFeedback}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Report Listing */}
          {user && (
            <div className="mt-4">
              <button
                onClick={() => setShowReport(!showReport)}
                className="text-red-500 text-sm hover:underline"
              >
                🚩 Report this listing
              </button>
              {reportFeedback && (
                <p className="text-sm text-green-600 mt-1">{reportFeedback}</p>
              )}
              {showReport && (
                <div className="bg-red-50 rounded-xl p-4 mt-2 space-y-3 border border-red-100">
                  <h3 className="font-semibold text-red-700 text-sm">Report this listing</h3>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="input-field border-red-200 focus:border-red-400 focus:ring-red-200"
                  >
                    <option value="fake_listing">Fake Listing</option>
                    <option value="bad_behavior">Bad Behavior</option>
                    <option value="spam">Spam</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    placeholder="Describe your reason for reporting..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="input-field border-red-200 focus:border-red-400 focus:ring-red-200"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReport}
                      disabled={reportSubmitting || !reportReason.trim()}
                      className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                    <button
                      onClick={() => setShowReport(false)}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="surface-card p-6 sticky top-20">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-emerald-700">৳{Number(property.rentAmount).toLocaleString()}</p>
              <p className="text-gray-500">per month</p>
            </div>

            {property.advanceDeposit && (
              <div className="text-center mb-4 pb-4 border-b">
                <p className="text-lg font-semibold text-gray-700">৳{Number(property.advanceDeposit).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Advance / Security Deposit</p>
              </div>
            )}

            {property.landlord && (
              <div className="border-t pt-4 mb-4">
                <p className="text-sm text-gray-500">Listed by</p>
                <p className="font-semibold text-gray-800">{property.landlord.fullName}</p>
              </div>
            )}

            <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700 font-semibold">Quick Tips</p>
              <p className="text-xs text-emerald-800 mt-1">Use direct message for availability, move-in date, and negotiation.</p>
            </div>

            {user?.role === 'tenant' && (
              <div>
                <textarea
                  placeholder="Write a message to the landlord (optional)..."
                  value={applyMsg}
                  onChange={(e) => setApplyMsg(e.target.value)}
                  className="input-field mb-3"
                  rows={3}
                />
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn-primary w-full"
                >
                  {applying ? 'Applying...' : 'Apply for Rental'}
                </button>

                {/* Contact Landlord */}
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">💬 Contact Landlord</h3>
                  <textarea
                    placeholder="Send a direct message to the landlord..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="input-field mb-2"
                    rows={2}
                  />
                  <button
                    onClick={handleContactLandlord}
                    disabled={contacting || !contactMsg.trim()}
                    className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {contacting ? 'Sending...' : 'Send Message'}
                  </button>
                  {contactFeedback && (
                    <p className={`text-xs mt-2 text-center ${contactFeedback.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                      {contactFeedback}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!user && (
              <button
                onClick={() => router.push('/login')}
                className="btn-primary w-full"
              >
                Login to Apply
              </button>
            )}

            {feedback && (
              <p className={`text-sm mt-3 text-center ${feedback.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {feedback}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
