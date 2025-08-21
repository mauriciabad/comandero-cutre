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
import { ItemTypeIcon } from '@/components/ui/item-type-icon';
import { Martini, ChefHat, CreditCard } from 'lucide-react';

export const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const user = useAuthStore((state) => state.user);
  const { markDrinksReady, markFoodReady, markPaid } = useOrderStore();

  const [waitingTime, setWaitingTime] = useState('');

  // Update waiting time every minute
  useEffect(() => {
    const updateWaitingTime = () => {
      setWaitingTime(
        formatDistanceToNow(new Date(order.created_at), { addSuffix: false })
      );
    };

    updateWaitingTime();
    const interval = setInterval(updateWaitingTime, 60_000);

    return () => clearInterval(interval);
  }, [order.created_at]);

  const renderActionButtons = () => {
    const hasDrinks = order.items.some(
      (item) => item.product.type === 'drink' || !item.product.type
    );
    const hasFood = order.items.some(
      (item) => item.product.type === 'food' || !item.product.type
    );

    return (
      <div className="flex flex-wrap gap-1">
        {/* Bebidas - Always in first position */}
        {hasDrinks &&
          (!order.drinks_ready_at ? (
            <Button
              onClick={() => markDrinksReady(order.id)}
              size="sm"
              variant="outline"
              className="text-xs px-2 py-1 h-7 border-gray-300 hover:bg-gray-50"
            >
              <Martini className="w-3 h-3 mr-1" />
              Bebidas
            </Button>
          ) : (
            <Badge
              variant="secondary"
              className="text-xs bg-gray-100 text-gray-600"
            >
              <Martini className="w-3 h-3 mr-1" />
              Bebidas
            </Badge>
          ))}

        {/* Comida - Always in second position */}
        {hasFood &&
          (!order.food_ready_at ? (
            <Button
              onClick={() => markFoodReady(order.id)}
              size="sm"
              variant="outline"
              className="text-xs px-2 py-1 h-7 border-gray-300 hover:bg-gray-50"
            >
              <ChefHat className="w-3 h-3 mr-1" />
              Comida
            </Button>
          ) : (
            <Badge
              variant="secondary"
              className="text-xs bg-gray-100 text-gray-600"
            >
              <ChefHat className="w-3 h-3 mr-1" />
              Comida
            </Badge>
          ))}

        {/* Pagado - Always in third position */}
        {!order.paid_at ? (
          <Button
            onClick={() => markPaid(order.id)}
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 h-7 border-gray-300 hover:bg-gray-50"
          >
            <CreditCard className="w-3 h-3 mr-1" />
            Pagado
          </Button>
        ) : (
          <Badge
            variant="secondary"
            className="text-xs bg-gray-100 text-gray-600"
          >
            <CreditCard className="w-3 h-3 mr-1" />
            Pagado
          </Badge>
        )}
      </div>
    );
  };

  const getTotalPrice = () => {
    return order.items.reduce(
      (total, item) => total + item.product.price * item.amount,
      0
    );
  };

  const renderOrderItems = () => {
    return (
      <div className="space-y-2 max-h-40 overflow-auto">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <ItemTypeIcon type={item.product.type} className="mr-1" />
              <span className="font-medium">{item.amount}x</span>
              <span className="ml-2">{item.product.name}</span>
            </div>
            <span>{(item.product.price * item.amount).toFixed(2)}€</span>
          </div>
        ))}
      </div>
    );
  };

  const getStatusBadge = () => {
    if (order.cancelled_at) {
      return <Badge className="bg-red-500 text-white">Cancelado</Badge>;
    }

    if (order.paid_at) {
      return <Badge className="bg-purple-500 text-white">Completado</Badge>;
    }

    const hasDrinks = order.items.some(
      (item) => item.product.type === 'drink' || !item.product.type
    );
    const hasFood = order.items.some(
      (item) => item.product.type === 'food' || !item.product.type
    );

    // If both types exist and both are ready
    if (hasDrinks && hasFood && order.drinks_ready_at && order.food_ready_at) {
      return <Badge className="bg-green-500 text-white">Falta pagar</Badge>;
    }

    // If only drinks exist and they're ready
    if (hasDrinks && !hasFood && order.drinks_ready_at) {
      return <Badge className="bg-green-500 text-white">Falta pagar</Badge>;
    }

    // If only food exists and it's ready
    if (hasFood && !hasDrinks && order.food_ready_at) {
      return <Badge className="bg-green-500 text-white">Falta pagar</Badge>;
    }

    // If drinks exist and are ready, but food is still cooking
    if (hasDrinks && hasFood && order.drinks_ready_at && !order.food_ready_at) {
      return (
        <Badge className="bg-orange-500 text-white">Esperando comida</Badge>
      );
    }

    // If food exists and is ready, but drinks are still being prepared
    if (hasFood && hasDrinks && order.food_ready_at && !order.drinks_ready_at) {
      return (
        <Badge className="bg-blue-500 text-white">Esperando bebidas</Badge>
      );
    }

    // Initial state - waiting for whatever exists
    if (hasDrinks && !hasFood) {
      return (
        <Badge className="bg-yellow-500 text-white">Esperando bebidas</Badge>
      );
    }
    if (hasFood && !hasDrinks) {
      return (
        <Badge className="bg-yellow-500 text-white">Esperando comida</Badge>
      );
    }

    return (
      <Badge className="bg-yellow-500 text-white">Esperando bebidas</Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <Link href={`/orders/${order.id}`} className="block">
        <CardHeader className="flex justify-between items-start cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg">
          <CardTitle className="text-lg leading-none">
            Mesa {order.table_number}
          </CardTitle>
          {getStatusBadge()}
        </CardHeader>
        <CardContent className="flex-grow cursor-pointer hover:bg-gray-50 transition-colors">
          {renderOrderItems()}
        </CardContent>
      </Link>

      <CardFooter className="flex flex-col border-t pt-4 space-y-2">
        <div className="flex justify-between w-full">
          <div className="text-sm text-gray-500">
            {(!order.drinks_ready_at ||
              !order.food_ready_at ||
              !order.paid_at ||
              !order.cancelled_at) && (
              <>
                Esperando{' '}
                {order.drinks_ready_at && !order.food_ready_at
                  ? 'comida'
                  : null}
                : {waitingTime}
              </>
            )}
          </div>
          <div className="font-bold">{getTotalPrice().toFixed(2)}€</div>
        </div>
        <div className="w-full">{renderActionButtons()}</div>
      </CardFooter>
    </Card>
  );
};
