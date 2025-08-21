'use client';

import { PropsWithChildren } from 'react';
import { AuthWrapper } from '@/components/auth-wrapper';
import { Navbar } from '@/components/layout/navbar';

export const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <AuthWrapper>
      <div className="flex flex-col h-screen">
        <Navbar />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </AuthWrapper>
  );
};
