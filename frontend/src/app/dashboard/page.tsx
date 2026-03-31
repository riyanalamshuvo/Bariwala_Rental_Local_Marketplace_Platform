'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PageSpinner } from '@/components/Skeleton';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    // Redirect to role-specific dashboard
    switch (user.role) {
      case 'landlord':
        router.replace('/dashboard/landlord');
        break;
      case 'tenant':
        router.replace('/dashboard/tenant');
        break;
      case 'buyer_seller':
        router.replace('/dashboard/marketplace');
        break;
      case 'admin':
        router.replace('/dashboard/admin');
        break;
      default:
        router.replace('/dashboard/tenant');
    }
  }, [authLoading, user, router]);

  return (
    <div className="dashboard-readable min-h-[60vh] flex items-center justify-center">
      <div className="surface-card w-full max-w-sm p-4">
        <PageSpinner text="Redirecting to your dashboard..." />
      </div>
    </div>
  );
}
