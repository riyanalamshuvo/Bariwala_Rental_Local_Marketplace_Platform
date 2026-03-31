'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { propertiesApi } from '@/lib/api';
import { useDebounce, useFilterParams } from '@/lib/hooks';
import { GridSkeleton } from '@/components/Skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  propertyType: string;
  imageUrls: string[];
  advanceDeposit?: number;
  mapLatitude?: number;
  mapLongitude?: number;
  distanceFromRoad?: string;
  facilities?: string[];
  landlord?: { fullName: string };
}

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'flat', label: 'Flat' },
  { value: 'room', label: 'Room' },
  { value: 'sublet', label: 'Sublet' },
];

/** Memoized property card — only re-renders when its data changes */
const PropertyCard = memo(function PropertyCard({ p }: { p: Property }) {
  return (
    <Link href={`/properties/${p.id}`} prefetch={false}>
      <div className="surface-card overflow-hidden cursor-pointer h-full group hover:-translate-y-1 transition duration-200">
        <OptimizedImage
          src={p.imageUrls?.[0]}
          alt={p.title}
          fallback="🏠"
          fill
          className="h-48 w-full transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">{p.title}</h3>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full capitalize whitespace-nowrap ml-2">
              {p.propertyType}
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-2 line-clamp-1">📍 {p.address}, {p.city}</p>
          <div className="flex gap-3 text-sm text-gray-600 mb-3">
            <span>🛏 {p.bedrooms} bed</span>
            <span>🚿 {p.bathrooms} bath</span>
            {p.areaSqft > 0 && <span>📐 {p.areaSqft} sqft</span>}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-700 font-bold text-lg">৳{Number(p.rentAmount).toLocaleString()}/mo</span>
            {p.landlord && (
              <span className="text-xs text-gray-400">by {p.landlord.fullName}</span>
            )}
          </div>
          <p className="mt-3 text-xs font-medium text-emerald-700">View details →</p>
        </div>
      </div>
    </Link>
  );
});

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');

  // Debounce search input — fires API call 400ms after user stops typing
  const debouncedSearch = useDebounce(search, 400);

  const params = useFilterParams({
    search: debouncedSearch,
    city,
    type,
    minRent,
    maxRent,
  });

  const fetchProperties = useCallback(async (queryParams?: string) => {
    setLoading(true);
    try {
      const data = await propertiesApi.list(queryParams ?? params);
      setProperties(data);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Auto-fetch when debounced filters change
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setCity('');
    setType('');
    setMinRent('');
    setMaxRent('');
  }, []);

  const activeFilterCount = [search, city, type, minRent, maxRent].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
      <div className="surface-card mb-6 border-l-4 border-l-indigo-600 p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-700 font-semibold">Rental Explorer</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mt-1">🏠 Browse Properties</h1>
            <p className="text-sm text-gray-600 mt-2">Discover verified rentals with smart filters and compare listings faster.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700 font-medium">
            <span>🔎</span>
            <span>{activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      <div className="soft-panel p-4 mb-8 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by area, address, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1"
          />
          <button
            onClick={() => fetchProperties()}
            className="btn-primary px-6"
          >
            🔍 Search
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field flex-1"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input-field max-w-40"
          >
            {PROPERTY_TYPES.map((propertyType) => (
              <option key={propertyType.value || 'all'} value={propertyType.value}>
                {propertyType.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Rent (৳)"
            value={minRent}
            onChange={(e) => setMinRent(e.target.value)}
            className="input-field w-36"
          />
          <input
            type="number"
            placeholder="Max Rent (৳)"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
            className="input-field w-36"
          />
          <button
            onClick={clearFilters}
            className="btn-secondary text-sm whitespace-nowrap"
          >
            Clear All
          </button>
        </div>

        {!loading && (
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{properties.length}</span> result{properties.length === 1 ? '' : 's'}
          </p>
        )}
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : properties.length === 0 ? (
        <div className="surface-card text-center py-16 text-gray-500">
          <p className="text-xl">No properties found</p>
          <p className="text-sm mt-2">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
