'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { OnboardingAnswers } from '@/lib/types';
import { formatRupiah, cn } from '@/lib/utils';

const USAGE_TYPES = [
  { id: 'gaming', label: 'Gaming', emoji: '🎮', desc: 'Main game berat, butuh performa tinggi' },
  { id: 'kamera', label: 'Kamera', emoji: '📷', desc: 'Foto & video berkualitas tinggi' },
  { id: 'kerja', label: 'Kerja & Produktivitas', emoji: '💼', desc: 'Email, dokumen, meeting online' },
  { id: 'sosmed', label: 'Sosial Media', emoji: '📱', desc: 'Scrolling, upload konten, stories' },
  { id: 'baterai', label: 'Baterai Tahan Lama', emoji: '🔋', desc: 'Seharian penuh tanpa charging' },
  { id: 'tipis', label: 'Tipis & Ringan', emoji: '✨', desc: 'Enak dibawa kemana-mana' },
];

const PRIORITIES = [
  { id: 'performa', label: 'Performa', emoji: '⚡' },
  { id: 'kamera', label: 'Kamera', emoji: '📷' },
  { id: 'baterai', label: 'Baterai', emoji: '🔋' },
  { id: 'layar', label: 'Layar', emoji: '🖥️' },
  { id: 'desain', label: 'Desain & Build', emoji: '✨' },
  { id: 'harga', label: 'Harga Terjangkau', emoji: '💰' },
];

const BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'OnePlus', 'Google', 'Nothing', 'POCO'];

const BUDGET_PRESETS = [
  { label: '< Rp 2 jt', min: 0, max: 2000000 },
  { label: 'Rp 2–4 jt', min: 2000000, max: 4000000 },
  { label: 'Rp 4–7 jt', min: 4000000, max: 7000000 },
  { label: 'Rp 7–12 jt', min: 7000000, max: 12000000 },
  { label: '> Rp 12 jt', min: 12000000, max: 30000000 },
];

const STORAGE_KEY = 'carihp_onboarding';

