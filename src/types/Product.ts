export interface Product {
  id: string | number;
  _id?: string;

  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description: string;

  originalPrice?: number;
  stock?: number;
  isFeatured?: boolean;
}