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
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, AlertTriangle, Search, Trash2 } from 'lucide-react';
import { ItemTypeIcon } from '@/components/ui/item-type-icon';
import { cn } from '@/lib/utils';

export const OrderDetail: React.FC<{ orderId: string }> = ({ orderId }) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { fetchProducts, products, searchProducts } = useProductStore();
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
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

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
        toast.error('Error al obtener el pedido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
    fetchProducts();

    // Subscribe to changes
    supabase
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

  // Filter products based on search query
  useEffect(() => {
    if (!isEditing) return;

    if (products) {
      let filtered = [...products];

      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(lowerQuery)
        );
      }

      setFilteredProducts(filtered);
    }
  }, [searchQuery, products, isEditing]);

  const getOrderStatus = () => {
    if (!order) return 'Desconocido';

    if (order.cancelled_at) return 'Cancelado';
    if (order.paid_at) return 'Pagado';
    if (order.food_ready_at && order.drinks_ready_at) return 'Listo';
    if (order.food_ready_at) return 'Comida Lista';
    if (order.drinks_ready_at) return 'Bebidas Listas';
    return 'Nuevo';
  };

  const getStatusBadgeColor = () => {
    const status = getOrderStatus();
    switch (status) {
      case 'Cancelado':
        return 'bg-red-500';
      case 'Pagado':
        return 'bg-green-500';
      case 'Listo':
        return 'bg-blue-500';
      case 'Comida Lista':
        return 'bg-orange-500';
      case 'Bebidas Listas':
        return 'bg-purple-500';
      default:
        return 'bg-yellow-500';
    }
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
      toast.success(`+1 ${product.name}`);
    } else {
      setEditedItems([
        ...editedItems,
        {
          product,
          amount: 1,
          notes: '',
        },
      ]);
      toast.success(`+1 ${product.name}`);
    }

    setIsAddProductOpen(false);
  };

  const handleUpdateAmount = (index: number, amount: number, delta: number) => {
    if (amount < 1) return;

    toast.success(
      `${delta > 0 ? '+' : ''}${delta} ${editedItems[index].product.name}`
    );

    const updatedItems = [...editedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      amount,
    };
    setEditedItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const item = editedItems[index];
    toast.success(`-${item.amount} ${item.product.name}`);

    const updatedItems = [...editedItems];
    updatedItems.splice(index, 1);
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

  const handleSaveChanges = async () => {
    if (!order) return;

    try {
      const success = await updateOrder(orderId, {
        items: editedItems,
      });

      if (success) {
        setIsEditing(false);
        toast.success('Pedido actualizado exitosamente');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el pedido');
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
        const actionMessages = {
          'drinks-ready': 'bebidas listas',
          'food-ready': 'comida lista',
          paid: 'pagado',
          cancelled: 'cancelado',
        };
        toast.success(
          `Pedido marcado como ${actionMessages[action]} exitosamente`
        );
      }
    } catch (error) {
      console.error(`Error setting order as ${action}:`, error);
      const actionMessages = {
        'drinks-ready': 'bebidas listas',
        'food-ready': 'comida lista',
        paid: 'pagado',
        cancelled: 'cancelado',
      };
      toast.error(`Error al marcar el pedido como ${actionMessages[action]}`);
    }
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
    return <div className="text-center py-8">Cargando pedido...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-2" />
        <h2 className="text-xl font-bold">Pedido no encontrado</h2>
        <p className="mt-2">
          El pedido que buscas no existe o ha sido eliminado.
        </p>
        <Button className="mt-4" onClick={() => router.push('/orders')}>
          Volver a Pedidos
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
            Cancelar
          </Button>
          <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {!order.drinks_ready_at && user?.role === 'barman' && (
          <Button onClick={() => handleOrderAction('drinks-ready')}>
            Marcar Bebidas Listas
          </Button>
        )}

        {!order.food_ready_at && user?.role === 'cook' && (
          <Button onClick={() => handleOrderAction('food-ready')}>
            Marcar Comida Lista
          </Button>
        )}

        {!order.paid_at && user?.role === 'barman' && (
          <Button onClick={() => handleOrderAction('paid')}>
            Marcar Pagado
          </Button>
        )}

        {!order.cancelled_at && (
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={() => handleOrderAction('cancelled')}
          >
            Cancelar Pedido
          </Button>
        )}

        {!order.paid_at && !order.cancelled_at && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="ml-auto"
          >
            <Pencil className="w-4 h-4 mr-2" /> Editar
          </Button>
        )}
      </div>
    );
  };

  const renderEditingInterface = () => {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredProducts.length > 0) {
                  handleAddItem(filteredProducts[0]);
                }
              }}
              placeholder="Buscar productos"
              className="pl-10"
              autoFocus
            />
          </div>
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                <Plus size={18} className="mr-1" />
                Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear y añadir producto</DialogTitle>
              </DialogHeader>
              <NewProductForm onSuccess={() => setIsAddProductOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="max-h-[30vh] overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-gray-50 transition select-none'
              )}
              onClick={() => handleAddItem(product)}
            >
              <div className="flex flex-row items-center w-full">
                <ItemTypeIcon type={product.type} className="mr-2" />
                <span className="font-medium">{product.name}</span>
                <span className="font-bold ml-auto">
                  {product.price.toFixed(2)}€
                </span>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && searchQuery && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Pedido: Mesa {order.table_number}
        </h1>
        <Badge className={getStatusBadgeColor()}>{getOrderStatus()}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Productos del Pedido</span>
              <span className="text-lg font-normal">
                Total: {getTotalPrice().toFixed(2)}€
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              renderEditingInterface()
            ) : (
              <>
                {editedItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay productos
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editedItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center py-1 px-4 bg-gray-50 rounded-lg"
                      >
                        <ItemTypeIcon
                          type={item.product.type}
                          className="text-gray-400 mr-2"
                        />
                        <span className="font-medium text-sm flex-1">
                          <span className="text-gray-400 font-semibold mr-2">
                            {item.amount}
                          </span>
                          {item.product.name}
                          {item.notes && (
                            <span className="text-xs text-gray-500 block ml-5">
                              Nota: {item.notes}
                            </span>
                          )}
                        </span>
                        <span className="font-bold">
                          {(item.product.price * item.amount).toFixed(2)}€
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {isEditing && editedItems.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  Seleccionados
                </h3>
                <div className="space-y-2">
                  {editedItems.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center py-1 px-4 bg-gray-50 rounded-lg">
                        <ItemTypeIcon
                          type={item.product.type}
                          className="text-gray-400 mr-2"
                        />
                        <span className="font-medium text-sm flex-1">
                          <span className="text-gray-400 font-semibold mr-2">
                            {item.amount}
                          </span>
                          {item.product.name}
                        </span>

                        <div className="flex items-center bg-white border border-gray-200 rounded-full px-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full"
                            onClick={() =>
                              item.amount === 1
                                ? handleRemoveItem(index)
                                : handleUpdateAmount(index, item.amount - 1, -1)
                            }
                          >
                            {item.amount === 1 ? (
                              <Trash2 className="size-3.5" />
                            ) : (
                              '-'
                            )}
                          </Button>
                          <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                            {item.amount}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full"
                            onClick={() =>
                              handleUpdateAmount(index, item.amount + 1, +1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="ml-8 mr-2">
                        <Input
                          placeholder="Nota"
                          value={item.notes || ''}
                          onChange={(e) =>
                            handleUpdateNotes(index, e.target.value)
                          }
                          className="h-8 text-xs w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>{renderOrderActions()}</CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Mesa</div>
              <div className="font-medium">{order.table_number}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">
                Creado Por
              </div>
              <div className="font-medium">{order.created_by}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Creado En</div>
              <div className="font-medium">{getCreationTime()}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">
                Tiempo de Espera
              </div>
              <div className="font-medium">{getWaitingTime()}</div>
            </div>

            {order.drinks_ready_at && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Bebidas Listas En
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
                  Comida Lista En
                </div>
                <div className="font-medium">
                  {format(new Date(order.food_ready_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            )}

            {order.paid_at && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Pagado En
                </div>
                <div className="font-medium">
                  {format(new Date(order.paid_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            )}

            {order.cancelled_at && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Cancelado En
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
          Volver a Pedidos
        </Button>
      </div>
    </div>
  );
};

// Helper component to reuse the product form component
const NewProductForm: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  return (
    <div className="text-center p-4">
      <p className="text-gray-500">Funcionalidad no implementada</p>
      <Button onClick={onSuccess} className="mt-2">
        Cerrar
      </Button>
    </div>
  );
};
