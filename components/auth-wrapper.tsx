'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/user-store';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';

export const AuthWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
};
