import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Smartphone } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDisplayPrice(phone: Smartphone): number {
  return phone.price_idr_override ?? phone.price_idr;
}

export function usdToIdr(usd: number): number {
  // Kurs estimasi — admin bisa override per produk
  const rate = 15800;
  return Math.round(usd * rate / 100000) * 100000;
}

export function getSecondhandLinks(name: string) {
  const encoded = encodeURIComponent(name);
  return {
    tokopedia: `https://www.tokopedia.com/search?q=${encoded}&condition=2`,
    shopee: `https://shopee.co.id/search?keyword=${encoded}&itemCondition=1`,
    olx: `https://www.olx.co.id/items/q-${encoded.replace(/%20/g, '-')}`,
    facebook: `https://www.facebook.com/marketplace/search/?query=${encoded}`,
  };
}

export function formatAntutu(score: number): string {
  if (!score) return 'N/A';
  if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
  if (score >= 1000) return `${Math.round(score / 1000)}K`;
  return score.toString();
}

export function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-emerald-600';
  if (rating >= 6) return 'text-amber-500';
  return 'text-red-500';
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function getBestInCategory(phones: Smartphone[], key: keyof Smartphone): string | null {
  if (!phones.length) return null;
  const numericKeys = ['price_idr', 'ram_gb', 'storage_gb', 'battery_mah',
    'main_camera_mp', 'antutu_score', 'geekbench_single', 'geekbench_multi',
    'rating_overall', 'refresh_rate'];
  const lowerIsBetter = ['price_idr', 'weight_gram'];

  if (!numericKeys.includes(key as string)) return null;

  const values = phones.map(p => ({ id: p.id, val: Number(p[key]) })).filter(x => x.val > 0);
  if (!values.length) return null;

  const best = lowerIsBetter.includes(key as string)
    ? values.reduce((a, b) => a.val < b.val ? a : b)
    : values.reduce((a, b) => a.val > b.val ? a : b);

  // Only highlight if there's actually a difference
  const allSame = values.every(v => v.val === values[0].val);
  return allSame ? null : best.id;
}
