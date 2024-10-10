// MessageResponse Interface
export interface MessageResponse {
  message: string;
}

export interface AuthContextProps {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Auth and Token Interfaces
export interface TokenResponse {
  access_token: string;
  refresh_token?: string; // Optional
  token_type: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// User Interfaces
export interface UserBase {
  email: string;
  full_name: string;
  phone_number?: string;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface User extends UserBase {
  id: number;
  is_active: boolean;
  role?: Role; // Optional role
  created_at: Date;
  updated_at: Date;
}

// Role Interfaces
export interface RoleBase {
  name: string;
}

export interface Role extends RoleBase {
  id: number;
}

// Address Interfaces
export interface AddressBase {
  street_address: string;
  city: string;
  state?: string; // Optional state
  postal_code: string;
  country: string;
}

export interface Address extends AddressBase {
  id: number;
  user_id: number;
}

// Product Interfaces
export interface ProductBase {
  name: string;
  description: string;
  price: number;
  image_url?: string; // Optional image URL
}
export interface ProductCreate extends ProductBase {
  category_id: number;
}

export interface Product extends ProductBase {
  id: number;
  category: Category;
  created_at: Date;
  updated_at: Date;
}

export interface ProductComponentProps {
  product: Product;
  handleAddToCart: (selectedColor: string, selectedSize: string) => Promise<void>;
}



export interface ProductGridProps {
  products: Product[];
  handleAddToCart: (product: Product, selectedColor: string, selectedSize: string) => void;
}

// Category Interfaces
export interface CategoryBase {
  name: string;
  description?: string; // Optional description
}

export interface Category extends CategoryBase {
  id: number;
  products?: Product[]; // Optional list of products in the category
}

// Cart and Cart Item Interfaces
export interface CartItem {
  id: number;
  product: Product; // Full Product object
  quantity: number;
  color: string;
  size: SizeEnum;
}

// Cart Interface
export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
}

// Cart Sidebar Props
export interface CartSidebarProps {
  isOpen: boolean;
  closeCart: () => void;
  cartItems: CartItem[]; 
  removeFromCart: (id: number, color: string, size: string) => void;
  updateQuantity: (id: number, color: string, size: string, quantity: number) => void;

}

export interface CallToOrderProps {
  cartItems: CartItem[];
  onOrder?: () => void; // Make this optional since navigation will handle the main action
  onCancel: () => void;
}


export interface OrderItemCreate {
  product_id: number;
  quantity: number;
  color: string;
  size: SizeEnum;
}

// OrderCreate Interface
export interface OrderCreate {
  status: OrderStatusEnum;
  total_price: number;
  items: OrderItemCreate[];
}

// OrderItem Interface
export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  color: string;
  size: SizeEnum;
  price: number;
}

// OrderBase Interface
export interface OrderBase {
  status: OrderStatusEnum;
  total_price: number;
}


// Order Interface
export interface Order extends OrderBase {
  id: string; 
  user_id: number;
  items: OrderItem[]; 
  created_at: Date;
  updated_at: Date;
}


// Order Details Props
export interface OrderDetailsProps {
  orderId: string;
  onClose: () => void;
}


// Wishlist Interfaces
export interface WishlistItem {
  id: number;
  product: Product;
  color: string; 
  size: SizeEnum;
}

export interface Wishlist {
  id: number;
  user_id: number;
  items: WishlistItem[];
}

// Sales Record Interfaces
export interface SalesRecord {
  id: number;
  user: User;
  orders: Order[];
}

// Enum Interfaces
export enum SizeEnum {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
}

export enum OrderStatusEnum {
  CREATED = "CREATED",
  PENDING = "PENDING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface DiscountPopupProps {
  onClose: () => void; 
}

export interface Referral {
  name: string;
  email: string;
}

export interface ReferralRequest {
  referrals: Referral[];
}