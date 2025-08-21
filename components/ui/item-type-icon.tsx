'use client';

import { FC } from 'react';
import { ChefHat, Martini, Shell } from 'lucide-react';
import { cn } from '@/lib/utils';

type ItemTypeIconProps = {
  type: 'food' | 'drink' | null | undefined;
  className?: string;
};

export const ItemTypeIcon: FC<ItemTypeIconProps> = ({ type, className }) => {
  const baseClassName = 'size-4';

  switch (type) {
    case 'food':
      return (
        <ChefHat className={cn(baseClassName, 'text-orange-500', className)} />
      );
    case 'drink':
      return (
        <Martini className={cn(baseClassName, 'text-blue-500', className)} />
      );
    default:
      return (
        <Shell className={cn(baseClassName, 'text-gray-300', className)} />
      );
  }
};
