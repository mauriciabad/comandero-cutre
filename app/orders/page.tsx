'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { OrderList } from '@/components/order/order-list';
import { FloatingActionButton } from '@/components/ui/floating-action-button';

export default function OrdersPage() {
  return (
    <AppLayout>
      <OrderList />
      <FloatingActionButton />
    </AppLayout>
  );
}
