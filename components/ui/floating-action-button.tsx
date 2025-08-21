'use client';

import { FC } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const FloatingActionButton: FC = () => {
  return (
    <Link
      href="/orders/new"
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'flex items-center justify-center',
        'w-16 h-16 rounded-full',
        'bg-blue-600 hover:bg-blue-700',
        'text-white shadow-lg',
        'transition-all duration-200',
        'hover:scale-110 hover:shadow-xl',
        'focus:outline-none focus:ring-4 focus:ring-blue-300'
      )}
      aria-label="Crear nuevo pedido"
    >
      <Plus className="w-8 h-8" />
    </Link>
  );
};
