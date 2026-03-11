'use client';
import { useState } from 'react';
import { X, Bell, TrendingDown, TrendingUp, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Smartphone } from '@/lib/types';
import { formatRupiah, getDisplayPrice, cn } from '@/lib/utils';

export default function WatchlistModal({ phone, onClose }: { phone: Smartphone; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [notifyDrop, setNotifyDrop] = useState(true);
  const [notifyRise, setNotifyRise] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) { setError('Masukkan email yang valid'); return; }
    if (!notifyDrop && !notifyRise) { setError('Pilih minimal satu jenis notifikasi'); return; }
    setLoading(true); setError('');
    const { error: dbError } = await supabase.from('watchlist').insert({
      email, smartphone_id: phone.id,
      target_price: targetPrice ? Number(targetPrice) : null,
      notify_drop: notifyDrop, notify_rise: notifyRise,
    });
    if (dbError) setError('Gagal menyimpan. Coba lagi.');
    else setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-float w-full max-w-md animate-fade-up border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
              <Bell size={17} className="text-accent" />
            </div>
            <div>
              <h2 className="font-display font-bold text-ink">Tambah ke Watchlist</h2>
              <p className="text-ink-3 text-xs">{phone.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-green-600" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink mb-2">Berhasil ditambahkan!</h3>
            <p className="text-ink-3 text-sm">Kamu akan dapat email ke <span className="text-ink font-medium">{email}</span> saat harga {phone.name} berubah.</p>
            <button onClick={onClose} className="btn-primary mt-5 w-full">Tutup</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="bg-paper-3 rounded-xl p-3 flex justify-between items-center">
              <span className="text-ink-3 text-sm">Harga saat ini</span>
              <span className="font-display font-bold text-ink">{formatRupiah(getDisplayPrice(phone))}</span>
            </div>
            <div>
              <label className="label mb-1.5 block">Email kamu</label>
              <input type="email" placeholder="nama@email.com" className="input"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label mb-1.5 block">Target harga (opsional)</label>
              <input type="number" placeholder="Notifikasi jika harga turun di bawah angka ini"
                className="input" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} />
            </div>
            <div>
              <label className="label mb-2 block">Notifikasi saat</label>
              <div className="space-y-2">
                {[
                  { key: 'drop', icon: TrendingDown, label: 'Harga Turun', active: notifyDrop, onClick: () => setNotifyDrop(!notifyDrop), color: 'green' },
                  { key: 'rise', icon: TrendingUp, label: 'Harga Naik', active: notifyRise, onClick: () => setNotifyRise(!notifyRise), color: 'red' },
                ].map(({ key, icon: Icon, label, active, onClick, color }) => (
                  <button key={key} onClick={onClick}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200',
                      active
                        ? color === 'green' ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-600'
                        : 'border-border text-ink-3 hover:border-gray-300'
                    )}>
                    <Icon size={15} />
                    <span className="text-sm font-semibold">{label}</span>
                    {active && <Check size={13} className="ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleSubmit} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? 'Menyimpan...' : <><Bell size={15} />Aktifkan Notifikasi</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
