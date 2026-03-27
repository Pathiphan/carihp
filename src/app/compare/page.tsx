'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Loader2, ExternalLink, Crown, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Smartphone } from '@/lib/types';
import { formatRupiah, getDisplayPrice, formatAntutu, getBestInCategory, cn } from '@/lib/utils';

function CompareContent() {
  const searchParams = useSearchParams();
  const [phones, setPhones] = useState<Smartphone[]>([]);
  const [loading, setLoading] = useState(true);
  const [verdict, setVerdict] = useState('');
  const [verdictLoading, setVerdictLoading] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerSticky, setHeaderSticky] = useState(false);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean);
    if (!ids?.length) { setLoading(false); return; }
    supabase.from('smartphones').select('*').in('id', ids)
      .then(({ data }) => { setPhones((data as Smartphone[]) || []); setLoading(false); });
  }, [searchParams]);

  // Sticky header on scroll
  useEffect(() => {
    const onScroll = () => {
      const el = headerRef.current;
      if (el) setHeaderSticky(el.getBoundingClientRect().top <= 64);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getVerdict = async () => {
    setVerdictLoading(true);
    setVerdict('');
    try {
      const res = await fetch('/api/phones/verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones }),
      });
      const data = await res.json();
      setVerdict(data.verdict || 'Tidak dapat menganalisis saat ini.');
    } catch {
      setVerdict('Maaf, terjadi kesalahan. Coba lagi nanti.');
    }
    setVerdictLoading(false);
  };

  const specGroups = [
    {
      title: '💰 Harga',
      specs: [
        { label: 'Harga (estimasi IDR)', key: 'price_idr' as keyof Smartphone, format: (v: number) => formatRupiah(v), compare: true, lowerBetter: true },
      ]
    },
    {
      title: '⚡ Performa',
      specs: [
        { label: 'Chipset', key: 'chipset' as keyof Smartphone, format: (v: string) => v },
        { label: 'RAM', key: 'ram_gb' as keyof Smartphone, format: (v: number) => `${v} GB`, compare: true },
        { label: 'Storage', key: 'storage_gb' as keyof Smartphone, format: (v: number) => `${v} GB`, compare: true },
        { label: 'AnTuTu Score', key: 'antutu_score' as keyof Smartphone, format: (v: number) => formatAntutu(v), compare: true },
        { label: 'Geekbench Single', key: 'geekbench_single' as keyof Smartphone, format: (v: number) => v || 'N/A', compare: true },
        { label: 'Geekbench Multi', key: 'geekbench_multi' as keyof Smartphone, format: (v: number) => v || 'N/A', compare: true },
      ]
    },
    {
      title: '🖥️ Layar',
      specs: [
        { label: 'Ukuran Layar', key: 'screen_size' as keyof Smartphone, format: (v: number) => `${v}"` },
        { label: 'Tipe Layar', key: 'screen_type' as keyof Smartphone, format: (v: string) => v },
        { label: 'Refresh Rate', key: 'refresh_rate' as keyof Smartphone, format: (v: number) => `${v} Hz`, compare: true },
      ]
    },
    {
      title: '📷 Kamera',
      specs: [
        { label: 'Kamera Utama', key: 'main_camera_mp' as keyof Smartphone, format: (v: number) => `${v} MP`, compare: true },
        { label: 'Kamera Depan', key: 'front_camera_mp' as keyof Smartphone, format: (v: number) => `${v} MP`, compare: true },
      ]
    },
    {
      title: '🔋 Baterai & Fisik',
      specs: [
        { label: 'Kapasitas Baterai', key: 'battery_mah' as keyof Smartphone, format: (v: number) => `${v} mAh`, compare: true },
        { label: 'Berat', key: 'weight_gram' as keyof Smartphone, format: (v: number) => `${v} g`, compare: true, lowerBetter: true },
        { label: 'OS', key: 'os' as keyof Smartphone, format: (v: string) => v },
      ]
    },
    {
      title: '⭐ Rating',
      specs: [
        { label: 'Rating Overall', key: 'rating_overall' as keyof Smartphone, format: (v: number) => `${v}/10`, compare: true },
        { label: 'Rating Kamera', key: 'rating_camera' as keyof Smartphone, format: (v: number) => `${v}/10`, compare: true },
        { label: 'Rating Baterai', key: 'rating_battery' as keyof Smartphone, format: (v: number) => `${v}/10`, compare: true },
        { label: 'Rating Performa', key: 'rating_performance' as keyof Smartphone, format: (v: number) => `${v}/10`, compare: true },
      ]
    },
  ];

  if (loading) return <div className="text-center py-32 text-ink-3">Memuat perbandingan...</div>;

  if (!phones.length) return (
    <div className="text-center py-32">
      <p className="text-ink-3 text-lg mb-4">Belum ada HP yang dipilih</p>
      <Link href="/" className="btn-primary">Pilih HP dari daftar</Link>
    </div>
  );

  const cols = phones.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="flex items-center gap-2 text-ink-3 hover:text-ink text-sm mb-6 font-medium">
        <ChevronLeft size={16} />Kembali
      </Link>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-8">
        Perbandingan HP
        <span className="ml-3 badge bg-accent/10 text-accent text-sm font-semibold">{phones.length} HP</span>
      </h1>

      {/* Phone header cards */}
      <div ref={headerRef} className={cn(
        'grid gap-4 mb-8 transition-all duration-300',
        headerSticky && 'sticky top-16 z-30 bg-paper-2 py-3 -mx-4 px-4 shadow-card border-b border-border'
      )} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {phones.map(phone => (
          <div key={phone.id} className={cn('card p-4 text-center', !headerSticky && 'shadow-card-hover')}>
            {!headerSticky && (
              <div className="relative h-32 mb-3">
                {phone.image_url && (
                  <Image src={phone.image_url} alt={phone.name} fill className="object-contain" unoptimized />
                )}
              </div>
            )}
            <p className="text-ink-3 text-xs font-semibold">{phone.brand}</p>
            <h3 className="font-display font-bold text-ink text-sm leading-tight mt-0.5 line-clamp-2">{phone.name}</h3>
            <p className="text-accent font-bold text-sm mt-1">{formatRupiah(getDisplayPrice(phone))}</p>
            {!headerSticky && (
              <div className="flex flex-col gap-1.5 mt-3">
                {phone.link_shopee && (
                  <a href={phone.link_shopee} target="_blank" rel="noopener noreferrer"
                    className="btn-primary text-xs py-1.5 flex items-center justify-center gap-1">
                    Shopee <ExternalLink size={10} />
                  </a>
                )}
                {phone.link_tiktok && (
                  <a href={phone.link_tiktok} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                    TikTok <ExternalLink size={10} />
                  </a>
                )}
                <Link href={`/detail/${phone.slug}`}
                  className="btn-ghost text-xs border border-border rounded-lg py-1.5 text-center">
                  Detail lengkap
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Spec comparison table */}
      <div className="card overflow-hidden mb-8">
        {specGroups.map(group => (
          <div key={group.title}>
            <div className="bg-paper-3 px-5 py-2.5 border-b border-border">
              <p className="font-display font-bold text-ink text-sm">{group.title}</p>
            </div>
            {group.specs.map(({ label, key, format, compare, lowerBetter }, idx) => {
              const bestId = compare ? getBestInCategory(phones, key) : null;
              // Override for lowerBetter
              const bestIdFinal = (compare && lowerBetter)
                ? (() => {
                    const vals = phones.map(p => ({ id: p.id, val: Number(p[key]) })).filter(x => x.val > 0);
                    const allSame = vals.every(v => v.val === vals[0]?.val);
                    if (allSame || !vals.length) return null;
                    return vals.reduce((a, b) => a.val < b.val ? a : b).id;
                  })()
                : bestId;

              return (
                <div key={key as string} className={cn(
                  'grid border-b border-border last:border-0',
                  idx % 2 === 0 ? 'bg-white' : 'bg-paper-2/50'
                )} style={{ gridTemplateColumns: `160px repeat(${cols}, 1fr)` }}>
                  <div className="px-4 py-3 flex items-center">
                    <span className="text-ink-3 text-xs font-medium">{label}</span>
                  </div>
                  {phones.map(phone => {
                    const val = phone[key];
                    const isBest = bestIdFinal === phone.id;
                    return (
                      <div key={phone.id} className={cn(
                        'px-3 py-3 flex items-center justify-center',
                        isBest && 'bg-green-50'
                      )}>
                        <span className={cn(
                          'text-sm font-medium text-center',
                          isBest ? 'text-green-700 font-bold' : 'text-ink'
                        )}>
                          {/* @ts-expect-error dynamic format */}
                          {val != null ? format(val) : 'N/A'}
                          {isBest && <CheckCircle size={12} className="inline ml-1 text-green-500" />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* AI Verdict section */}
      <div className="card p-6 mb-24">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-ink">Worth It Mana?</h2>
              <p className="text-ink-3 text-sm">Analisis jujur dari Groq AI</p>
            </div>
          </div>
          {!verdict && !verdictLoading && (
            <button onClick={getVerdict} className="btn-brand flex items-center gap-2">
              <Sparkles size={15} />
              Tanya AI
            </button>
          )}
        </div>

        {verdictLoading && (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 size={28} className="animate-spin text-brand-500" />
            <p className="text-ink-3 font-medium">AI lagi mikir...</p>
            <div className="flex gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {verdict && (
          <div className="animate-fade-up">
            <div className="bg-gradient-to-br from-amber-50 to-blue-50 rounded-2xl p-5 border border-amber-100">
              <div className="flex items-start gap-2 mb-3">
                <Crown size={16} className="text-brand-500 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Verdict AI</p>
              </div>
              <div className="prose prose-sm max-w-none">
                {verdict.split('\n\n').map((para, i) => (
                  <p key={i} className="text-ink leading-relaxed mb-3 last:mb-0 text-sm">
                    {para}
                  </p>
                ))}
              </div>
            </div>
            <button onClick={getVerdict}
              className="mt-3 text-xs text-ink-3 hover:text-ink flex items-center gap-1 font-medium">
              <Sparkles size={11} />
              Minta analisis ulang
            </button>
          </div>
        )}

        {!verdict && !verdictLoading && (
          <div className="py-6 text-center text-ink-3">
            <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-ink">Bingung mau pilih yang mana?</p>
            <p className="text-sm mt-1">Klik tombol &quot;Tanya AI&quot; dan biarkan AI kasih pendapatnya!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-center py-32 text-ink-3">Memuat...</div>}>
      <CompareContent />
    </Suspense>
  );
}
