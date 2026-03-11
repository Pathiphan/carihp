'use client';
import { useState } from 'react';
import { Bell, Search, TrendingDown, TrendingUp, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { WatchlistItem } from '@/lib/types';
import { formatRupiah, getDisplayPrice } from '@/lib/utils';
import Link from 'next/link';

export default function WatchlistPage() {
  const [email, setEmail] = useState('');
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchWatchlist = async () => {
    if (!email || !email.includes('@')) return;
    setLoading(true);
    const { data } = await supabase.from('watchlist')
      .select('*, smartphone:smartphones(*)')
      .eq('email', email)
      .order('created_at', { ascending: false });
    setItems((data as WatchlistItem[]) || []);
    setSearched(true);
    setLoading(false);
  };

  const deleteItem = async (id: string) => {
    await supabase.from('watchlist').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-paper-2">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Watchlist Harga</h1>
          <p className="text-ink-3 mt-2">Pantau harga HP favoritmu, dapat notifikasi email saat harga berubah</p>
        </div>

        <div className="card p-6 mb-6">
          <label className="label mb-2 block">Masukkan email kamu</label>
          <div className="flex gap-3">
            <input type="email" placeholder="nama@email.com" className="input flex-1"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchWatchlist()} />
            <button onClick={fetchWatchlist} disabled={loading}
              className="btn-primary flex items-center gap-2 whitespace-nowrap">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              Cek
            </button>
          </div>
        </div>

        {searched && (
          items.length === 0 ? (
            <div className="text-center py-16 text-ink-3">
              <Bell size={36} className="mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-ink">Tidak ada watchlist</p>
              <p className="text-sm mt-1">untuk email <span className="text-ink font-medium">{email}</span></p>
              <Link href="/" className="btn-primary mt-5 inline-flex">Cari HP & Tambah Watchlist</Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-ink-3 text-sm">{items.length} HP dalam watchlist</p>
              {items.map(item => (
                <div key={item.id} className="card p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/detail/${item.smartphone?.slug}`}>
                      <h3 className="font-display font-semibold text-ink hover:text-accent transition-colors">
                        {item.smartphone?.name}
                      </h3>
                    </Link>
                    <p className="text-accent font-semibold text-sm mt-0.5">
                      {item.smartphone ? formatRupiah(getDisplayPrice(item.smartphone)) : ''}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {item.notify_drop && (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <TrendingDown size={11} />Notif turun
                        </span>
                      )}
                      {item.notify_rise && (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                          <TrendingUp size={11} />Notif naik
                        </span>
                      )}
                      {item.target_price && (
                        <span className="text-ink-3 text-xs">Target: {formatRupiah(item.target_price)}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
