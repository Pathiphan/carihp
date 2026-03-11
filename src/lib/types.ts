export interface Smartphone {
  id: string;
  name: string;
  brand: string;
  slug: string;
  image_url: string | null;
  price_idr: number;
  price_usd: number;
  price_idr_override: number | null;
  release_year: number;

  // Spesifikasi
  chipset: string;
  ram_gb: number;
  storage_gb: number;
  battery_mah: number;
  screen_size: number;
  screen_type: string;
  refresh_rate: number;
  os: string;
  weight_gram: number;

  // Kamera
  main_camera_mp: number;
  front_camera_mp: number;
  camera_features: string[];

  // Benchmark
  antutu_score: number;
  geekbench_single: number;
  geekbench_multi: number;

  // Rating 0-10
  rating_overall: number;
  rating_camera: number;
  rating_battery: number;
  rating_performance: number;
  rating_value: number;

  // Kategori
  category: string[];

  // Affiliate links (admin input)
  link_shopee: string[] | null;
  link_tiktok: string[] | null;
  link_official: string | null;

  // Metadata
  source: 'rapidapi' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  email: string;
  smartphone_id: string;
  target_price: number | null;
  notify_drop: boolean;
  notify_rise: boolean;
  created_at: string;
  smartphone?: Smartphone;
}

export interface OnboardingAnswers {
  usageTypes: string[];
  budgetMin: number;
  budgetMax: number;
  priorities: string[];
  brandFavorites: string[];
  brandAvoid: string[];
}

export interface FilterOptions {
  search?: string;
  brand?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_ram?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'antutu';
}
