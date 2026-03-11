'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, GitCompare, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Smartphone, FilterOptions, OnboardingAnswers } from '@/lib/types';
import SmartphoneCard from '@/components/SmartphoneCard';
import { formatRupiah, cn } from '@/lib/utils';
import Link from 'next/link';

const STORAGE_KEY = 'carihp_onboarding';
const CATEGORIES = ['gaming', 'kamera', 'baterai', 'budget', 'flagship', 'kerja'];
const BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'OnePlus', 'Google'];
const SORTS = [
  { value: 'rating', label: 'Rating Terbaik' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'antutu', label: 'Performa Terbaik' },
  { value: 'newest', label: 'Terbaru' },
];

interface AIResult {
  recommended: Array<{ id: string; reason: string }>;
  summary: string;
}

export default function HomePage() {
  const [phones, setPhones] = useState<Smartphone[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState<Smartphone[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ sort: 'rating' });
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchFetch, setSearchFetch] = useState('');
  const [fetchingPhone, setFetchingPhone] = useState(false);

  // Load onboarding answers
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.usageTypes?.length > 0) setOnboardingAnswers(parsed);
      }
    } catch {}
  }, []);

  const fetchPhones = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('smartphones').select('*');
    if (filters.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters.brand) query = query.eq('brand', filters.brand);
    if (filters.category) query = query.contains('category', [filters.category]);
    if (filters.min_price) query = query.gte('price_idr', filters.min_price);
    if (filters.max_price) query = query.lte('price_idr', filters.max_price);
    if (filters.min_ram) query = query.gte('ram_gb', filters.min_ram);

    switch (filters.sort) {
      case 'price_asc': query = query.order('price_idr', { ascending: true }); break;
      case 'price_desc': query = query.order('price_idr', { ascending: false }); break;
      case 'antutu': query = query.order('antutu_score', { ascending: false }); break;
      case 'newest': query = query.order('release_year', { ascending: false }); break;
      default: query = query.order('rating_overall', { ascending: false });
    }

    const { data } = await query.limit(24);
    setPhones((data as Smartphone[]) || []);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchPhones(); }, [fetchPhones]);

  // Auto-run AI recommendation if onboarding was done
  useEffect(() => {
    if (onboardingAnswers && phones.length > 0 && !aiResult) {
      runAiRecommendation(phones);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingAnswers, phones]);

  const runAiRecommendation = async (phoneList: Smartphone[]) => {
    if (!onboardingAnswers || phoneList.length === 0) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/phones/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: onboardingAnswers, phones: phoneList.slice(0, 20) }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
      }
    } catch {}
    setAiLoading(false);
  };

  // Fetch phone on demand if not found in DB
  const handleFetchPhone = async () => {
    if (!searchFetch.trim()) return;
    setFetchingPhone(true);
    try {
      const res = await fetch('/api/phones/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: searchFetch }),
      });
      if (res.ok) {
        setFilters(prev => ({ ...prev, search: searchFetch }));
        fetchPhones();
      }
    } catch {}
    setFetchingPhone(false);
  };

  const toggleCompare = (phone: Smartphone) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === phone.id)) return prev.filter(p => p.id !== phone.id);
      if (prev.length >= 4) return prev;
      return [...prev, phone];
    });
  };

  const aiRecommendedIds = aiResult?.recommended.map(r => r.id) || [];
  const topRecommended = aiResult?.recommended[0];

  // Sort phones: AI recommended first
  const sortedPhones = [...phones].sort((a, b) => {
    const aIdx = aiRecommendedIds.indexOf(a.id);
    const bIdx = aiRecommendedIds.indexOf(b.id);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-accent/8 border border-accent/20 rounded-full px-4 py-1.5 text-accent text-sm font-semibold mb-5">
              <Sparkles size={13} />
              Didukung Groq AI
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink leading-tight mb-4">
              Temukan HP yang{' '}
              <span className="text-accent">Tepat</span>{' '}
              untuk Kamu
            </h1>
            <p className="text-ink-3 text-lg leading-relaxed mb-8">
              Jawab beberapa pertanyaan singkat dan biarkan AI merekomendasikan smartphone terbaik sesuai kebutuhanmu.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link href="/onboarding"
                className="flex items-center justify-center gap-2 bg-brand-500 text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-brand-600 transition-all hover:scale-[1.02] shadow-md text-base">
                <Sparkles size={18} />
                Mulai Rekomendasi AI
              </Link>
              <button
                onClick={() => document.getElementById('phone-list')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 bg-paper-3 text-ink-2 font-semibold px-7 py-3.5 rounded-2xl hover:bg-gray-200 transition-all border border-border text-base">
                Lihat Semua HP
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama HP atau ketik HP yang tidak ada..."
                className="input pl-11 h-13 shadow-sm"
                value={filters.search || ''}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyDown={async e => {
                  if (e.key === 'Enter' && filters.search) {
                    setSearchFetch(filters.search);
                  }
                }}
              />
            </div>

            {/* On-demand fetch hint */}
            {filters.search && phones.length === 0 && !loading && (
              <div className="mt-3 flex items-center justify-center gap-3">
                <p className="text-ink-3 text-sm">HP tidak ditemukan di database.</p>
                <button
                  onClick={() => { setSearchFetch(filters.search || ''); handleFetchPhone(); }}
                  disabled={fetchingPhone}
                  className="flex items-center gap-1.5 text-accent text-sm font-semibold hover:underline">
                  {fetchingPhone ? <Loader2 size={13} className="animate-spin" /> : null}
                  Cari & tambah otomatis →
                </button>
              </div>
            )}

            {/* Category shortcuts */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {CATEGORIES.map(cat => (
                <button key={cat}
                  onClick={() => setFilters(prev => ({ ...prev, category: prev.category === cat ? undefined : cat }))}
                  className={cn(
                    'badge px-4 py-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer border',
                    filters.category === cat
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-ink-2 border-border hover:border-accent/40 hover:text-accent'
                  )}>
                  {cat === 'gaming' && 'Game '}
                  {cat === 'kamera' && 'Foto '}
                  {cat === 'baterai' && 'Batt '}
                  {cat === 'budget' && 'Budget '}
                  {cat === 'flagship' && 'Flag '}
                  {cat === 'kerja' && 'Kerja '}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Result Banner */}
      {(aiLoading || aiResult) && (
        <section className="bg-gradient-to-r from-amber-50 to-blue-50 border-b border-border py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {aiLoading ? (
              <div className="flex items-center gap-3 text-ink-2">
                <Loader2 size={18} className="animate-spin text-accent" />
                <span className="font-medium">AI sedang menganalisis preferensimu...</span>
                <div className="flex gap-1 ml-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            ) : aiResult && (
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-ink text-sm">Rekomendasi AI untuk kamu</p>
                    <p className="text-ink-3 text-sm mt-0.5 leading-relaxed">{aiResult.summary}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAiResult(null); setOnboardingAnswers(null); sessionStorage.removeItem(STORAGE_KEY); }}
                  className="flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink border border-border bg-white rounded-lg px-3 py-1.5 shrink-0">
                  <X size={12} /> Reset
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Phone list */}
      <section id="phone-list" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <p className="text-ink-3 text-sm">
              <span className="text-ink font-bold">{phones.length}</span> HP ditemukan
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn('flex items-center gap-2 btn-ghost text-sm', showFilters && 'text-accent bg-accent/8')}>
              <SlidersHorizontal size={14} />
              Filter
            </button>
          </div>
          <select className="input w-auto text-sm py-2 pl-3"
            value={filters.sort}
            onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value as FilterOptions['sort'] }))}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="card p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label mb-2 block">Merek</label>
              <select className="input text-sm py-2"
                value={filters.brand || ''}
                onChange={e => setFilters(prev => ({ ...prev, brand: e.target.value || undefined }))}>
                <option value="">Semua Merek</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-2 block">Harga Maks</label>
              <select className="input text-sm py-2"
                value={filters.max_price || ''}
                onChange={e => setFilters(prev => ({ ...prev, max_price: Number(e.target.value) || undefined }))}>
                <option value="">Semua Harga</option>
                {[2000000, 3000000, 5000000, 8000000, 15000000].map(p => (
                  <option key={p} value={p}>{formatRupiah(p)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label mb-2 block">Min RAM</label>
              <select className="input text-sm py-2"
                value={filters.min_ram || ''}
                onChange={e => setFilters(prev => ({ ...prev, min_ram: Number(e.target.value) || undefined }))}>
                <option value="">Semua RAM</option>
                {[4, 6, 8, 12].map(r => <option key={r} value={r}>{r}GB+</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => setFilters({ sort: 'rating' })}
                className="btn-ghost text-sm w-full justify-center flex items-center gap-2 border border-border rounded-xl py-2.5">
                <X size={13} /> Reset
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-80 animate-pulse bg-paper-3" />
            ))}
          </div>
        ) : phones.length === 0 ? (
          <div className="text-center py-20 text-ink-3">
            <Search size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold text-ink">HP tidak ditemukan</p>
            <p className="text-sm mt-1">Coba ubah filter atau ketik nama HP lalu tekan Enter untuk cari otomatis</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sortedPhones.map(phone => {
              const aiItem = aiResult?.recommended.find(r => r.id === phone.id);
              return (
                <SmartphoneCard
                  key={phone.id}
                  phone={phone}
                  onCompare={toggleCompare}
                  isInCompare={!!compareList.find(p => p.id === phone.id)}
                  highlight={topRecommended?.id === phone.id}
                  aiReason={aiItem?.reason}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Compare floating bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-up w-full max-w-xl px-4">
          <div className="bg-white border border-border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-float">
            <GitCompare size={17} className="text-accent shrink-0" />
            <div className="flex items-center gap-2 flex-1 overflow-x-auto">
              {compareList.map(p => (
                <div key={p.id} className="flex items-center gap-1.5 bg-paper-3 rounded-lg px-2.5 py-1.5 shrink-0">
                  <span className="text-xs font-semibold text-ink whitespace-nowrap">{p.name}</span>
                  <button onClick={() => toggleCompare(p)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={11} />
                  </button>
                </div>
              ))}
              {compareList.length < 4 && (
                <span className="text-ink-3 text-xs shrink-0">+{4 - compareList.length} lagi</span>
              )}
            </div>
            {compareList.length >= 2 && (
              <Link
                href={`/compare?ids=${compareList.map(p => p.id).join(',')}`}
                className="btn-primary flex items-center gap-1.5 text-sm py-2 shrink-0">
                Bandingkan <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
