import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: any;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  setCart: (items: CartItem[], total: number, itemCount: number) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  itemCount: 0,
  setCart: (items, total, itemCount) => set({ items, total, itemCount }),
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
      itemCount: state.itemCount + item.quantity,
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),
  clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
}));

interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setFontFamily: (font: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      primaryColor: '#0ea5e9',
      secondaryColor: '#f59e0b',
      fontFamily: 'Inter',
      setPrimaryColor: (color) => set({ primaryColor: color }),
      setSecondaryColor: (color) => set({ secondaryColor: color }),
      setFontFamily: (font) => set({ fontFamily: font }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
