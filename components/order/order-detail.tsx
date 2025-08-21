'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/user-store';
import { Order, useOrderStore, OrderItem } from '@/lib/store/order-store';
import { useProductStore, Product } from '@/lib/store/product-store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { X, Plus, Pencil, AlertTriangle } from 'lucide-react';

export const OrderDetail: React.FC<{ orderId: string }> = ({ orderId }) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { fetchProducts, products } = useProductStore();
  const {
    updateOrder,
    markDrinksReady,
    markFoodReady,
    markPaid,
    markCancelled,
  } = useOrderStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'food' | 'drink'>(
    'all'
  );
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch order and subscribe to changes
  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;

        setOrder(data);
        setEditedItems(data.items || []);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to fetch order');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
    fetchProducts();

    // Subscribe to changes
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(payload.new as Order);
          setEditedItems((payload.new as Order).items || []);
        }
      )
      .subscribe();

    return () => {
      supabase.channel(`order-${orderId}`).unsubscribe();
    };
  }, [orderId, fetchProducts]);

  const getOrderStatus = () => {
    if (!order) return 'Unknown';

    if (order.cancelled_at) return 'Cancelled';
    if (order.paid_at) return 'Paid';
    if (order.food_ready_at && order.drinks_ready_at) return 'Ready';
    if (order.food_ready_at) return 'Food Ready';
    if (order.drinks_ready_at) return 'Drinks Ready';
    return 'New';
  };

  const getStatusBadgeColor = () => {
    const status = getOrderStatus();
    switch (status) {
      case 'Cancelled':
        return 'bg-red-500';
      case 'Paid':
        return 'bg-green-500';
      case 'Ready':
        return 'bg-blue-500';
      case 'Food Ready':
        return 'bg-orange-500';
      case 'Drinks Ready':
        return 'bg-purple-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const handleUpdateAmount = (index: number, amount: number) => {
    if (amount < 1) return;

    const updatedItems = [...editedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      amount,
    };
    setEditedItems(updatedItems);
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    const updatedItems = [...editedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      notes,
    };
    setEditedItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...editedItems];
    updatedItems.splice(index, 1);
    setEditedItems(updatedItems);
  };

  const handleAddItem = (product: Product) => {
    const existingItemIndex = editedItems.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...editedItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        amount: updatedItems[existingItemIndex].amount + 1,
      };
      setEditedItems(updatedItems);
    } else {
      setEditedItems([
        ...editedItems,
        {
          product,
          amount: 1,
          notes: '',
        },
      ]);
    }

    setIsAddProductOpen(false);
  };

  const handleSaveChanges = async () => {
    if (!order) return;

    try {
      const success = await updateOrder(orderId, {
        items: editedItems,
      });

      if (success) {
        setIsEditing(false);
        toast.success('Order updated successfully');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const handleOrderAction = async (
    action: 'drinks-ready' | 'food-ready' | 'paid' | 'cancelled'
  ) => {
    if (!order) return;

    try {
      let success = false;

      switch (action) {
        case 'drinks-ready':
          success = await markDrinksReady(orderId);
          break;
        case 'food-ready':
          success = await markFoodReady(orderId);
          break;
        case 'paid':
          success = await markPaid(orderId);
          if (success) {
            router.push('/orders');
          }
          break;
        case 'cancelled':
          success = await markCancelled(orderId);
          if (success) {
            router.push('/orders');
          }
          break;
      }

      if (success) {
        toast.success(`Order ${action.replace('-', ' ')} successfully`);
      }
    } catch (error) {
      console.error(`Error setting order as ${action}:`, error);
      toast.error(`Failed to set order as ${action.replace('-', ' ')}`);
    }
  };

  const getFilteredItems = () => {
    if (!editedItems) return [];

    if (selectedTab === 'food') {
      return editedItems.filter(
        (item) => item.product.type === 'food' || !item.product.type
      );
    }

    if (selectedTab === 'drink') {
      return editedItems.filter(
        (item) => item.product.type === 'drink' || !item.product.type
      );
    }

    return editedItems;
  };

  const getFilteredProducts = () => {
    if (!products) return [];

    let filteredProducts = [...products];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedTab === 'food') {
      return filteredProducts.filter((p) => p.type === 'food' || !p.type);
    }

    if (selectedTab === 'drink') {
      return filteredProducts.filter((p) => p.type === 'drink' || !p.type);
    }

    return filteredProducts;
  };

  const getTotalPrice = () => {
    if (!editedItems) return 0;
    return editedItems.reduce(
      (total, item) => total + item.product.price * item.amount,
      0
    );
  };

  const getCreationTime = () => {
    if (!order?.created_at) return '';
    return format(new Date(order.created_at), 'MMM d, yyyy h:mm a');
  };

  const getWaitingTime = () => {
    if (!order?.created_at) return '';
    return formatDistanceToNow(new Date(order.created_at), {
      addSuffix: false,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-2" />
        <h2 className="text-xl font-bold">Order not found</h2>
        <p className="mt-2">
          The order you are looking for does not exist or has been deleted.
        </p>
        <Button className="mt-4" onClick={() => router.push('/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const renderOrderActions = () => {
    if (isEditing) {
      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditedItems(order.items);
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {!order.drinks_ready_at && user?.role === 'barman' && (
          <Button onClick={() => handleOrderAction('drinks-ready')}>
            Mark Drinks Ready
          </Button>
        )}

        {!order.food_ready_at && user?.role === 'cook' && (
          <Button onClick={() => handleOrderAction('food-ready')}>
            Mark Food Ready
          </Button>
        )}

        {!order.paid_at && user?.role === 'barman' && (
          <Button onClick={() => handleOrderAction('paid')}>Mark Paid</Button>
        )}

        {!order.cancelled_at && (
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={() => handleOrderAction('cancelled')}
          >
            Cancel Order
          </Button>
        )}

        {!order.paid_at && !order.cancelled_at && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="ml-auto"
          >
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Order: Table {order.table_number}
        </h1>
        <Badge className={getStatusBadgeColor()}>{getOrderStatus()}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Order Items</span>
              <span className="text-lg font-normal">
                Total: ${getTotalPrice().toFixed(2)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedTab}
              onValueChange={(value) =>
                setSelectedTab(value as 'all' | 'food' | 'drink')
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="food">Food</TabsTrigger>
                <TabsTrigger value="drink">Drinks</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0 space-y-4">
                {isEditing && (
                  <div className="flex justify-end">
                    <Dialog
                      open={isAddProductOpen}
                      onOpenChange={setIsAddProductOpen}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus size={16} className="mr-2" /> Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Product</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Search products"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <div className="max-h-80 overflow-auto space-y-2">
                            {getFilteredProducts().map((product) => (
                              <Card
                                key={product.id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => handleAddItem(product)}
                              >
                                <CardContent className="p-4 flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">
                                      {product.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      ${product.price.toFixed(2)}
                                    </div>
                                  </div>
                                  {product.type && (
                                    <Badge
                                      variant="outline"
                                      className={
                                        product.type === 'food'
                                          ? 'bg-orange-100 text-orange-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }
                                    >
                                      {product.type}
                                    </Badge>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                            {getFilteredProducts().length === 0 && (
                              <div className="text-center py-4 text-gray-500">
                                No products found
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {getFilteredItems().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No items</div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredItems().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              {!isEditing ? (
                                <span className="font-medium">
                                  {item.amount}x {item.product.name}
                                </span>
                              ) : (
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    value={item.amount}
                                    min="1"
                                    onChange={(e) =>
                                      handleUpdateAmount(
                                        index,
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="w-16 mr-2"
                                  />
                                  <span className="font-medium">
                                    {item.product.name}
                                  </span>
                                </div>
                              )}

                              {item.product.type && (
                                <Badge
                                  variant="outline"
                                  className={`ml-2 ${
                                    item.product.type === 'food'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {item.product.type}
                                </Badge>
                              )}
                            </div>

                            {isEditing ? (
                              <Input
                                placeholder="Add notes"
                                value={item.notes || ''}
                                onChange={(e) =>
                                  handleUpdateNotes(index, e.target.value)
                                }
                                className="mt-2"
                              />
                            ) : (
                              item.notes && (
                                <div className="text-sm text-gray-500 mt-1">
                                  Notes: {item.notes}
                                </div>
                              )
                            )}
                          </div>

                          <div className="text-right">
                            <div>
                              ${(item.product.price * item.amount).toFixed(2)}
                            </div>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-red-500 mt-1"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="food" className="mt-0 space-y-4">
                {/* Food items with the same structure */}
                {getFilteredItems().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No food items
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredItems().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              {!isEditing ? (
                                <span className="font-medium">
                                  {item.amount}x {item.product.name}
                                </span>
                              ) : (
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    value={item.amount}
                                    min="1"
                                    onChange={(e) =>
                                      handleUpdateAmount(
                                        index,
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="w-16 mr-2"
                                  />
                                  <span className="font-medium">
                                    {item.product.name}
                                  </span>
                                </div>
                              )}

                              {item.product.type && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 bg-orange-100 text-orange-800"
                                >
                                  {item.product.type}
                                </Badge>
                              )}
                            </div>

                            {isEditing ? (
                              <Input
                                placeholder="Add notes"
                                value={item.notes || ''}
                                onChange={(e) =>
                                  handleUpdateNotes(index, e.target.value)
                                }
                                className="mt-2"
                              />
                            ) : (
                              item.notes && (
                                <div className="text-sm text-gray-500 mt-1">
                                  Notes: {item.notes}
                                </div>
                              )
                            )}
                          </div>

                          <div className="text-right">
                            <div>
                              ${(item.product.price * item.amount).toFixed(2)}
                            </div>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-red-500 mt-1"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="drink" className="mt-0 space-y-4">
                {/* Drink items with the same structure */}
                {getFilteredItems().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No drink items
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredItems().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              {!isEditing ? (
                                <span className="font-medium">
                                  {item.amount}x {item.product.name}
                                </span>
                              ) : (
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    value={item.amount}
                                    min="1"
                                    onChange={(e) =>
                                      handleUpdateAmount(
                                        index,
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="w-16 mr-2"
                                  />
                                  <span className="font-medium">
                                    {item.product.name}
                                  </span>
                                </div>
                              )}

                              {item.product.type && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 bg-blue-100 text-blue-800"
                                >
                                  {item.product.type}
                                </Badge>
                              )}
                            </div>

                            {isEditing ? (
                              <Input
                                placeholder="Add notes"
                                value={item.notes || ''}
                                onChange={(e) =>
                                  handleUpdateNotes(index, e.target.value)
                                }
                                className="mt-2"
                              />
                            ) : (
                              item.notes && (
                                <div className="text-sm text-gray-500 mt-1">
                                  Notes: {item.notes}
                                </div>
                              )
                            )}
                          </div>

                          <div className="text-right">
                            <div>
                              ${(item.product.price * item.amount).toFixed(2)}
                            </div>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-red-500 mt-1"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>{renderOrderActions()}</CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Table</div>
              <div className="font-medium">{order.table_number}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">
                Created By
              </div>
              <div className="font-medium">{order.created_by}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">
                Created At
              </div>
              <div className="font-medium">{getCreationTime()}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">
                Waiting Time
              </div>
              <div className="font-medium">{getWaitingTime()}</div>
            </div>

            {order.drinks_ready_at && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Drinks Ready At
                </div>
                <div className="font-medium">
                  {format(
                    new Date(order.drinks_ready_at),
                    'MMM d, yyyy h:mm a'
                  )}
                </div>
              </div>
            )}

            {order.food_ready_at && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Food Ready At
                </div>
                <div className="font-medium">
                  {format(new Date(order.food_ready_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            )}

            {order.paid_at && (
              <div>
                <div className="text-sm font-medium text-gray-500">Paid At</div>
                <div className="font-medium">
                  {format(new Date(order.paid_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            )}

            {order.cancelled_at && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Cancelled At
                </div>
                <div className="font-medium">
                  {format(new Date(order.cancelled_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/orders')}>
          Back to Orders
        </Button>
      </div>
    </div>
  );
};
