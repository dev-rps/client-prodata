export interface ProductImage {
  id: string; // for UI tracking
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string; // for UI tracking
  name: string;
  value: string;
  stock: number;
  priceAdj: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  categoryId: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isSale: boolean;
  material?: string;
  occasion?: string;
  careInstructions?: string;
  shippingInfo?: string;
  tags?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: number;
}

export const CATEGORIES = [
  'Rakhi',
  'Jhumka',
  'Combos & Hampers',
  'Gift Hampers'
];
