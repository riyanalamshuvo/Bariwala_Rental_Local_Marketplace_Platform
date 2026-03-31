'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { marketplaceApi } from '@/lib/api';
import { useDebounce, useFilterParams } from '@/lib/hooks';
import { GridSkeleton } from '@/components/Skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  city: string;
  imageUrls: string[];
  seller?: { fullName: string };
  isSold: boolean;
}

const CATEGORIES = ['electronics', 'furniture', 'clothing', 'vehicles', 'books', 'services', 'other'];
const CONDITIONS = ['new', 'like_new', 'used', 'fair'];

/** Memoized marketplace item card */
const ItemCard = memo(function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/marketplace/${item.id}`} prefetch={false}>
      <div className="surface-card overflow-hidden cursor-pointer h-full group hover:-translate-y-1 transition duration-200">
        <OptimizedImage
          src={item.imageUrls?.[0]}
          alt={item.title}
          fallback="📦"
          fill
          className="h-44 w-full transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-800 line-clamp-1">{item.title}</h3>
            <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${item.isSold ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {item.isSold ? 'SOLD' : 'AVAILABLE'}
            </span>
          </div>
          <div className="flex gap-2 mt-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded capitalize">{item.category}</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded capitalize">{item.condition?.replace('_', ' ')}</span>
          </div>
          {item.city && <p className="text-gray-500 text-xs mb-2">📍 {item.city}</p>}
          <div className="flex justify-between items-center">
            <span className="text-emerald-700 font-bold text-lg">৳{Number(item.price).toLocaleString()}</span>
            {item.seller && <span className="text-xs text-gray-400">{item.seller.fullName}</span>}
          </div>
          <p className="mt-3 text-xs font-medium text-emerald-700">View item →</p>
        </div>
      </div>
    </Link>
  );
});

export default function MarketplacePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const params = useFilterParams({
    search: debouncedSearch,
    category,
    condition,
    city,
    minPrice,
    maxPrice,
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await marketplaceApi.list(params);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setCity('');
    setCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
  }, []);

  const activeFilterCount = [search, category, condition, city, minPrice, maxPrice].filter(Boolean).length;
  const availableCount = items.filter((item) => !item.isSold).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
      <div className="surface-card mb-6 border-l-4 border-l-cyan-600 p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-700 font-semibold">Community Trade Hub</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mt-1">🛒 Local Marketplace</h1>
            <p className="text-sm text-gray-600 mt-2">Buy and sell locally with faster search, trusted listings, and cleaner browsing.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-700 font-medium">
              <span>🧭</span>
              <span>{activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium">
              <span>✅</span>
              <span>{availableCount} available item{availableCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="soft-panel p-4 mb-8 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search items by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1"
          />
          <button
            onClick={fetchItems}
            className="btn-primary px-6"
          >
            🔍 Search
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field flex-1 min-w-[120px]"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field max-w-48"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="input-field max-w-44"
          >
            <option value="">All Conditions</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c} className="capitalize">{c.replace('_', ' ')}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Price (৳)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input-field w-32"
          />
          <input
            type="number"
            placeholder="Max Price (৳)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input-field w-32"
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
            Showing <span className="font-semibold text-gray-700">{items.length}</span> item{items.length === 1 ? '' : 's'} · <span className="font-semibold text-emerald-700">{availableCount}</span> available
          </p>
        )}
      </div>

      {loading ? (
        <GridSkeleton count={8} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
      ) : items.length === 0 ? (
        <div className="surface-card text-center py-16 text-gray-500">
          <p className="text-xl">No items found</p>
          <p className="text-sm mt-2">Try different filters or list your own item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
