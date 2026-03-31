/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { propertiesApi, paymentsApi, uploadApi } from '@/lib/api';
import { OptimizedImage } from '@/components/OptimizedImage';

const FACILITY_OPTIONS = [
  'WiFi', 'Parking', 'Generator', 'Lift', 'Gas', 'Water Supply',
  'Guard', 'CCTV', 'Gym', 'Swimming Pool', 'Playground',
  'Kitchen Access', 'Laundry', 'Furnished', 'AC',
];

export default function LandlordDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [editingProperty, setEditingProperty] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'landlord')) router.push('/dashboard');
  }, [authLoading, user, router]);

  const handleTabChange = useCallback((t: string) => setTab(t), []);

  const handleEditProperty = useCallback((property: any) => {
    setEditingProperty(property);
    setTab('edit-property');
  }, []);

  if (authLoading || !user) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="dashboard-readable max-w-7xl mx-auto px-4 py-8 fade-in">
      <div className="surface-card mb-8 border-l-4 border-l-emerald-600 p-5 md:p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Landlord Dashboard</h1>
        <p className="mt-2 text-gray-700">Welcome, {user.fullName}! <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full ml-1 font-semibold">Landlord</span></p>
      </div>

      <div className="soft-panel p-2 flex gap-2 mb-6 overflow-x-auto">
        <TabBtn label="Overview" tabKey="overview" active={tab === 'overview'} onTabChange={handleTabChange} />
        <TabBtn label="My Properties" tabKey="properties" active={tab === 'properties'} onTabChange={handleTabChange} />
        <TabBtn label="Applications" tabKey="applications" active={tab === 'applications'} onTabChange={handleTabChange} />
        <TabBtn label="Add Property" tabKey="add-property" active={tab === 'add-property'} onTabChange={handleTabChange} />
        <TabBtn label="Payments" tabKey="payments" active={tab === 'payments'} onTabChange={handleTabChange} />
      </div>

      {tab === 'overview' && <OverviewTab user={user} token={token!} />}
      {tab === 'properties' && <MyPropertiesTab token={token!} onEdit={handleEditProperty} />}
      {tab === 'applications' && <ApplicationsTab token={token!} />}
      {tab === 'add-property' && <AddPropertyTab token={token!} onDone={() => setTab('properties')} />}
      {tab === 'edit-property' && editingProperty && <EditPropertyTab token={token!} property={editingProperty} onDone={() => { setEditingProperty(null); setTab('properties'); }} />}
      {tab === 'payments' && <PaymentsTab token={token!} />}
    </div>
  );
}

