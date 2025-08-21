import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import type { Product } from './order-store';
export type { Product } from './order-store';

type ProductState = {
  products: Product[];
  isLoading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<string | null>;
  updateProduct: (
    id: string,
    updates: Partial<Omit<Product, 'id'>>
  ) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  searchProducts: (query: string) => Product[];
};

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      set({ products: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ error: 'Error al obtener productos', isLoading: false });
    }
  },

  createProduct: async (product) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select();

      if (error) throw error;

      await get().fetchProducts();
      set({ isLoading: false });

      toast.success('Producto creado exitosamente');
      return data?.[0]?.id || null;
    } catch (error) {
      console.error('Error creating product:', error);
      set({ error: 'Error al crear producto', isLoading: false });
      toast.error('Error al crear producto');
      return null;
    }
  },

  updateProduct: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await get().fetchProducts();
      set({ isLoading: false });

      toast.success('Producto actualizado exitosamente');
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      set({ error: 'Error al actualizar producto', isLoading: false });
      toast.error('Error al actualizar producto');
      return false;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      await get().fetchProducts();
      set({ isLoading: false });

      toast.success('Producto eliminado exitosamente');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      set({ error: 'Error al eliminar producto', isLoading: false });
      toast.error('Error al eliminar producto');
      return false;
    }
  },

  searchProducts: (query) => {
    const products = get().products;
    if (!query) return products;

    const lowerQuery = query.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(lowerQuery)
    );
  },
}));
