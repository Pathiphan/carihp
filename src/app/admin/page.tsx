'use client';
import { useState, useEffect } from 'react';
import { Lock, Search, Edit2, Save, X, Plus, ExternalLink, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Smartphone } from '@/lib/types';
import { formatRupiah, getDisplayPrice } from '@/lib/utils';

// ── Multi-link editor ─────────────────────────────────────────────────────────
function LinkListEditor({
  links,
  onChange,
  placeholder,
}: {
  links: string[];
  onChange: (links: string[]) => void;
  placeholder: string;
}) {
  const update = (idx: number, val: string) => {
    const next = [...links];
    next[idx] = val;
    onChange(next);
  };
  const remove = (idx: number) => onChange(links.filter((_, i) => i !== idx));
  const add = () => onChange([...links, '']);

  return (
    <div className="space-y-1.5">
      {links.map((link, idx) => (
        <div key={idx} className="flex gap-1.5">
          <input
            type="text"
            value={link}
            placeholder={placeholder}
            onChange={e => update(idx, e.target.value)}
            className="bg-paper-3 border border-border text-ink text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent flex-1 min-w-0"
          />
          <button
            onClick={() => remove(idx)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
            title="Hapus link"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1 text-accent text-xs font-semibold hover:underline mt-0.5"
      >
        <Plus size={12} /> Tambah link
      </button>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [phones, setPhones] = useState<Smartphone[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Smartphone>>({});
  const [saved, setSaved] = useState('');
  const [fetchName, setFetchName] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState('');

  const handleLogin = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setAuthed(true); }
    else alert('Password salah!');
  };

  const fetchPhones = async () => {
    setLoading(true);
    const { data } = await supabase.from('smartphones').select('*')
      .ilike('name', `%${search}%`).order('name');
    setPhones((data as Smartphone[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (authed) fetchPhones(); }, [search, authed]);

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from('smartphones')
      .update({ ...editData, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) { setSaved('✓ Tersimpan!'); setTimeout(() => setSaved(''), 2000); setEditingId(null); fetchPhones(); }
  };

  const handleFetchPhone = async () => {
    if (!fetchName.trim()) return;
    setFetching(true);
    setFetchMsg('');
    try {
      const res = await fetch('/api/phones/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fetchName }),
      });
      const data = await res.json();
      if (res.ok) {
        setFetchMsg(`✓ Berhasil! HP "${fetchName}" sudah ditambahkan ke database.`);
        setFetchName('');
        fetchPhones();
      } else {
        setFetchMsg(`✗ ${data.error || 'Gagal fetch HP'}`);
      }
    } catch {
      setFetchMsg('✗ Terjadi kesalahan koneksi.');
    }
    setFetching(false);
  };

  const inputCls = 'bg-paper-3 border border-border text-ink text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-accent w-full';

  if (!authed) return (
    <div className="min-h-screen bg-paper-2 flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
          <Lock size={20} className="text-accent" />
        </div>
        <h1 className="font-display text-xl font-bold text-ink text-center mb-5">Admin Panel</h1>
        <input type="password" placeholder="Password admin" className="input mb-3"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <button onClick={handleLogin} className="btn-primary w-full">Masuk</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Admin Panel</h1>
            <p className="text-ink-3 text-sm mt-0.5">Kelola data HP, link affiliate, dan harga</p>
          </div>
          {saved && <span className="text-green-600 font-semibold text-sm bg-green-50 px-3 py-1.5 rounded-lg">{saved}</span>}
        </div>

        {/* Fetch HP */}
        <div className="card p-5 mb-6">
          <h2 className="font-display font-bold text-ink mb-1">Tambah HP Baru via RapidAPI</h2>
          <p className="text-ink-3 text-sm mb-4">Ketik nama HP → sistem otomatis fetch spesifikasi & thumbnail dari GSMArena</p>
          <div className="flex gap-3">
            <input type="text" placeholder="Contoh: Samsung Galaxy S25 Ultra" className="input flex-1"
              value={fetchName} onChange={e => setFetchName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetchPhone()} />
            <button onClick={handleFetchPhone} disabled={fetching}
              className="btn-primary flex items-center gap-2 whitespace-nowrap">
              {fetching ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Fetch HP
            </button>
          </div>
          {fetchMsg && (
            <p className={`mt-2 text-sm font-medium ${fetchMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
              {fetchMsg}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari HP di database..." className="input pl-11"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper-3 border-b border-border">
                  {['Nama HP', 'Harga Tampil', 'Override Harga IDR', 'Link Shopee', 'Link TikTok', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-ink-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10 text-ink-3">
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  </td></tr>
                ) : phones.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-ink-3">Tidak ada HP ditemukan</td></tr>
                ) : phones.map(phone => (
                  <tr key={phone.id} className="border-b border-border hover:bg-paper-2 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-ink">{phone.name}</p>
                        <p className="text-ink-3 text-xs">{phone.brand} • {phone.release_year} • {phone.source}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                      {formatRupiah(getDisplayPrice(phone))}
                      {phone.price_idr_override && <span className="ml-1 text-xs text-green-600">(override)</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === phone.id ? (
                        <input type="number" className={inputCls} style={{ width: '140px' }}
                          defaultValue={phone.price_idr_override || ''}
                          placeholder="Harga IDR"
                          onChange={e => setEditData(p => ({ ...p, price_idr_override: Number(e.target.value) || null }))} />
                      ) : (
                        <span className="text-ink-3 text-xs">
                          {phone.price_idr_override ? formatRupiah(phone.price_idr_override) : 'Pakai estimasi'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 min-w-[220px]">
                      {editingId === phone.id ? (
                        <LinkListEditor
                          links={editData.link_shopee ?? (phone.link_shopee || [])}
                          onChange={links => setEditData(p => ({ ...p, link_shopee: links.filter(Boolean).length ? links : null }))}
                          placeholder="https://shopee.co.id/..."
                        />
                      ) : (
                        <div className="flex flex-col gap-1">
                          {phone.link_shopee?.length ? (
                            phone.link_shopee.map((url, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="text-green-600 text-xs font-semibold">#{i + 1}</span>
                                <a href={url} target="_blank" rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-accent truncate max-w-[120px] text-xs" title={url}>
                                  {url.replace(/https?:\/\//, '').slice(0, 20)}…
                                </a>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent shrink-0">
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">Belum ada</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 min-w-[220px]">
                      {editingId === phone.id ? (
                        <LinkListEditor
                          links={editData.link_tiktok ?? (phone.link_tiktok || [])}
                          onChange={links => setEditData(p => ({ ...p, link_tiktok: links.filter(Boolean).length ? links : null }))}
                          placeholder="https://www.tiktok.com/..."
                        />
                      ) : (
                        <div className="flex flex-col gap-1">
                          {phone.link_tiktok?.length ? (
                            phone.link_tiktok.map((url, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="text-green-600 text-xs font-semibold">#{i + 1}</span>
                                <a href={url} target="_blank" rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-accent truncate max-w-[120px] text-xs" title={url}>
                                  {url.replace(/https?:\/\//, '').slice(0, 20)}…
                                </a>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent shrink-0">
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">Belum ada</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === phone.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(phone.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-semibold">
                            <Save size={12} />Simpan
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 text-ink-3 hover:text-ink text-xs">
                            <X size={12} />Batal
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(phone.id); setEditData({}); }}
                          className="flex items-center gap-1 text-ink-3 hover:text-accent text-xs font-medium transition-colors">
                          <Edit2 size={12} />Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-ink-3 text-xs mt-4 text-center">
          Total {phones.length} HP di database •
          <button onClick={fetchPhones} className="ml-2 inline-flex items-center gap-1 hover:text-ink">
            <RefreshCw size={11} />Refresh
          </button>
        </p>
      </div>
    </div>
  );
}
