'use client';

import { useEffect, useState } from 'react';
import { useOrderStore, type Order } from '@/lib/store/order-store';
import { useAuthStore } from '@/lib/store/user-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/order/order-card';
import { useNotifications } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

export const OrderList: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { fetchOrders, setFilter, filteredOrders, filter, isLoading } =
    useOrderStore();
  const { playNotification } = useNotifications();
  const [lastOrderCount, setLastOrderCount] = useState(0);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          // Refetch orders when any change occurs
          fetchOrders();

          // Handle notifications based on the event type and user role
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;

            // Check if the new order has drinks (for barman)
            if (
              user?.role === 'barman' &&
              newOrder.items.some(
                (item) => item.product.type === 'drink' || !item.product.type
              )
            ) {
              playNotification('new-drinks');
            }

            // Check if the new order has food (for cook)
            if (
              user?.role === 'cook' &&
              newOrder.items.some(
                (item) => item.product.type === 'food' || !item.product.type
              )
            ) {
              playNotification('new-food');
            }
          }

          // Notify waiters when food is ready
          if (
            payload.eventType === 'UPDATE' &&
            user?.role === 'waiter' &&
            (payload.new as Order).foodReadyAt &&
            !(payload.old as Order).foodReadyAt
          ) {
            playNotification('food-ready');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.channel('orders-channel').unsubscribe();
    };
  }, [fetchOrders, user, playNotification]);

  // Default filter based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'cook') {
        setFilter('food');
      } else if (user.role === 'barman') {
        setFilter('drink');
      } else {
        setFilter('all');
      }
    }
  }, [user, setFilter]);

  const getTabForRole = () => {
    if (user?.role === 'waiter') {
      return (
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="food">Food Only</TabsTrigger>
          <TabsTrigger value="drink">Drinks Only</TabsTrigger>
        </TabsList>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Active Orders</h1>

      <Tabs
        defaultValue={filter}
        onValueChange={(value) => setFilter(value as 'all' | 'food' | 'drink')}
        className="w-full"
      >
        {getTabForRole()}

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p>Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No active orders</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="food" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p>Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No active food orders</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="drink" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p>Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No active drink orders</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
