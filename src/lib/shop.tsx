import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ENGRAVING_PRICE, getProduct, type FontId, type Metal, type ProductId } from '@/lib/products';

export type Theme = 'light' | 'dark';
export type BagItem = { uid: string; productId: ProductId; metal: Metal; engraving: string; font: FontId };
export type NewBagItem = Omit<BagItem, 'uid'>;

type ViewTarget = { id: ProductId; metal: Metal } | null;

type ShopContext = {
  theme: Theme;
  toggleTheme: () => void;
  user: string | null;
  login: (name: string) => void;
  logout: () => void;
  bag: BagItem[];
  addToBag: (item: NewBagItem) => void;
  removeFromBag: (uid: string) => void;
  clearBag: () => void;
  itemPrice: (item: BagItem) => number;
  subtotal: number;
  bagOpen: boolean;
  setBagOpen: (open: boolean) => void;
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  suggestOpen: boolean;
  setSuggestOpen: (open: boolean) => void;
  viewing: ViewTarget;
  openProduct: (id: ProductId, metal?: Metal) => void;
  closeProduct: () => void;
};

const Ctx = createContext<ShopContext | null>(null);

const THEME_KEY = 'pj-theme';
const USER_KEY = 'pj-user';
const BAG_KEY = 'pj-bag';

const read = (key: string) => {
  try { return window.localStorage.getItem(key); } catch { return null; }
};
const write = (key: string, value: string | null) => {
  try { if (value === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, value); } catch { /* storage can be blocked */ }
};

const isBagItem = (value: unknown): value is BagItem => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v['uid'] === 'string' && typeof v['productId'] === 'string' && (v['metal'] === 'gold' || v['metal'] === 'silver') && typeof v['engraving'] === 'string' && typeof v['font'] === 'string';
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [user, setUser] = useState<string | null>(null);
  const [bag, setBag] = useState<BagItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [viewing, setViewing] = useState<ViewTarget>(null);

  // Load saved state once the browser is available (keeps server and first client render identical).
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    setUser(read(USER_KEY));
    try {
      const parsed: unknown = JSON.parse(read(BAG_KEY) ?? '[]');
      if (Array.isArray(parsed)) setBag(parsed.filter(isBagItem));
    } catch { /* ignore a corrupted bag */ }
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) write(BAG_KEY, JSON.stringify(bag)); }, [bag, hydrated]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      write(THEME_KEY, next);
      return next;
    });
  }, []);

  const login = useCallback((name: string) => { setUser(name); write(USER_KEY, name); }, []);
  const logout = useCallback(() => { setUser(null); write(USER_KEY, null); }, []);

  const addToBag = useCallback((item: NewBagItem) => {
    const uid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    setBag(prev => [...prev, { ...item, uid }]);
  }, []);
  const removeFromBag = useCallback((uid: string) => setBag(prev => prev.filter(i => i.uid !== uid)), []);
  const clearBag = useCallback(() => setBag([]), []);
  const itemPrice = useCallback((item: BagItem) => getProduct(item.productId).price + (item.engraving.trim() ? ENGRAVING_PRICE : 0), []);
  const subtotal = useMemo(() => bag.reduce((sum, item) => sum + itemPrice(item), 0), [bag, itemPrice]);

  const openProduct = useCallback((id: ProductId, metal: Metal = 'gold') => { setViewing({ id, metal }); }, []);
  const closeProduct = useCallback(() => setViewing(null), []);

  const value: ShopContext = {
    theme, toggleTheme, user, login, logout, bag, addToBag, removeFromBag, clearBag, itemPrice, subtotal,
    bagOpen, setBagOpen, loginOpen, setLoginOpen, searchOpen, setSearchOpen, menuOpen, setMenuOpen,
    suggestOpen, setSuggestOpen, viewing, openProduct, closeProduct,
  };

  return <Ctx.Provider value={value}>{children}<Toaster theme={theme} position="top-center" /></Ctx.Provider>;
}

export function useShop() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}
