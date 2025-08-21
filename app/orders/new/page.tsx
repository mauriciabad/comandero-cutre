'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { NewOrderForm } from '@/components/order/new-order-form';

export default function NewOrderPage() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Crear pedido</h1>
      <NewOrderForm />
    </AppLayout>
  );
}
