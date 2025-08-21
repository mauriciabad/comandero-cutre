'use client';

import { useAuthStore } from '@/lib/store/user-store';
import { useOrderStore, type Order, OrderItem } from '@/lib/store/order-store';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const user = useAuthStore((state) => state.user);
  const { markDrinksReady, markFoodReady } = useOrderStore();

  const [waitingTime, setWaitingTime] = useState('');

  // Update waiting time every minute
  useEffect(() => {
    const updateWaitingTime = () => {
      setWaitingTime(
        formatDistanceToNow(new Date(order.created_at), { addSuffix: false })
      );
    };

    updateWaitingTime();
    const interval = setInterval(updateWaitingTime, 60000);

    return () => clearInterval(interval);
  }, [order.created_at]);

  const renderActionButtons = () => {
    if (user?.role === 'barman' && !order.drinks_ready_at) {
      const hasDrinks = order.items.some(
        (item) => item.product.type === 'drink' || !item.product.type
      );

      if (hasDrinks) {
        return (
          <Button
            onClick={() => markDrinksReady(order.id)}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Drinks Ready
          </Button>
        );
      }
    }

    if (user?.role === 'cook' && !order.food_ready_at) {
      const hasFood = order.items.some(
        (item) => item.product.type === 'food' || !item.product.type
      );

      if (hasFood) {
        return (
          <Button
            onClick={() => markFoodReady(order.id)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Food Ready
          </Button>
        );
      }
    }

    return (
      <Link href={`/orders/${order.id}`}>
        <Button variant="outline">View Details</Button>
      </Link>
    );
  };

  const getTotalPrice = () => {
    return order.items.reduce(
      (total, item) => total + item.product.price * item.amount,
      0
    );
  };

  const renderOrderItems = () => {
    const groupedByType: Record<string, OrderItem[]> = {
      food: [],
      drink: [],
      other: [],
    };

    order.items.forEach((item) => {
      if (item.product.type === 'food') {
        groupedByType.food.push(item);
      } else if (item.product.type === 'drink') {
        groupedByType.drink.push(item);
      } else {
        groupedByType.other.push(item);
      }
    });

    // Display based on user role
    let itemsToShow = [...order.items];
    if (user?.role === 'cook') {
      itemsToShow = [...groupedByType.food, ...groupedByType.other];
    } else if (user?.role === 'barman') {
      itemsToShow = [...groupedByType.drink, ...groupedByType.other];
    }

    return (
      <div className="space-y-2 max-h-40 overflow-auto">
        {itemsToShow.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="font-medium">{item.amount}x</span>
              <span className="ml-2">{item.product.name}</span>
              {item.product.type && (
                <Badge
                  className={`ml-2 ${
                    item.product.type === 'food'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                  variant="outline"
                >
                  {item.product.type}
                </Badge>
              )}
            </div>
            <span>${(item.product.price * item.amount).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  };

  const getStatusBadge = () => {
    if (order.food_ready_at && order.drinks_ready_at) {
      return <Badge className="bg-green-500">Ready</Badge>;
    }

    if (order.food_ready_at) {
      return <Badge className="bg-orange-500">Food Ready</Badge>;
    }

    if (order.drinks_ready_at) {
      return <Badge className="bg-blue-500">Drinks Ready</Badge>;
    }

    return <Badge className="bg-yellow-500">Preparing</Badge>;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Table {order.table_number}
            </CardTitle>
            <div className="text-sm text-gray-500">By {order.created_by}</div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">{renderOrderItems()}</CardContent>
      <CardFooter className="flex flex-col border-t pt-4 space-y-2">
        <div className="flex justify-between w-full">
          <div className="text-sm text-gray-500">Waiting: {waitingTime}</div>
          <div className="font-bold">${getTotalPrice().toFixed(2)}</div>
        </div>
        <div className="w-full">{renderActionButtons()}</div>
      </CardFooter>
    </Card>
  );
};
