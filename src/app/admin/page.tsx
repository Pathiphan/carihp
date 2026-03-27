'use client';
import { useState, useEffect } from 'react';
import { Lock, Search, Edit2, Save, X, Plus, ExternalLink, Loader2, RefreshCw, Trash2, Link } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Smartphone, AffiliateLink } from '@/lib/types';
import { formatRupiah, getDisplayPrice } from '@/lib/utils';

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

  // Affiliate links state
  const [affiliateMap, setAffiliateMap] = useState<Record<string, AffiliateLink[]>>({});
  const [editingAffiliate, setEditingAffiliate] = useState<string | null>(null);
  const [newLinks, setNewLinks] = useState<{ platform: string; url: string; label: string }[]>([]);
  const [savingAffiliate, setSavingAffiliate] = useState(false);
  const [fixingImages, setFixingImages] = useState(false);
  const [fixImageMsg, setFixImageMsg] = useState('');

  const handleLogin = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setAuthed(true);
    else alert('Password salah!');
  };

  const fetchPhones = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('smartphones')
      .select('*')
      .ilike('name', `%${search}%`)
      .order('name');
    setPhones((data as Smartphone[]) || []);
    setLoading(false);
  };

  const fetchAffiliateLinks = async (phoneIds: string[]) => {
    if (!phoneIds.length) return;
    const { data } = await supabase
      .from('affiliate_links')
      .select('*')
      .in('smartphone_id', phoneIds)
      .order('platform');
    if (data) {
      const map: Record<string, AffiliateLink[]> = {};
      for (const link of data as AffiliateLink[]) {
        if (!map[link.smartphone_id]) map[link.smartphone_id] = [];
        map[link.smartphone_id].push(link);
      }
      setAffiliateMap(map);
    }
  };

  useEffect(() => { if (authed) fetchPhones(); }, [search, authed]);
  useEffect(() => {
    if (phones.length) fetchAffiliateLinks(phones.map(p => p.id));
  }, [phones]);

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from('smartphones')
      .update({ ...editData, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setSaved('Tersimpan!');
      setTimeout(() => setSaved(''), 2000);
      setEditingId(null);
      fetchPhones();
    }
  };

  const openAffiliateEdit = (phoneId: string) => {
    setEditingAffiliate(phoneId);
    setNewLinks([{ platform: '', url: '', label: '' }]);
  };

  const addNewLinkRow = () => {
    setNewLinks(prev => [...prev, { platform: '', url: '', label: '' }]);
  };

  const removeNewLinkRow = (idx: number) => {
    setNewLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const updateNewLink = (idx: number, field: string, value: string) => {
    setNewLinks(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const saveAffiliateLinks = async (phoneId: string) => {
    setSavingAffiliate(true);
    const validLinks = newLinks.filter(l => l.platform.trim() && l.url.trim());
    if (validLinks.length > 0) {
      const { error } = await supabase.from('affiliate_links').insert(
        validLinks.map(l => ({
          smartphone_id: phoneId,
          platform: l.platform.trim(),
          url: l.url.trim(),
          label: l.label.trim() || null,
        }))
      );
      if (error) { alert('Gagal simpan: ' + error.message); setSavingAffiliate(false); return; }
    }
    setSavingAffiliate(false);
    setEditingAffiliate(null);
    setNewLinks([]);
    fetchAffiliateLinks(phones.map(p => p.id));
    setSaved('Link affiliate tersimpan!');
    setTimeout(() => setSaved(''), 2000);
  };

  const deleteAffiliateLink = async (linkId: string, phoneId: string) => {
    if (!confirm('Hapus link ini?')) return;
    await supabase.from('affiliate_links').delete().eq('id', linkId);
    fetchAffiliateLinks(phones.map(p => p.id));
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
        setFetchMsg(`Berhasil! HP "${data.name || fetchName}" sudah ditambahkan.`);
        setFetchName('');
        fetchPhones();
      } else {
        setFetchMsg(`Gagal: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch {
      setFetchMsg('Terjadi kesalahan koneksi.');
    }
    setFetching(false);
  };


  const fixMissingImages = async () => {
    setFixingImages(true);
    setFixImageMsg('Memproses...');
    try {
      const res = await fetch('/api/admin/fix-images', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setFixImageMsg(`Selesai! ${data.fixed} gambar diperbaiki dari ${data.total} HP.`);
        fetchPhones();
      } else {
        setFixImageMsg('Gagal: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch {
      setFixImageMsg('Terjadi kesalahan koneksi.');
    }
    setFixingImages(false);
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
          <h2 className="font-display font-bold text-ink mb-1">Tambah HP Baru</h2>
          <p className="text-ink-3 text-sm mb-4">Ketik nama HP untuk fetch spesifikasi otomatis via AI + GSMArena</p>
          <div className="flex gap-3">
            <input type="text" placeholder="Contoh: Samsung Galaxy S25 Ultra" className="input flex-1"
              value={fetchName} onChange={e => setFetchName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetchPhone()} />
            <button onClick={handleFetchPhone} disabled={fetching}
              className="btn-primary flex items-center gap-2 whitespace-nowrap">
              {fetching ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              {fetching ? 'Mencari...' : 'Tambah HP'}
            </button>
          </div>
          {fetchMsg && (
            <p className={`mt-2 text-sm font-medium ${fetchMsg.startsWith('Berhasil') ? 'text-green-600' : 'text-red-500'}`}>
              {fetchMsg}
            </p>
          )}
        </div>


        {/* Fix Missing Images */}
        <div className="card p-5 mb-6">
          <h2 className="font-display font-bold text-ink mb-1">Perbaiki Gambar</h2>
          <p className="text-ink-3 text-sm mb-4">Otomatis cari dan upload gambar untuk HP yang belum punya foto</p>
          <button onClick={fixMissingImages} disabled={fixingImages}
            className="btn-secondary flex items-center gap-2">
            {fixingImages ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {fixingImages ? 'Memproses...' : 'Perbaiki Gambar Sekarang'}
          </button>
          {fixImageMsg && (
            <p className={`mt-2 text-sm font-medium ${fixImageMsg.startsWith('Selesai') ? 'text-green-600' : fixImageMsg === 'Memproses...' ? 'text-blue-500' : 'text-red-500'}`}>
              {fixImageMsg}
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
                  {['Nama HP', 'Harga Tampil', 'Override Harga IDR', 'Link Affiliate', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-ink-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-ink-3">
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  </td></tr>
                ) : phones.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-ink-3">Tidak ada HP ditemukan</td></tr>
                ) : phones.map(phone => (
                  <>
                    <tr key={phone.id} className="border-b border-border hover:bg-paper-2 transition-colors">
                      {/* Nama */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-ink">{phone.name}</p>
                          <p className="text-ink-3 text-xs">{phone.brand} • {phone.release_year}</p>
                        </div>
                      </td>

                      {/* Harga tampil */}
                      <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                        {formatRupiah(getDisplayPrice(phone))}
                        {phone.price_idr_override && <span className="ml-1 text-xs text-green-600">(override)</span>}
                      </td>

                      {/* Override harga */}
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

                      {/* Affiliate links summary */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(affiliateMap[phone.id] || []).length === 0 ? (
                            <span className="text-gray-400 text-xs">Belum ada</span>
                          ) : (
                            (affiliateMap[phone.id] || []).map(link => (
                              <span key={link.id} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full">
                                {link.platform}
                                {link.label && <span className="text-ink-3">({link.label})</span>}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          {editingId === phone.id ? (
                            <>
                              <button onClick={() => saveEdit(phone.id)}
                                className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-semibold">
                                <Save size={12} />Simpan
                              </button>
                              <button onClick={() => setEditingId(null)}
                                className="flex items-center gap-1 text-ink-3 hover:text-ink text-xs">
                                <X size={12} />Batal
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingId(phone.id); setEditData({}); }}
                                className="flex items-center gap-1 text-ink-3 hover:text-accent text-xs font-medium transition-colors">
                                <Edit2 size={12} />Edit Harga
                              </button>
                              <button onClick={() => editingAffiliate === phone.id ? setEditingAffiliate(null) : openAffiliateEdit(phone.id)}
                                className="flex items-center gap-1 text-ink-3 hover:text-accent text-xs font-medium transition-colors">
                                <Link size={12} />Affiliate
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Affiliate editor row */}
                    {editingAffiliate === phone.id && (
                      <tr key={`${phone.id}-affiliate`} className="bg-paper-2 border-b border-border">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="max-w-3xl">
                            <h3 className="font-semibold text-ink text-sm mb-3">Link Affiliate — {phone.name}</h3>

                            {/* Existing links */}
                            {(affiliateMap[phone.id] || []).length > 0 && (
                              <div className="mb-4">
                                <p className="text-ink-3 text-xs mb-2 uppercase tracking-wider font-semibold">Link yang sudah ada</p>
                                <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                                  <thead>
                                    <tr className="bg-paper-3">
                                      <th className="text-left px-3 py-2 text-ink-3 text-xs font-semibold">Platform</th>
                                      <th className="text-left px-3 py-2 text-ink-3 text-xs font-semibold">Label</th>
                                      <th className="text-left px-3 py-2 text-ink-3 text-xs font-semibold">URL</th>
                                      <th className="px-3 py-2"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(affiliateMap[phone.id] || []).map(link => (
                                      <tr key={link.id} className="border-t border-border">
                                        <td className="px-3 py-2 font-medium text-ink">{link.platform}</td>
                                        <td className="px-3 py-2 text-ink-3 text-xs">{link.label || '-'}</td>
                                        <td className="px-3 py-2">
                                          <a href={link.url} target="_blank" rel="noopener noreferrer"
                                            className="text-accent text-xs flex items-center gap-1 hover:underline">
                                            {link.url.slice(0, 40)}{link.url.length > 40 ? '...' : ''}
                                            <ExternalLink size={10} />
                                          </a>
                                        </td>
                                        <td className="px-3 py-2">
                                          <button onClick={() => deleteAffiliateLink(link.id, phone.id)}
                                            className="text-red-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={13} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* New links form */}
                            <p className="text-ink-3 text-xs mb-2 uppercase tracking-wider font-semibold">Tambah link baru</p>
                            <div className="space-y-2 mb-3">
                              {newLinks.map((link, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input type="text" placeholder="Platform (Shopee, Tokopedia, dll)"
                                    className={inputCls} style={{ width: '180px' }}
                                    value={link.platform}
                                    onChange={e => updateNewLink(idx, 'platform', e.target.value)} />
                                  <input type="text" placeholder="Label (opsional, misal: iBox Official)"
                                    className={inputCls} style={{ width: '200px' }}
                                    value={link.label}
                                    onChange={e => updateNewLink(idx, 'label', e.target.value)} />
                                  <input type="text" placeholder="https://..."
                                    className={`${inputCls} flex-1`}
                                    value={link.url}
                                    onChange={e => updateNewLink(idx, 'url', e.target.value)} />
                                  <button onClick={() => removeNewLinkRow(idx)}
                                    className="text-red-400 hover:text-red-600 shrink-0">
                                    <X size={15} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <button onClick={addNewLinkRow}
                                className="flex items-center gap-1 text-accent hover:text-accent/80 text-xs font-semibold">
                                <Plus size={13} />Tambah baris
                              </button>
                              <button onClick={() => saveAffiliateLinks(phone.id)} disabled={savingAffiliate}
                                className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1">
                                {savingAffiliate ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                Simpan Link
                              </button>
                              <button onClick={() => setEditingAffiliate(null)}
                                className="text-ink-3 hover:text-ink text-xs px-3">
                                Tutup
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
