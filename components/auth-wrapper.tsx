'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/user-store';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';

export const AuthWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getUserProfile = useAuthStore((state) => state.getUserProfile);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      await getUserProfile();
      setIsLoading(false);
    }

    checkAuth();
  }, [getUserProfile]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // If loading or not authenticated, don't render children
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
};
