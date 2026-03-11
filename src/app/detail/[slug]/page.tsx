'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Star, Zap, Camera, Battery, Monitor, Cpu, HardDrive, Bell, ShoppingCart, ExternalLink, Package, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Smartphone } from '@/lib/types';
import { formatRupiah, getDisplayPrice, formatAntutu, getSecondhandLinks, getRatingColor } from '@/lib/utils';
import WatchlistModal from '@/components/WatchlistModal';

export default function DetailPage() {
  const { slug } = useParams();
  const [phone, setPhone] = useState<Smartphone | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWatchlist, setShowWatchlist] = useState(false);

  useEffect(() => {
    supabase.from('smartphones').select('*').eq('slug', slug).single()
      .then(({ data }) => { setPhone(data as Smartphone); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20 animate-pulse space-y-6">
      <div className="h-8 w-40 bg-paper-3 rounded" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-96 bg-paper-3 rounded-2xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-paper-3 rounded" />)}
        </div>
      </div>
    </div>
  );

  if (!phone) return (
    <div className="text-center py-32">
      <p className="text-ink-3 text-lg mb-4">HP tidak ditemukan</p>
      <Link href="/" className="btn-primary">Kembali</Link>
    </div>
  );

  const price = getDisplayPrice(phone);
  const usedLinks = getSecondhandLinks(phone.name);
  const ratings = [
    { label: 'Overall', value: phone.rating_overall },
    { label: 'Kamera', value: phone.rating_camera },
    { label: 'Baterai', value: phone.rating_battery },
    { label: 'Performa', value: phone.rating_performance },
    { label: 'Value', value: phone.rating_value },
  ];
  const specs = [
    { icon: Cpu, label: 'Chipset', value: phone.chipset },
    { icon: HardDrive, label: 'RAM / Storage', value: `${phone.ram_gb}GB / ${phone.storage_gb}GB` },
    { icon: Monitor, label: 'Layar', value: `${phone.screen_size}" ${phone.screen_type} ${phone.refresh_rate}Hz` },
    { icon: Battery, label: 'Baterai', value: `${phone.battery_mah} mAh` },
    { icon: Camera, label: 'Kamera Utama', value: `${phone.main_camera_mp} MP` },
    { icon: Camera, label: 'Kamera Depan', value: `${phone.front_camera_mp} MP` },
    { icon: Zap, label: 'OS', value: phone.os },
    { icon: ArrowUpDown, label: 'Berat', value: `${phone.weight_gram} gram` },
  ];

  return (
    <div className="min-h-screen bg-paper-2">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="flex items-center gap-2 text-ink-3 hover:text-ink text-sm mb-8 font-medium">
          <ChevronLeft size={16} />Kembali ke daftar HP
        </Link>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Image */}
          <div className="card p-6 flex items-center justify-center" style={{ minHeight: '320px' }}>
            {phone.image_url ? (
              <div className="relative w-full h-72">
                <Image src={phone.image_url} alt={phone.name} fill className="object-contain" unoptimized />
              </div>
            ) : (
              <div className="text-ink-3 text-sm flex flex-col items-center gap-2">
                <Camera size={40} className="opacity-20" />
                <span>Tidak ada gambar</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <p className="text-accent font-bold text-sm uppercase tracking-wider">{phone.brand}</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-1">{phone.name}</h1>
              <p className="text-ink-3 text-sm mt-0.5">{phone.release_year}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {phone.category?.map(cat => (
                  <span key={cat} className="badge bg-paper-3 text-ink-2 text-xs">{cat}</span>
                ))}
              </div>
            </div>

            {/* Ratings */}
            <div className="card p-4 space-y-2.5">
              {ratings.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-ink-3 text-xs w-16 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-paper-3 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-brand-500 rounded-full transition-all duration-700"
                      style={{ width: `${value * 10}%` }} />
                  </div>
                  <span className={`text-xs font-mono font-bold w-7 text-right ${getRatingColor(value)}`}>
                    {value.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price & buy */}
            <div className="card p-4">
              <p className="text-ink-3 text-xs mb-1">
                Harga {phone.price_idr_override ? 'Resmi Indonesia' : 'Estimasi IDR'}
              </p>
              <p className="font-display text-3xl font-bold text-ink">{formatRupiah(price)}</p>
              {!phone.price_idr_override && (
                <p className="text-gray-400 text-xs mt-0.5">*Estimasi dari harga global, bisa berbeda di pasaran</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {phone.link_shopee?.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="btn-primary flex items-center justify-center gap-2">
                  <ShoppingCart size={16} />
                  Beli di Shopee{phone.link_shopee!.length > 1 ? ` #${i + 1}` : ''}
                  <ExternalLink size={12} />
                </a>
              ))}
              {phone.link_tiktok?.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary flex items-center justify-center gap-2">
                  <ShoppingCart size={16} />
                  Beli di TikTok Shop{phone.link_tiktok!.length > 1 ? ` #${i + 1}` : ''}
                  <ExternalLink size={12} />
                </a>
              ))}
              <button onClick={() => setShowWatchlist(true)}
                className="btn-ghost flex items-center justify-center gap-2 border border-border rounded-xl py-2.5">
                <Bell size={15} />Tambah ke Watchlist
              </button>
            </div>
          </div>
        </div>

        {/* Specs & Benchmark */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink mb-4">Spesifikasi</h2>
            <div className="space-y-0">
              {specs.map(({ icon: Icon, label, value }, i) => (
                <div key={label} className={`flex items-center gap-3 py-2.5 ${i < specs.length - 1 ? 'border-b border-border' : ''}`}>
                  <Icon size={14} className="text-accent shrink-0" />
                  <span className="text-ink-3 text-xs w-28 shrink-0">{label}</span>
                  <span className="text-ink text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink mb-4">Benchmark</h2>
            <div className="space-y-3">
              <div className="bg-paper-3 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-ink-3 text-sm">AnTuTu Score</span>
                  <span className="font-mono font-bold text-amber-500 text-xl">{formatAntutu(phone.antutu_score)}</span>
                </div>
                {phone.antutu_score > 0 && (
                  <div className="h-2 bg-paper-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      style={{ width: `${Math.min((phone.antutu_score / 2000000) * 100, 100)}%` }} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Geekbench Single', val: phone.geekbench_single },
                  { label: 'Geekbench Multi', val: phone.geekbench_multi },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-paper-3 rounded-xl p-3">
                    <p className="text-ink-3 text-xs mb-1">{label}</p>
                    <p className="font-mono font-bold text-ink text-lg">{val || 'N/A'}</p>
                  </div>
                ))}
              </div>
              {phone.camera_features?.length > 0 && (
                <div>
                  <p className="text-ink-3 text-xs font-semibold mb-2">Fitur Kamera</p>
                  <div className="flex flex-wrap gap-1.5">
                    {phone.camera_features.map(f => (
                      <span key={f} className="badge bg-purple-50 text-purple-600 text-xs">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Overall rating */}
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span className="font-display font-bold text-2xl text-ink">{phone.rating_overall.toFixed(1)}</span>
              <span className="text-ink-3">/ 10 overall</span>
            </div>
          </div>
        </div>

        {/* Second hand */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Package size={18} className="text-green-600" />
            <h2 className="font-display text-lg font-bold text-ink">Cari Unit Bekas</h2>
            <span className="badge bg-green-50 text-green-700 text-xs">Lebih hemat</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(usedLinks).map(([platform, url]) => (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-paper-3 hover:bg-paper-2 border border-border hover:border-green-300 rounded-xl py-3 px-3 text-sm font-semibold text-ink-2 hover:text-green-700 transition-all duration-200">
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                <ExternalLink size={11} className="text-ink-3" />
              </a>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-3">*Link membuka halaman pencarian di platform tersebut</p>
        </div>
      </div>

      {showWatchlist && <WatchlistModal phone={phone} onClose={() => setShowWatchlist(false)} />}
    </div>
  );
}
