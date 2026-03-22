import axios from 'axios';

// ── Service URLs ─────────────────────────────────────────────────────────────
const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://98.81.229.185:3000';
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://54.254.157.28:8080';

// ── Axios instances ───────────────────────────────────────────────────────────
const productApi = axios.create({ baseURL: PRODUCT_SERVICE_URL });
const userApi = axios.create({ baseURL: USER_SERVICE_URL });

// Attach JWT token to every product service request if present
productApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Electronics' | 'Vehicles' | 'Property' | 'Furniture' | 'Fashion' | 'Services' | 'Food & Beverages' | 'Sports & Leisure' | 'Other';
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

// ── Product Service API calls ─────────────────────────────────────────────────
export const productService = {
  getAll: (params?: { category?: string; available?: string; search?: string; createdBy?: string }) =>
    productApi.get<{ success: boolean; count: number; data: Product[] }>('/api/products', { params }),

  getById: (id: string) =>
    productApi.get<{ success: boolean; data: Product }>(`/api/products/${id}`),

  getStats: (id: string) =>
    productApi.get<{ success: boolean; data: { product: Product; orderStats: { orderCount: number; totalRevenue: number; orderServiceAvailable: boolean } } }>(`/api/products/${id}/stats`),

  create: (data: ProductInput) =>
    productApi.post<{ success: boolean; data: Product }>('/api/products', data),

  update: (id: string, data: Partial<ProductInput>) =>
    productApi.put<{ success: boolean; data: Product }>(`/api/products/${id}`, data),

  delete: (id: string) =>
    productApi.delete<{ success: boolean; message: string }>(`/api/products/${id}`),
};

// ── User Service API calls ────────────────────────────────────────────────────
export const userService = {
  login: (email: string, password: string) =>
    userApi.post<{ id: number; token: string; email: string; name: string; role: string }>('/api/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    userApi.post<{ id: number; token: string; email: string; name: string; role: string }>('/api/auth/register', { name, email, password }),

  validateToken: (token: string) =>
    userApi.get<boolean>(`/api/auth/validateToken?token=${token}`),
};

export const CATEGORIES = [
  'Electronics',
  'Vehicles',
  'Property',
  'Furniture',
  'Fashion',
  'Services',
  'Food & Beverages',
  'Sports & Leisure',
  'Other',
] as const;
