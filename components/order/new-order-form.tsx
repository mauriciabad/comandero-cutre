'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/user-store';
import { useProductStore } from '@/lib/store/product-store';
import { useOrderStore, OrderItem, Product } from '@/lib/store/order-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { NewProductForm } from '@/components/product/new-product-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ItemTypeIcon } from '@/components/ui/item-type-icon';
import { Plus, Search, ChevronLeft, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NewOrderForm: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { products, fetchProducts, searchProducts } = useProductStore();
  const { createOrder } = useOrderStore();

  const [step, setStep] = useState<'table' | 'products'>('table');
  const [table_number, setTableNumber] = useState('');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch products on initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Global keyboard handler for Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' && !e.target) || e.target === document.body) {
        e.preventDefault();

        // Handle Enter key based on current step
        if (step === 'table' && table_number.trim()) {
          handleNextStep();
        } else if (step === 'products' && selectedItems.length > 0) {
          handleCreateOrder();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [step, table_number, selectedItems.length]);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery) {
      const results = searchProducts(searchQuery);
      setFilteredProducts(results);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products, searchProducts]);

  const handleNextStep = () => {
    if (step === 'table') {
      if (!table_number.trim()) {
        toast.error('Por favor introduce un número de mesa');
        return;
      }
      setStep('products');
    }
  };

  const handlePreviousStep = () => {
    if (step === 'products') {
      setStep('table');
    }
  };

  const handleAddItem = (product: Product) => {
    const existingItemIndex = selectedItems.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        amount: updatedItems[existingItemIndex].amount + 1,
      };
      setSelectedItems(updatedItems);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          product,
          amount: 1,
          notes: '',
        },
      ]);
    }
    toast.success(`+1 ${product.name}`);
  };

  const handleRemoveItem = (index: number) => {
    const item = selectedItems[index];
    toast.success(`-${item.amount} ${item.product.name}`);

    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
  };

  const handleUpdateAmount = (index: number, amount: number, delta: number) => {
    if (amount < 1) return;
    toast.success(
      `${delta > 0 ? '+' : ''}${delta} ${selectedItems[index].product.name}`
    );

    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      amount,
    };
    setSelectedItems(updatedItems);
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      notes,
    };
    setSelectedItems(updatedItems);
  };

  const handleCreateOrder = async () => {
    if (!user) return;

    try {
      const orderId = await createOrder({
        table_number,
        created_by: user.name,
        items: selectedItems,
      });

      if (orderId) {
        toast.success('Pedido creado exitosamente');
        router.push('/orders');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear el pedido');
    }
  };

  const getTotalPrice = () => {
    return selectedItems.reduce(
      (total, item) => total + item.product.price * item.amount,
      0
    );
  };

  const renderTableStep = () => {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Label
            htmlFor="table_number"
            className="text-xl text-center block w-full"
          >
            Mesa
          </Label>
          <Input
            id="table_number"
            value={table_number}
            onChange={(e) => setTableNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && table_number.trim()) {
                handleNextStep();
              }
            }}
            className="text-4xl md:text-4xl font-bold h-18 mt-2 text-center"
            inputMode="numeric"
            autoFocus
          />
        </div>
      </div>
    );
  };

  const renderProductsStep = () => {
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
                  // Add the first filtered product when Enter is pressed
                  handleAddItem(filteredProducts[0]);
                }
              }}
              placeholder="Buscar productos"
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <NewProductForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="max-h-[40vh] overflow-y-auto">
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
                <ItemTypeIcon type={product.type} className="mr-1 ml-auto" />
                <span className="font-bold">${product.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Seleccionados
            </h3>
            <div className="space-y-2">
              {selectedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center py-1 px-4 bg-gray-50 rounded-lg"
                >
                  <ItemTypeIcon
                    type={item.product.type}
                    className="text-gray-400 mr-2"
                  />
                  <span className="font-medium text-sm flex-1">
                    <span className="text-gray-400 font-semibold  mr-2">
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
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 'table':
        return renderTableStep();
      case 'products':
        return renderProductsStep();
      default:
        return renderTableStep();
    }
  };

  return (
    <div
      className={cn(
        'pb-24 min-h-full  ',
        step === 'products' && 'justify-start'
      )}
    >
      {renderCurrentStep()}

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-[env(safe-area-inset-bottom)] left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto">
          {step === 'table' && (
            <Button
              onClick={handleNextStep}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
              disabled={!table_number.trim()}
            >
              Siguiente
            </Button>
          )}

          {step === 'products' && (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                className="shrink-0 h-12 text-lg font-semibold"
                size="lg"
              >
                <ChevronLeft className="size-6" />
              </Button>
              <Button
                onClick={handleCreateOrder}
                disabled={selectedItems.length === 0}
                className="flex-1 h-12 text-lg font-semibold"
                size="lg"
              >
                Crear Pedido
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
