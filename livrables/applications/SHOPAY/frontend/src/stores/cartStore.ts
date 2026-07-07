'use client';
import { create } from 'zustand';
import api from '@/lib/api';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: string;
  product: { id: string; name: string; images: { url: string }[] };
  variant?: { optionsJson: Record<string, string> } | null;
}

interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: (slug: string) => Promise<void>;
  addItem: (slug: string, productId: string, variantId: string | undefined, quantity: number) => Promise<void>;
  updateItem: (slug: string, itemId: string, quantity: number) => Promise<void>;
  removeItem: (slug: string, itemId: string) => Promise<void>;
}

export const useCartStore = create<CartState>()((set) => ({
  cart: null,
  isLoading: false,

  fetchCart: async (slug) => {
    set({ isLoading: true });
    const { data } = await api.get(`/storefront/${slug}/cart`);
    set({ cart: data.data.cart, isLoading: false });
  },

  addItem: async (slug, productId, variantId, quantity) => {
    const { data } = await api.post(`/storefront/${slug}/cart/items`, { productId, variantId, quantity });
    set({ cart: data.data.cart });
  },

  updateItem: async (slug, itemId, quantity) => {
    const { data } = await api.patch(`/storefront/${slug}/cart/items/${itemId}`, { quantity });
    set({ cart: data.data.cart });
  },

  removeItem: async (slug, itemId) => {
    const { data } = await api.delete(`/storefront/${slug}/cart/items/${itemId}`);
    set({ cart: data.data.cart });
  },
}));
