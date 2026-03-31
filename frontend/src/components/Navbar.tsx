'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, memo } from 'react';
import { useAuth } from '@/lib/auth-context';
import BrandLogo from '@/components/BrandLogo';

export default memo(function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/properties', label: 'Properties' },
    { href: '/marketplace', label: 'Marketplace' },
  ];

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const handleLogout = useCallback(() => { logout(); setMenuOpen(false); }, [logout]);

  const linkClass = useCallback((href: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return `rounded-lg px-3 py-2 text-sm font-medium transition ${
      active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-700'
    }`;
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <BrandLogo />

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/dashboard" className={linkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link href="/messages" className={linkClass('/messages')}>
                  Messages
                </Link>
                <div className="ml-2 flex items-center gap-2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 flex items-center gap-1">
                    {user.fullName}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-emerald-50'}`}>
                      {user.role === 'buyer_seller' ? 'B/S' : user.role?.charAt(0).toUpperCase()}
                    </span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="ml-2 flex gap-2">
                <Link
                  href="/login"
                  className={`px-4 py-2 text-sm ${linkClass('/login')}`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden rounded-lg border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-100 transition"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2 fade-in">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`block ${linkClass(link.href)}`} onClick={closeMenu}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/dashboard" className={`block ${linkClass('/dashboard')}`} onClick={closeMenu}>
                  Dashboard
                </Link>
                <Link href="/messages" className={`block ${linkClass('/messages')}`} onClick={closeMenu}>
                  Messages
                </Link>
                <button onClick={handleLogout} className="w-full rounded-lg bg-red-50 px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-100">
                  Logout • {user.fullName}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`block ${linkClass('/login')}`} onClick={closeMenu}>
                  Login
                </Link>
                <Link href="/register" className="btn-primary w-full" onClick={closeMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
});
