import ring from '@/assets/orbit-ring.jpg';
import earrings from '@/assets/earrings.jpg';
import necklace from '@/assets/necklace.jpg';

export type Metal = 'gold' | 'silver';
export type ProductId = 'ring' | 'earrings' | 'necklace';
export type FontId = 'script' | 'serif' | 'modern';

export type Product = {
  id: ProductId;
  name: string;
  price: number;
  image: string;
  material: string;
  tag: string;
  pitch: string;
};

export const products: Product[] = [
  { id: 'ring', name: 'The Terra Ring', price: 125, image: ring, material: 'Recycled gold vermeil', tag: 'A new everyday', pitch: 'Soft, organic curves that feel like a river stone. A good first piece.' },
  { id: 'earrings', name: 'The Sol Hoops', price: 145, image: earrings, material: 'Recycled gold vermeil', tag: 'Quietly sculptural', pitch: 'Thick, sculpted hoops that make a statement without shouting.' },
  { id: 'necklace', name: 'The Pebble Necklace', price: 110, image: necklace, material: 'Recycled gold vermeil', tag: 'Close to nature', pitch: 'A fine chain and one small pebble. Easy to wear every day.' },
];

export const getProduct = (id: ProductId): Product => products.find(p => p.id === id) ?? products[0]!;

export const metalLabel: Record<Metal, string> = { gold: 'Gold', silver: 'Silver' };

/** Engraving colours come from the same design tokens as the 3D model finish. */
export const engravingColor: Record<Metal, string> = {
  gold: 'var(--model-gold)',
  silver: 'var(--model-silver)',
};

export const engravingFonts: { id: FontId; label: string; family: string }[] = [
  { id: 'script', label: 'Script', family: "'Great Vibes', cursive" },
  { id: 'serif', label: 'Serif', family: "'Italiana', serif" },
  { id: 'modern', label: 'Modern', family: "'DM Sans', sans-serif" },
];

export const getFontFamily = (id: FontId) => engravingFonts.find(f => f.id === id)?.family ?? engravingFonts[0]!.family;

export const ENGRAVING_PRICE = 15;
export const ENGRAVING_MAX = 18;
export const EXPRESS_SHIPPING = 18;
export const TAX_RATE = 0.13;
