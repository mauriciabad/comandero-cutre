'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { NewOrderForm } from '@/components/order/new-order-form';

export default function NewOrderPage() {
  return (
    <AppLayout>
      <NewOrderForm />
    </AppLayout>
  );
}
