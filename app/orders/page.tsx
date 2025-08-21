'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { OrderList } from '@/components/order/order-list';

export default function OrdersPage() {
  return (
    <AppLayout>
      <OrderList />
    </AppLayout>
  );
}
