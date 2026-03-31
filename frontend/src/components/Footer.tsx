import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-gray-200 bg-white/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-3">
          <div>
            <BrandLogo className="mb-2" />
            <p className="text-sm text-gray-600">
              Your trusted platform for rental properties and local marketplace.
              Find homes, connect with landlords, buy & sell locally.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-gray-800">Quick Links</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><Link href="/properties" className="transition hover:text-indigo-700">Browse Properties</Link></li>
              <li><Link href="/marketplace" className="transition hover:text-indigo-700">Marketplace</Link></li>
              <li><Link href="/register" className="transition hover:text-indigo-700">Create Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-gray-800">Contact</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>Email: support@bariwala.com</li>
              <li>Phone: +880 1700-000000</li>
              <li>Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Bariwala. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
