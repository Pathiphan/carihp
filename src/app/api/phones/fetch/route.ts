import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { slugify, usdToIdr } from '@/lib/utils';

// Ambil gambar dari Google Custom Search API
async function fetchImageFromGoogle(query: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;
    if (!apiKey || !cx) {
      console.error('Google Search API key atau CX tidak ada di .env.local');
      return '';
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=5&imgType=photo&imgSize=large`;
    const res = await fetch(url);

    if (!res.ok) {
      const err = await res.text();
      console.error('Google Search error:', res.status, err.slice(0, 200));
      return '';
    }

    const data = await res.json();
    const items = data?.items || [];

    // Ambil gambar pertama yang valid
    for (const item of items) {
      const imgUrl: string = item.link || '';
      if (imgUrl && imgUrl.startsWith('http')) {
        return imgUrl;
      }
    }
    return '';
  } catch (err) {
    console.error('Google image fetch error:', err);
    return '';
  }
}

// Fetch halaman GSMArena dan extract spesifikasi
async function fetchFromGSMArena(name: string): Promise<string> {
  try {
    // Search GSMArena
    const searchUrl = `https://www.gsmarena.com/search.php3?sQuickSearch=1&sName=${encodeURIComponent(name)}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!searchRes.ok) return '';
    const searchHtml = await searchRes.text();

    // Ambil link halaman detail pertama
    const linkMatch = searchHtml.match(/href="([\w-]+-\d+\.php)"/);
    if (!linkMatch) return '';

    const detailUrl = `https://www.gsmarena.com/${linkMatch[1]}`;
    const detailRes = await fetch(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
    });

    if (!detailRes.ok) return '';
    const html = await detailRes.text();

    // Extract tabel spesifikasi (cukup bagian penting saja, max 8000 char)
    const specStart = html.indexOf('<div id="specs-list">');
    const specEnd = html.indexOf('</div>', specStart + 5000);
    if (specStart === -1) return html.slice(0, 8000);
    return html.slice(specStart, specEnd > specStart ? specEnd + 6 : specStart + 8000);

  } catch (err) {
    console.error('GSMArena fetch error:', err);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const db = supabaseAdmin();

    // Cek apakah sudah ada di database
    const { data: existing } = await db
      .from('smartphones')
      .select('id, slug')
      .ilike('name', `%${name}%`)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, slug: existing.slug, cached: true });
    }

    console.log('=== FETCH HP:', name, '===');

    // ── STEP 1: Fetch data dari GSMArena ─────────────────────────
    const gsmarenaHtml = await fetchFromGSMArena(name);
    console.log('GSMArena data:', gsmarenaHtml ? `${gsmarenaHtml.length} chars` : 'tidak ada');

    // ── STEP 2: Groq parse spesifikasi dari HTML GSMArena ─────────
    const prompt = gsmarenaHtml
      ? `Ekstrak spesifikasi smartphone "${name}" dari HTML GSMArena berikut:

${gsmarenaHtml.slice(0, 6000)}

Kembalikan HANYA JSON valid tanpa markdown, tanpa backtick:`
      : `Berikan spesifikasi lengkap smartphone "${name}" berdasarkan pengetahuanmu.
Kembalikan HANYA JSON valid tanpa markdown, tanpa backtick:`;

    const jsonFormat = `{
  "name": "nama lengkap resmi",
  "brand": "brand saja",
  "release_year": 2025,
  "chipset": "Snapdragon 8 Elite (3nm)",
  "ram_gb": 12,
  "ram_type": "LPDDR5X",
  "storage_gb": 256,
  "storage_type": "UFS 4.0",
  "battery_mah": 3692,
  "charging_watt": 30,
  "screen_size": 6.3,
  "screen_type": "Super Retina XDR OLED",
  "screen_resolution": "1290x2796",
  "refresh_rate": 60,
  "os": "iOS 18",
  "os_skin": "",
  "weight_gram": 170,
  "main_camera_mp": 48,
  "main_camera_aperture": "f/1.6",
  "main_camera_ois": true,
  "ultrawide_mp": 12,
  "telephoto_mp": 0,
  "telephoto_zoom": "",
  "front_camera_mp": 12,
  "front_camera_aperture": "f/1.9",
  "price_usd": 799,
  "geekbench_single": 3500,
  "geekbench_multi": 8900,
  "antutu_score": 1600000,
  "category": ["flagship"],
  "camera_features": ["48MP f/1.6 OIS main", "12MP ultrawide", "12MP selfie f/1.9"]
}

Aturan penting:
- Semua angka harus tipe number bukan string
- battery_mah harus AKURAT sesuai spesifikasi resmi
- geekbench_single dan geekbench_multi harus diisi berdasarkan chipset (wajib)
- category pilih dari: gaming, kamera, baterai, budget, flagship, kerja
- Kalau telephoto tidak ada isi 0`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah parser spesifikasi smartphone yang akurat. Selalu kembalikan JSON valid tanpa teks lain.',
          },
          { role: 'user', content: prompt + '\n\nFormat JSON:\n' + jsonFormat },
        ],
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('Groq error:', groqRes.status, err.slice(0, 200));
      return NextResponse.json({ error: 'Groq AI error: ' + groqRes.status }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const rawText = groqData.choices?.[0]?.message?.content || '';
    console.log('Groq raw (400):', rawText.slice(0, 400));

    // Parse JSON dari response
    let specs: Record<string, unknown> = {};
    try {
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      specs = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch {
      console.error('JSON parse error:', rawText.slice(0, 200));
      return NextResponse.json({ error: 'Gagal parse JSON dari Groq', detail: rawText.slice(0, 200) }, { status: 502 });
    }

    // ── STEP 3: Google Custom Search untuk gambar ─────────────────
    const finalName = (specs.name as string) || name;
    const imageQuery = `${finalName} smartphone`;
    console.log('Cari gambar:', imageQuery);
    const imageUrl = await fetchImageFromGoogle(imageQuery);
    console.log('Gambar:', imageUrl ? 'ditemukan' : 'tidak ditemukan');

    // ── STEP 4: Susun data dan simpan ke database ─────────────────
    const brand = (specs.brand as string) || finalName.split(' ')[0];
    const slug = slugify(finalName);
    const priceUsd = (specs.price_usd as number) || 0;
    const priceIdr = priceUsd ? usdToIdr(priceUsd) : 0;

    // Gabungkan detail ke field yang ada
    const chipsetFull = [
      specs.chipset,
      specs.ram_type ? `RAM: ${specs.ram_type}` : null,
      specs.storage_type ? `Storage: ${specs.storage_type}` : null,
    ].filter(Boolean).join(' | ');

    const screenTypeFull = [
      specs.screen_type,
      specs.screen_resolution,
    ].filter(Boolean).join(', ');

    const osFull = [specs.os, specs.os_skin].filter(Boolean).join(', ');

    let cameraFeatures: string[] = [];
    if (Array.isArray(specs.camera_features) && specs.camera_features.length > 0) {
      cameraFeatures = specs.camera_features as string[];
    } else {
      if (specs.main_camera_mp) cameraFeatures.push(`${specs.main_camera_mp}MP ${specs.main_camera_aperture || ''} ${specs.main_camera_ois ? 'OIS' : ''}`.trim());
      if (specs.ultrawide_mp && (specs.ultrawide_mp as number) > 0) cameraFeatures.push(`${specs.ultrawide_mp}MP ultrawide`);
      if (specs.telephoto_mp && (specs.telephoto_mp as number) > 0) cameraFeatures.push(`${specs.telephoto_mp}MP ${specs.telephoto_zoom || 'tele'}`);
      if (specs.front_camera_mp) cameraFeatures.push(`${specs.front_camera_mp}MP selfie ${specs.front_camera_aperture || ''}`.trim());
    }

    const phoneData = {
      name: finalName,
      brand,
      slug,
      image_url: imageUrl,
      price_usd: priceUsd,
      price_idr: priceIdr,
      price_idr_override: null,
      release_year: (specs.release_year as number) || new Date().getFullYear(),
      chipset: (chipsetFull || 'Unknown').slice(0, 200),
      ram_gb: (specs.ram_gb as number) || 8,
      storage_gb: (specs.storage_gb as number) || 128,
      battery_mah: (specs.battery_mah as number) || 4000,
      screen_size: (specs.screen_size as number) || 6.5,
      screen_type: (screenTypeFull || 'AMOLED').slice(0, 100),
      refresh_rate: (specs.refresh_rate as number) || 60,
      os: (osFull || 'Android').slice(0, 100),
      weight_gram: (specs.weight_gram as number) || 185,
      main_camera_mp: (specs.main_camera_mp as number) || 50,
      front_camera_mp: (specs.front_camera_mp as number) || 16,
      camera_features: cameraFeatures,
      antutu_score: (specs.antutu_score as number) || 0,
      geekbench_single: (specs.geekbench_single as number) || 0,
      geekbench_multi: (specs.geekbench_multi as number) || 0,
      rating_overall: 7.0,
      rating_camera: 7.0,
      rating_battery: 7.0,
      rating_performance: 7.0,
      rating_value: 7.0,
      category: (specs.category as string[]) || [],
      link_shopee: null,
      link_tiktok: null,
      link_official: null,
      source: 'groq_ai',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await db.from('smartphones').insert(phoneData);

    if (insertError) {
      if (insertError.code === '23505') {
        phoneData.slug = `${slug}-${Date.now()}`;
        const { error: retryError } = await db.from('smartphones').insert(phoneData);
        if (retryError) {
          console.error('Retry error:', retryError);
          return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
        }
      } else {
        console.error('Insert error:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    console.log('Berhasil:', finalName, '| Gambar:', imageUrl ? 'ada' : 'kosong');
    console.log('========================');

    return NextResponse.json({ success: true, slug: phoneData.slug, name: finalName, cached: false });

  } catch (err) {
    console.error('Fetch phone error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
