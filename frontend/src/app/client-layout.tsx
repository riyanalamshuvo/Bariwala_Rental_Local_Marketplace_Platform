'use client';

import { AuthProvider } from '@/lib/auth-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="app-page-bg relative flex-1 overflow-hidden">
        <div className="relative z-10">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
      <Footer />
    </AuthProvider>
  );
}