const DEFAULT_ANSWERS: OnboardingAnswers = {
  usageTypes: [],
  budgetMin: 2000000,
  budgetMax: 7000000,
  priorities: [],
  brandFavorites: [],
  brandAvoid: [],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>(DEFAULT_ANSWERS);
  const [loading, setLoading] = useState(false);

  // Load saved answers
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setAnswers(JSON.parse(saved));
    } catch {}
  }, []);

  // Save answers on change
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch {}
  }, [answers]);

  const totalSteps = 4;

  const navigate = useCallback((dir: 'forward' | 'back') => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep(s => dir === 'forward' ? s + 1 : s - 1);
      setAnimating(false);
    }, 350);
  }, [animating]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      router.push('/');
      // Pass answers via sessionStorage — homepage reads it and calls Groq
    } catch {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return answers.usageTypes.length > 0;
    if (step === 1) return true;
    if (step === 2) return answers.priorities.length > 0;
    return true;
  };

  const toggleItem = (arr: string[], item: string): string[] =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => step > 0 && navigate('back')}
          className={cn(
            'flex items-center gap-1 text-sm font-medium transition-all',
            step > 0 ? 'text-ink-2 hover:text-ink' : 'text-transparent pointer-events-none'
          )}
        >
          <ChevronLeft size={16} /> Kembali
        </button>
        <span className="text-sm text-ink-3 font-medium">
          {step + 1} <span className="text-gray-300">dari</span> {totalSteps}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              i <= step ? 'bg-accent' : 'bg-gray-200'
            )} />
          ))}
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div
          className={cn(
            'w-full max-w-2xl',
            animating && direction === 'forward' && 'slide-exit-left',
            animating && direction === 'back' && 'slide-exit-right',
            !animating && direction === 'forward' && 'slide-enter-left',
            !animating && direction === 'back' && 'slide-enter-right',
          )}
        >
          {/* SLIDE 1 — Usage type */}
          {step === 0 && (
            <div>
              <div className="text-center mb-10">
                <span className="text-4xl mb-4 block">🤔</span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3">
                  HP ini buat apa?
                </h1>
                <p className="text-ink-3 text-lg">Pilih semua yang sesuai kebutuhanmu</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {USAGE_TYPES.map(({ id, label, emoji, desc }) => (
                  <button
                    key={id}
                    onClick={() => setAnswers(a => ({ ...a, usageTypes: toggleItem(a.usageTypes, id) }))}
                    className={cn(
                      'p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02]',
                      answers.usageTypes.includes(id)
                        ? 'border-accent bg-accent/5 shadow-md'
                        : 'border-border bg-white hover:border-accent/40'
                    )}
                  >
                    <div className="text-2xl mb-2">{emoji}</div>
                    <p className="font-display font-bold text-ink text-sm">{label}</p>
                    <p className="text-ink-3 text-xs mt-0.5 leading-snug">{desc}</p>
                    {answers.usageTypes.includes(id) && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE 2 — Budget */}
          {step === 1 && (
            <div>
              <div className="text-center mb-10">
                <span className="text-4xl mb-4 block">💰</span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3">
                  Budget kamu berapa?
                </h1>
                <p className="text-ink-3 text-lg">Pilih rentang harga yang cocok</p>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {BUDGET_PRESETS.map(({ label, min, max }) => {
                  const active = answers.budgetMin === min && answers.budgetMax === max;
                  return (
                    <button
                      key={label}
                      onClick={() => setAnswers(a => ({ ...a, budgetMin: min, budgetMax: max }))}
                      className={cn(
                        'py-4 px-5 rounded-2xl border-2 font-semibold text-center transition-all duration-200 hover:scale-[1.02]',
                        active
                          ? 'border-accent bg-accent text-white shadow-md'
                          : 'border-border bg-white text-ink hover:border-accent/40'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Custom range */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <p className="label mb-4">atau tentukan sendiri</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-ink-3">Min</span>
                      <span className="font-semibold text-ink">{formatRupiah(answers.budgetMin)}</span>
                    </div>
                    <input type="range" min={0} max={30000000} step={500000}
                      value={answers.budgetMin}
                      onChange={e => setAnswers(a => ({ ...a, budgetMin: Number(e.target.value) }))}
                      className="w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-ink-3">Max</span>
                      <span className="font-semibold text-ink">{formatRupiah(answers.budgetMax)}</span>
                    </div>
                    <input type="range" min={0} max={30000000} step={500000}
                      value={answers.budgetMax}
                      onChange={e => setAnswers(a => ({ ...a, budgetMax: Number(e.target.value) }))}
                      className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3 — Priorities */}
          {step === 2 && (
            <div>
              <div className="text-center mb-10">
                <span className="text-4xl mb-4 block">⭐</span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3">
                  Yang paling penting buat kamu?
                </h1>
                <p className="text-ink-3 text-lg">Pilih maksimal 3 prioritas utama</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PRIORITIES.map(({ id, label, emoji }) => {
                  const selected = answers.priorities.includes(id);
                  const idx = answers.priorities.indexOf(id);
                  const maxReached = answers.priorities.length >= 3 && !selected;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        if (maxReached) return;
                        setAnswers(a => ({ ...a, priorities: toggleItem(a.priorities, id) }));
                      }}
                      disabled={maxReached}
                      className={cn(
                        'p-5 rounded-2xl border-2 text-center transition-all duration-200 relative',
                        selected ? 'border-accent bg-accent/5 shadow-md' : 'border-border bg-white',
                        maxReached ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] hover:border-accent/40'
                      )}
                    >
                      <div className="text-2xl mb-2">{emoji}</div>
                      <p className="font-display font-bold text-ink text-sm">{label}</p>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {idx + 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SLIDE 4 — Brand */}
          {step === 3 && (
            <div>
              <div className="text-center mb-10">
                <span className="text-4xl mb-4 block">🏷️</span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3">
                  Ada preferensi brand?
                </h1>
                <p className="text-ink-3 text-lg">Opsional — skip kalau tidak ada preferensi</p>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="label mb-3">Brand favorit kamu</p>
                  <div className="flex flex-wrap gap-2">
                    {BRANDS.map(brand => (
                      <button key={brand}
                        onClick={() => setAnswers(a => ({ ...a, brandFavorites: toggleItem(a.brandFavorites, brand) }))}
                        className={cn(
                          'px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200',
                          answers.brandFavorites.includes(brand)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-border bg-white text-ink-2 hover:border-green-300'
                        )}>
                        {answers.brandFavorites.includes(brand) && '✓ '}{brand}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label mb-3">Brand yang mau dihindari</p>
                  <div className="flex flex-wrap gap-2">
                    {BRANDS.map(brand => (
                      <button key={brand}
                        onClick={() => setAnswers(a => ({ ...a, brandAvoid: toggleItem(a.brandAvoid, brand) }))}
                        className={cn(
                          'px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200',
                          answers.brandAvoid.includes(brand)
                            ? 'border-red-400 bg-red-50 text-red-600'
                            : 'border-border bg-white text-ink-2 hover:border-red-300'
                        )}>
                        {answers.brandAvoid.includes(brand) && '✕ '}{brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom action */}
      <div className="px-4 pb-8 flex justify-center">
        {step < totalSteps - 1 ? (
          <button
            onClick={() => canProceed() && navigate('forward')}
            disabled={!canProceed()}
            className={cn(
              'flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-bold text-lg transition-all duration-200',
              canProceed()
                ? 'bg-accent text-white hover:bg-blue-700 hover:scale-[1.02] shadow-float'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}>
            Lanjut <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-bold text-lg bg-brand-500 text-white hover:bg-brand-600 hover:scale-[1.02] shadow-float transition-all duration-200">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Lihat Rekomendasi AI
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
