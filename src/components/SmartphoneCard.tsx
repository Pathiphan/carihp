'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Zap, Camera, Battery, Plus, Check } from 'lucide-react';
import { Smartphone } from '@/lib/types';
import { formatRupiah, getDisplayPrice, formatAntutu, cn } from '@/lib/utils';

const CAT_COLORS: Record<string, string> = {
  gaming: 'bg-red-50 text-red-600',
  kamera: 'bg-purple-50 text-purple-600',
  baterai: 'bg-green-50 text-green-600',
  budget: 'bg-amber-50 text-amber-600',
  flagship: 'bg-blue-50 text-blue-700',
  kerja: 'bg-slate-100 text-slate-600',
  tipis: 'bg-pink-50 text-pink-600',
};

interface Props {
  phone: Smartphone;
  onCompare?: (phone: Smartphone) => void;
  isInCompare?: boolean;
  highlight?: boolean;
  aiReason?: string;
}


function PhoneImage({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  const [imgError, setImgError] = useState(false);
  if (!imageUrl || imgError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
        <Camera size={32} />
        <span className="text-xs text-center px-2">{name}</span>
      </div>
    );
  }
  return (
    <Image
      src={imageUrl}
      alt={name}
      fill
      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, 300px"
      unoptimized
      onError={() => setImgError(true)}
    />
  );
}

export default function SmartphoneCard({ phone, onCompare, isInCompare, highlight, aiReason }: Props) {
  const price = getDisplayPrice(phone);

  return (
    <div className={cn(
      'card-hover group relative flex flex-col overflow-hidden transition-all duration-300',
      highlight && 'ring-2 ring-brand-400 shadow-card-hover'
    )}>
      {highlight && (
        <div className="absolute top-0 left-0 right-0 bg-brand-500 text-white text-xs font-bold text-center py-1.5 z-10">
          ⭐ Rekomendasi AI Terbaik
        </div>
      )}

      {/* Image */}
      <Link href={`/detail/${phone.slug}`}>
        <div className={cn(
          'relative bg-paper-3 flex items-center justify-center overflow-hidden',
          highlight ? 'h-48 mt-7' : 'h-48'
        )}>
          <PhoneImage name={phone.name} imageUrl={phone.image_url} />
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {phone.category?.slice(0, 2).map(cat => (
              <span key={cat} className={cn('badge', CAT_COLORS[cat] || 'bg-gray-100 text-gray-600')}>
                {cat}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-ink-3 text-xs font-semibold uppercase tracking-wider">{phone.brand}</p>
          <Link href={`/detail/${phone.slug}`}>
            <h3 className="font-display font-bold text-ink text-base leading-snug mt-0.5 hover:text-accent transition-colors line-clamp-2">
              {phone.name}
            </h3>
          </Link>
        </div>

        {/* AI reason */}
        {aiReason && (
          <p className="text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2 leading-relaxed border border-brand-100">
            {aiReason}
          </p>
        )}

        {/* Quick specs */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { icon: Zap, color: 'text-amber-500', label: 'AnTuTu', val: formatAntutu(phone.antutu_score) },
            { icon: Camera, color: 'text-purple-500', label: 'Kamera', val: `${phone.main_camera_mp}MP` },
            { icon: Battery, color: 'text-green-500', label: 'Baterai', val: `${phone.battery_mah}` },
          ].map(({ icon: Icon, color, label, val }) => (
            <div key={label} className="bg-paper-3 rounded-lg p-2 text-center">
              <Icon size={11} className={cn(color, 'mx-auto mb-0.5')} />
              <p className="text-gray-400 text-[9px] uppercase tracking-wide">{label}</p>
              <p className="font-mono font-semibold text-ink text-[11px]">{val}</p>
            </div>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold text-ink">{phone.rating_overall.toFixed(1)}</span>
          <span className="text-ink-3 text-xs">/ 10</span>
          <span className="text-ink-3 text-xs ml-1">• {phone.ram_gb}GB RAM</span>
        </div>

        {/* Price & compare */}
        <div className="flex items-end justify-between pt-2 border-t border-border mt-auto">
          <div>
            <p className="text-ink-3 text-xs">Mulai dari</p>
            <p className="font-display font-bold text-lg text-ink">{formatRupiah(price)}</p>
            {!phone.price_idr_override && (
              <p className="text-gray-400 text-[10px]">~estimasi harga IDR</p>
            )}
          </div>
          {onCompare && (
            <button
              onClick={() => onCompare(phone)}
              className={cn(
                'p-2 rounded-xl border transition-all duration-200',
                isInCompare
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'border-border text-gray-400 hover:border-accent/30 hover:text-accent'
              )}
              title={isInCompare ? 'Hapus dari perbandingan' : 'Tambah ke perbandingan'}
            >
              {isInCompare ? <Check size={16} /> : <Plus size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