const TabBtn = memo(function TabBtn({ label, tabKey, active, onTabChange }: { label: string; tabKey: string; active: boolean; onTabChange: (key: string) => void }) {
  const handleClick = useCallback(() => onTabChange(tabKey), [onTabChange, tabKey]);
  return (
    <button onClick={handleClick} className={`dashboard-tab ${active ? 'dashboard-tab-active bg-emerald-600' : 'dashboard-tab-inactive'}`}>
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

function OverviewTab({ user, token }: { user: any; token: string }) {
  const [properties, setProperties] = useState<any[]>([]);
  useEffect(() => {
    propertiesApi.myListings(token).then(setProperties).catch(() => {});
  }, [token]);

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon="🏠" label="Total Properties" value={properties.length} />
        <StatCard icon="✅" label="Available" value={properties.filter(p => p.isAvailable).length} />
        <StatCard icon="📋" label="Total Applications" value={properties.reduce((sum: number, p: any) => sum + (p.applications?.length || 0), 0)} />
        <StatCard icon="📧" label="Email" value={user.email} />
      </div>
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Properties</h3>
        {properties.slice(0, 3).map((p: any) => (
          <div key={p.id} className="flex justify-between items-center py-3 border-b last:border-0">
            <div>
              <p className="font-medium text-gray-800">{p.title}</p>
              <p className="text-sm text-gray-500">{p.city} — ৳{Number(p.rentAmount).toLocaleString()}/mo</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {p.isAvailable ? 'Available' : 'Rented'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyPropertiesTab({ token, onEdit }: { token: string; onEdit: (property: any) => void }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    propertiesApi.myListings(token).then(setProperties).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await propertiesApi.delete(id, token);
      load();
    } catch {}
  };

  const handleToggleAvailability = async (p: any) => {
    try {
      await propertiesApi.update(p.id, { isAvailable: !p.isAvailable }, token);
      load();
    } catch {}
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-4 fade-in">
      {properties.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t listed any properties yet.</p>
      ) : (
        properties.map((p) => (
          <div key={p.id} className="dashboard-card p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{p.title}</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">{p.propertyType}</span>
                </div>
                <p className="text-sm text-gray-500">{p.address}, {p.city}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  <span>৳{Number(p.rentAmount).toLocaleString()}/mo</span>
                  {p.advanceDeposit && <span>Deposit: ৳{Number(p.advanceDeposit).toLocaleString()}</span>}
                  <span>{p.bedrooms} bed • {p.bathrooms} bath</span>
                  {p.areaSqft && <span>{p.areaSqft} sqft</span>}
                  {p.distanceFromRoad && <span>{p.distanceFromRoad} from road</span>}
                </div>
                {p.facilities?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.facilities.map((f: string) => (
                      <span key={f} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{p.applications?.length || 0} application(s)</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {p.isAvailable ? 'Available' : 'Rented'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleToggleAvailability(p)} className="dashboard-action text-xs px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition font-medium">
                    {p.isAvailable ? 'Mark Rented' : 'Mark Available'}
                  </button>
                  <button onClick={() => onEdit(p)} className="dashboard-action text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-medium">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="dashboard-action text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition font-medium">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AddPropertyTab({ token, onDone }: { token: string; onDone: () => void }) {
  const [form, setForm] = useState({
    title: '', description: '', address: '', city: '',
    rentAmount: 0, bedrooms: 1, bathrooms: 1, areaSqft: 0,
    propertyType: 'flat', imageUrls: [] as string[],
    advanceDeposit: 0, mapLatitude: 0, mapLongitude: 0,
    distanceFromRoad: '', facilities: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const toggleFacility = (f: string) => {
    setForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter(x => x !== f)
        : [...prev.facilities, f],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let imageUrls = form.imageUrls.filter(Boolean);

      // Upload files if selected
      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploaded = await uploadApi.upload(selectedFiles, token);
        imageUrls = [...imageUrls, ...uploaded];
        setUploading(false);
      }

      const data = {
        ...form,
        imageUrls,
        mapLatitude: form.mapLatitude || undefined,
        mapLongitude: form.mapLongitude || undefined,
        advanceDeposit: form.advanceDeposit || undefined,
        distanceFromRoad: form.distanceFromRoad || undefined,
      };
      await propertiesApi.create(data, token);
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6 max-w-3xl space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">Add New Property</h2>
      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* Basic Info */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Title *</label>
        <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 3 BHK Flat in Gulshan" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" rows={3} placeholder="Describe your property..." />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Address *</label>
        <input type="text" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Full address" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">City *</label>
          <input type="text" required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Property Type *</label>
          <select value={form.propertyType} onChange={e => setForm({ ...form, propertyType: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="flat">Flat</option>
            <option value="room">Room</option>
            <option value="sublet">Sublet</option>
          </select>
        </div>
      </div>

      {/* Rent & Deposit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Monthly Rent (৳) *</label>
          <input type="number" required value={form.rentAmount || ''} onChange={e => setForm({ ...form, rentAmount: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Advance / Security Deposit (৳)</label>
          <input type="number" value={form.advanceDeposit || ''} onChange={e => setForm({ ...form, advanceDeposit: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
      </div>

      {/* Rooms & Area */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Bedrooms</label>
          <input type="number" min={0} value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Bathrooms</label>
          <input type="number" min={0} value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Area (sqft)</label>
          <input type="number" value={form.areaSqft || ''} onChange={e => setForm({ ...form, areaSqft: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
      </div>

      {/* Map Location */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Map Location (Optional)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Latitude</label>
            <input type="number" step="any" value={form.mapLatitude || ''} onChange={e => setForm({ ...form, mapLatitude: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 23.7925" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Longitude</label>
            <input type="number" step="any" value={form.mapLongitude || ''} onChange={e => setForm({ ...form, mapLongitude: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 90.4078" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <label className="text-xs text-gray-500">Distance from Main Road</label>
          <input type="text" value={form.distanceFromRoad} onChange={e => setForm({ ...form, distanceFromRoad: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 50m, 200m" />
        </div>
      </div>

      {/* Facilities */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Facilities</label>
        <div className="flex flex-wrap gap-2">
          {FACILITY_OPTIONS.map(f => (
            <button
              type="button"
              key={f}
              onClick={() => toggleFacility(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${form.facilities.includes(f) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Property Images</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="property-images"
          />
          <label htmlFor="property-images" className="cursor-pointer">
            <div className="text-3xl mb-2">📸</div>
            <p className="text-sm text-gray-600 font-medium">Click to upload images</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP — Max 5MB each, up to 5 files</p>
          </label>
        </div>
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs">
                <span>📎 {file.name}</span>
                <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
          </div>
        )}
        {/* Also keep URL input as fallback */}
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Or paste image URLs</label>
          <input type="url" value={form.imageUrls[0] || ''} onChange={e => setForm({ ...form, imageUrls: [e.target.value] })} className="w-full px-4 py-2 border rounded-lg text-sm" placeholder="https://example.com/image.jpg" />
        </div>
      </div>

      <button type="submit" disabled={submitting || uploading} className="btn-primary dashboard-action w-full py-3 text-lg">
        {uploading ? 'Uploading images...' : submitting ? 'Saving...' : 'Add Property'}
      </button>
    </form>
  );
}

function EditPropertyTab({ token, property, onDone }: { token: string; property: any; onDone: () => void }) {
  const [form, setForm] = useState({
    title: property.title || '',
    description: property.description || '',
    address: property.address || '',
    city: property.city || '',
    rentAmount: Number(property.rentAmount) || 0,
    bedrooms: property.bedrooms || 1,
    bathrooms: property.bathrooms || 1,
    areaSqft: property.areaSqft || 0,
    propertyType: property.propertyType || 'flat',
    imageUrls: property.imageUrls || [],
    advanceDeposit: Number(property.advanceDeposit) || 0,
    mapLatitude: property.mapLatitude || 0,
    mapLongitude: property.mapLongitude || 0,
    distanceFromRoad: property.distanceFromRoad || '',
    facilities: property.facilities || [],
    isAvailable: property.isAvailable ?? true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const toggleFacility = (f: string) => {
    setForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x: string) => x !== f)
        : [...prev.facilities, f],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (idx: number) => {
    setForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_: string, i: number) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let imageUrls = [...form.imageUrls.filter(Boolean)];

      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploaded = await uploadApi.upload(selectedFiles, token);
        imageUrls = [...imageUrls, ...uploaded];
        setUploading(false);
      }

      const data = {
        ...form,
        imageUrls,
        mapLatitude: form.mapLatitude || undefined,
        mapLongitude: form.mapLongitude || undefined,
        advanceDeposit: form.advanceDeposit || undefined,
        distanceFromRoad: form.distanceFromRoad || undefined,
      };
      await propertiesApi.update(property.id, data, token);
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6 max-w-3xl space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Edit Property</h2>
        <button type="button" onClick={onDone} className="text-sm text-gray-500 hover:text-gray-700">← Back to listings</button>
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* Basic Info */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Title *</label>
        <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" rows={3} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Address *</label>
        <input type="text" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">City *</label>
          <input type="text" required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Property Type *</label>
          <select value={form.propertyType} onChange={e => setForm({ ...form, propertyType: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="flat">Flat</option>
            <option value="room">Room</option>
            <option value="sublet">Sublet</option>
          </select>
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <label className="text-sm font-medium text-gray-700">Availability Status:</label>
        <button
          type="button"
          onClick={() => setForm(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${form.isAvailable ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}
        >
          {form.isAvailable ? '✅ Available' : '🔴 Rented'}
        </button>
      </div>

      {/* Rent & Deposit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Monthly Rent (৳) *</label>
          <input type="number" required value={form.rentAmount || ''} onChange={e => setForm({ ...form, rentAmount: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Advance / Security Deposit (৳)</label>
          <input type="number" value={form.advanceDeposit || ''} onChange={e => setForm({ ...form, advanceDeposit: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
      </div>

      {/* Rooms & Area */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Bedrooms</label>
          <input type="number" min={0} value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Bathrooms</label>
          <input type="number" min={0} value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Area (sqft)</label>
          <input type="number" value={form.areaSqft || ''} onChange={e => setForm({ ...form, areaSqft: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
      </div>

      {/* Map Location */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Map Location (Optional)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Latitude</label>
            <input type="number" step="any" value={form.mapLatitude || ''} onChange={e => setForm({ ...form, mapLatitude: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Longitude</label>
            <input type="number" step="any" value={form.mapLongitude || ''} onChange={e => setForm({ ...form, mapLongitude: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <label className="text-xs text-gray-500">Distance from Main Road</label>
          <input type="text" value={form.distanceFromRoad} onChange={e => setForm({ ...form, distanceFromRoad: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
      </div>

      {/* Facilities */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Facilities</label>
        <div className="flex flex-wrap gap-2">
          {FACILITY_OPTIONS.map(f => (
            <button
              type="button"
              key={f}
              onClick={() => toggleFacility(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${form.facilities.includes(f) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Existing Images */}
      {form.imageUrls.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Current Images</label>
          <div className="flex flex-wrap gap-3">
            {form.imageUrls.map((url: string, i: number) => (
              <div key={i} className="relative group">
                <OptimizedImage src={url} alt={`Property ${i + 1}`} width={96} height={96} className="w-24 h-24 rounded-lg border" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload New Images */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Upload New Images</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="edit-property-images"
          />
          <label htmlFor="edit-property-images" className="cursor-pointer">
            <div className="text-3xl mb-2">📸</div>
            <p className="text-sm text-gray-600 font-medium">Click to upload new images</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP — Max 5MB each, up to 5 files</p>
          </label>
        </div>
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs">
                <span>📎 {file.name}</span>
                <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting || uploading} className="btn-primary dashboard-action flex-1 py-3 text-lg">
          {uploading ? 'Uploading images...' : submitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" onClick={onDone} className="dashboard-action px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">
          Cancel
        </button>
      </div>
    </form>
  );
}

function ApplicationsTab({ token }: { token: string }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    propertiesApi.myListings(token).then(setProperties).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (selectedPropId) {
      setAppsLoading(true);
      propertiesApi.getApplications(selectedPropId, token)
        .then(setApplications)
        .catch(() => setApplications([]))
        .finally(() => setAppsLoading(false));
    } else {
      setApplications([]);
    }
  }, [selectedPropId, token]);

  const handleStatusUpdate = async (appId: string, status: string) => {
    setUpdating(appId);
    try {
      await propertiesApi.updateApplicationStatus(appId, status, token);
      // Refresh applications
      if (selectedPropId) {
        const updated = await propertiesApi.getApplications(selectedPropId, token);
        setApplications(updated);
      }
    } catch {} finally {
      setUpdating(null);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6 fade-in">
      <div className="soft-panel border-l-4 border-l-indigo-500 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Landlord Workflow</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Rental Applications</h2>
      </div>

      {/* Property selector */}
      <div className="dashboard-card p-4">
        <label className="text-sm font-medium text-gray-700 block mb-2">Select a Property</label>
        <select
          value={selectedPropId || ''}
          onChange={(e) => setSelectedPropId(e.target.value || null)}
          className="input-field"
        >
          <option value="">-- Choose a property --</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.city} ({p.applications?.length || 0} applications)
            </option>
          ))}
        </select>
      </div>

      {/* Applications list */}
      {selectedPropId && (
        appsLoading ? (
          <p className="text-gray-500">Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 surface-card">
            <p className="text-gray-500">No applications for this property yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="dashboard-card p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{app.tenant?.fullName || 'Unknown Tenant'}</h3>
                    <p className="text-sm text-gray-500">{app.tenant?.email}</p>
                    {app.tenant?.phone && <p className="text-sm text-gray-500">📞 {app.tenant.phone}</p>}
                    {app.message && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded italic">&quot;{app.message}&quot;</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      app.status === 'approved' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {app.status}
                    </span>
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'approved')}
                          disabled={updating === app.id}
                          className="dashboard-action bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {updating === app.id ? 'Updating...' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          disabled={updating === app.id}
                          className="dashboard-action bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                        >
                          {updating === app.id ? 'Updating...' : '✕ Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function PaymentsTab({ token }: { token: string }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymentsApi.list(token);
      setPayments(data);
    } catch {} finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleViewInvoice = async (paymentId: string) => {
    try {
      const inv = await paymentsApi.invoice(paymentId, token);
      setInvoice(inv);
    } catch {}
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-4 fade-in">
      <div className="soft-panel border-l-4 border-l-cyan-500 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Landlord Finance</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Payment Records</h2>
      </div>

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

      {payments.length === 0 ? (
        <div className="surface-card border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-cyan-50/50 py-10 text-center">
          <p className="font-medium text-slate-700">No payment records yet.</p>
          <p className="mt-1 text-sm text-slate-500">Completed tenant payments will appear here automatically.</p>
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
                  <p className="text-sm text-gray-500">Tenant: {p.tenant?.fullName}</p>
                  {p.monthPeriod && <p className="text-xs text-gray-400">Period: {p.monthPeriod}</p>}
                  <p className="text-xs text-gray-400">TXN: {p.transactionId} • {new Date(p.createdAt).toLocaleDateString()}</p>
                  {p.paidAt && <p className="text-xs text-green-600">Paid: {new Date(p.paidAt).toLocaleString()}</p>}
                </div>
                <button
                  onClick={() => handleViewInvoice(p.id)}
                  className="dashboard-action inline-flex items-center justify-center rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                >
                  🧾 Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
