'use client';
import { create } from 'zustand';
import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  basePrice: string;
  currency: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  stockQty: number;
  trackStock: boolean;
  categoryId?: string | null;
  images: { id: string; url: string }[];
  variants: { id: string; optionsJson: Record<string, string>; stockQty: number; priceOverride?: string | null }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductState {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (input: Record<string, unknown>) => Promise<Product>;
  updateProduct: (id: string, input: Record<string, unknown>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createCategory: (name: string) => Promise<void>;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    const { data } = await api.get('/products');
    set({ products: data.data.products, isLoading: false });
  },

  fetchCategories: async () => {
    const { data } = await api.get('/categories');
    set({ categories: data.data.categories });
  },

  createProduct: async (input) => {
    const { data } = await api.post('/products', input);
    set({ products: [data.data.product, ...get().products] });
    return data.data.product;
  },

  updateProduct: async (id, input) => {
    const { data } = await api.patch(`/products/${id}`, input);
    set({ products: get().products.map((p) => (p.id === id ? data.data.product : p)) });
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
    set({ products: get().products.filter((p) => p.id !== id) });
  },

  createCategory: async (name) => {
    const { data } = await api.post('/categories', { name });
    set({ categories: [...get().categories, data.data.category] });
  },
}));
