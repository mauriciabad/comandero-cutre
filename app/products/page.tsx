'use client';

import { useEffect, useState } from 'react';
import { useProductStore } from '@/lib/store/product-store';
import { AuthWrapper } from '@/components/auth-wrapper';
import { ProductList } from '@/components/product/product-list';
import { ProductCreateDialog } from '@/components/product/product-create-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';

export default function ProductsPage() {
  const { fetchProducts, isLoading } = useProductStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <AuthWrapper>
      <AppLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Productos</h1>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Cargando productos...</div>
          ) : (
            <ProductList />
          )}

          <ProductCreateDialog
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          />
        </div>
      </AppLayout>
    </AuthWrapper>
  );
}
