// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface ProductCount {
  count: number;
}

export interface Product {
  id: string;
  title: string;
  status: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  price: string;
}
