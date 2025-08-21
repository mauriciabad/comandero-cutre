import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export type Product = {
  id: string;
  name: string;
  price: number;
  type?: 'food' | 'drink';
  color?: string;
  emoji?: string;
};

export type OrderItem = {
  product: Product;
  amount: number;
  notes?: string;
};

export type Order = {
  id: string;
  table_number: string;
  created_by: string;
  items: OrderItem[];
  cancelled_at?: string;
  paid_at?: string;
  drinks_ready_at?: string;
  food_ready_at?: string;
  created_at: string;
};

export type OrderStatus =
  | 'new'
  | 'drinks-served'
  | 'food-served'
  | 'paid'
  | 'cancelled';

type OrderState = {
  orders: Order[];
  filteredOrders: Order[];
  filter: 'all' | 'food' | 'drink';
  isLoading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  setFilter: (filter: 'all' | 'food' | 'drink') => void;
  createOrder: (
    order: Omit<Order, 'id' | 'created_at'>
  ) => Promise<string | null>;
  updateOrder: (
    id: string,
    updates: Partial<Omit<Order, 'id'>>
  ) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;

  // Status update helpers
  markDrinksReady: (id: string) => Promise<boolean>;
  markFoodReady: (id: string) => Promise<boolean>;
  markPaid: (id: string) => Promise<boolean>;
  markCancelled: (id: string) => Promise<boolean>;
};

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  filteredOrders: [],
  filter: 'all',
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .is('cancelled_at', null)
        .is('paid_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set({ orders: data || [] });
      // Apply current filter
      const filter = get().filter;
      get().setFilter(filter);

      set({ isLoading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ error: 'Failed to fetch orders', isLoading: false });
    }
  },

  setFilter: (filter) => {
    const orders = get().orders;
    let filteredOrders = [...orders];

    if (filter === 'food') {
      filteredOrders = orders.filter((order) =>
        order.items.some(
          (item) => item.product.type === 'food' || !item.product.type
        )
      );
    } else if (filter === 'drink') {
      filteredOrders = orders.filter((order) =>
        order.items.some(
          (item) => item.product.type === 'drink' || !item.product.type
        )
      );
    }

    set({ filter, filteredOrders });
  },

  createOrder: async (order) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...order,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      await get().fetchOrders();
      set({ isLoading: false });

      toast.success('Order created successfully');
      return data?.[0]?.id || null;
    } catch (error) {
      console.error('Error creating order:', error);
      set({ error: 'Failed to create order', isLoading: false });
      toast.error('Failed to create order');
      return null;
    }
  },

  updateOrder: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await get().fetchOrders();
      set({ isLoading: false });

      toast.success('Order updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      set({ error: 'Failed to update order', isLoading: false });
      toast.error('Failed to update order');
      return false;
    }
  },

  deleteOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);

      if (error) throw error;

      await get().fetchOrders();
      set({ isLoading: false });

      toast.success('Order deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      set({ error: 'Failed to delete order', isLoading: false });
      toast.error('Failed to delete order');
      return false;
    }
  },

  // Status update helpers
  markDrinksReady: async (id) => {
    return get().updateOrder(id, { drinks_ready_at: new Date().toISOString() });
  },

  markFoodReady: async (id) => {
    return get().updateOrder(id, { food_ready_at: new Date().toISOString() });
  },

  markPaid: async (id) => {
    return get().updateOrder(id, { paid_at: new Date().toISOString() });
  },

  markCancelled: async (id) => {
    return get().updateOrder(id, { cancelled_at: new Date().toISOString() });
  },
}));
