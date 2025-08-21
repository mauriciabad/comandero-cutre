'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { OrderDetail } from '@/components/order/order-detail';
import { useParams } from 'next/navigation';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  return (
    <AppLayout>
      <OrderDetail orderId={orderId} />
    </AppLayout>
  );
}
