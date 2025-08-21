'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/user-store';
import { useProductStore } from '@/lib/store/product-store';
import { useOrderStore, OrderItem } from '@/lib/store/order-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { NewProductForm } from '@/components/product/new-product-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { X, Plus, Search } from 'lucide-react';

export const NewOrderForm: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { products, fetchProducts, searchProducts } = useProductStore();
  const { createOrder } = useOrderStore();

  const [step, setStep] = useState<'table' | 'products' | 'review'>('table');
  const [tableNumber, setTableNumber] = useState('');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch products on initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
      if (!tableNumber.trim()) {
        toast.error('Please enter a table number');
        return;
      }
      setStep('products');
    } else if (step === 'products') {
      if (selectedItems.length === 0) {
        toast.error('Please select at least one product');
        return;
      }
      setStep('review');
    }
  };

  const handlePreviousStep = () => {
    if (step === 'products') {
      setStep('table');
    } else if (step === 'review') {
      setStep('products');
    }
  };

  const handleAddItem = (product: any) => {
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
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
  };

  const handleUpdateAmount = (index: number, amount: number) => {
    if (amount < 1) return;

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
        tableNumber,
        createdBy: user.name,
        items: selectedItems,
      });

      if (orderId) {
        toast.success('Order created successfully');
        router.push('/orders');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
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
          <Label htmlFor="tableNumber" className="text-lg">
            Table Number
          </Label>
          <Input
            id="tableNumber"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Enter table number"
            className="text-lg h-12 mt-2"
          />
        </div>
        <Button onClick={handleNextStep} className="w-full" size="lg">
          Continue to Products
        </Button>
      </div>
    );
  };

  const renderProductsStep = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products"
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                <Plus size={18} className="mr-1" /> New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <NewProductForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="food">Food</TabsTrigger>
            <TabsTrigger value="drink">Drinks</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleAddItem(product)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{product.name}</div>
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
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No products found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="food" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts
                .filter((p) => p.type === 'food')
                .map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddItem(product)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-orange-100 text-orange-800"
                      >
                        food
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              {filteredProducts.filter((p) => p.type === 'food').length ===
                0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No food products found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="drink" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts
                .filter((p) => p.type === 'drink')
                .map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddItem(product)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800"
                      >
                        drink
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              {filteredProducts.filter((p) => p.type === 'drink').length ===
                0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No drink products found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {selectedItems.length > 0 && (
          <div className="mt-8 border-t pt-4">
            <h3 className="font-bold mb-2">Selected Items</h3>
            <div className="space-y-3">
              {selectedItems.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium">{item.product.name}</span>
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

                      <div className="flex items-center mt-2 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateAmount(index, item.amount - 1)
                          }
                        >
                          -
                        </Button>
                        <span>{item.amount}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateAmount(index, item.amount + 1)
                          }
                        >
                          +
                        </Button>
                        <span className="ml-4">
                          ${(item.product.price * item.amount).toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-2">
                        <Input
                          placeholder="Add notes"
                          value={item.notes}
                          onChange={(e) =>
                            handleUpdateNotes(index, e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <X size={18} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handlePreviousStep}>
            Back
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={selectedItems.length === 0}
          >
            Review Order
          </Button>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Table {tableNumber}</h2>
              <Badge>New Order</Badge>
            </div>

            <div className="border-t border-b py-4">
              <h3 className="font-bold mb-2">Order Items</h3>
              <div className="space-y-3">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium">{item.amount}x</span>
                        <span className="ml-2">{item.product.name}</span>
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
                      {item.notes && (
                        <div className="text-sm text-gray-500 ml-7">
                          Note: {item.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      ${(item.product.price * item.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="font-bold">Total</span>
              <span className="font-bold">${getTotalPrice().toFixed(2)}</span>
            </div>

            <div className="text-sm text-gray-500">
              Order by: {user?.name || 'Unknown'}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePreviousStep}>
            Back
          </Button>
          <Button onClick={handleCreateOrder}>Create Order</Button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 'table':
        return renderTableStep();
      case 'products':
        return renderProductsStep();
      case 'review':
        return renderReviewStep();
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div
              className={`rounded-full h-10 w-10 flex items-center justify-center ${
                step === 'table'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-blue-500'
              }`}
            >
              1
            </div>
            <div className="text-sm font-medium ml-2">Table</div>
          </div>

          <div
            className={`h-1 w-16 mx-2 ${
              step === 'table' ? 'bg-gray-200' : 'bg-blue-500'
            }`}
          />

          <div className="flex items-center">
            <div
              className={`rounded-full h-10 w-10 flex items-center justify-center ${
                step === 'products'
                  ? 'bg-blue-500 text-white'
                  : step === 'review'
                    ? 'bg-blue-100 text-blue-500'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              2
            </div>
            <div className="text-sm font-medium ml-2">Products</div>
          </div>

          <div
            className={`h-1 w-16 mx-2 ${
              step === 'review' ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          />

          <div className="flex items-center">
            <div
              className={`rounded-full h-10 w-10 flex items-center justify-center ${
                step === 'review'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              3
            </div>
            <div className="text-sm font-medium ml-2">Review</div>
          </div>
        </div>
      </div>

      {renderCurrentStep()}
    </div>
  );
};
