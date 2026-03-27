import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { slugify, usdToIdr } from '@/lib/utils';

// Konversi slug (strip) ke format GSMArena underscore untuk URL gambar
function slugToUnderscore(slug: string): string {
  return slug.replace(/-/g, '_');
}

// Download gambar dari GSMArena CDN dan upload ke Supabase Storage
// Coba berbagai variasi slug karena GSMArena tidak konsisten
async function uploadImageToStorage(
  db: ReturnType<typeof supabaseAdmin>,
  gsmarenaSlug: string
): Promise<string> {
  // Variasi slug yang dicoba satu per satu
  const variants = [
    gsmarenaSlug,                              // apple-iphone-15-pro
    gsmarenaSlug + '-',                        // apple-iphone-15-pro- (trailing strip)
    slugToUnderscore(gsmarenaSlug),            // apple_iphone_15_pro
    slugToUnderscore(gsmarenaSlug) + '_',      // apple_iphone_15_pro_
    gsmarenaSlug.replace(/^[\w]+-/, ''),       // iphone-15-pro (tanpa brand)
  ];

  for (const variant of variants) {
    try {
      const imageUrl = `https://fdn2.gsmarena.com/vv/bigpic/${variant}.jpg`;
      const imgRes = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.gsmarena.com/',
        },
      });

      if (!imgRes.ok) continue;
      const contentType = imgRes.headers.get('content-type') || '';
      if (!contentType.includes('image')) continue;

      const buffer = await imgRes.arrayBuffer();
      // Pastikan bukan gambar placeholder (ukuran terlalu kecil = placeholder)
      if (buffer.byteLength < 5000) continue;

      const filename = `${gsmarenaSlug}.jpg`;
      const { error } = await db.storage
        .from('phone-images')
        .upload(filename, buffer, { contentType: 'image/jpeg', upsert: true });

      if (error) {
        console.error('Upload error:', error.message);
        continue;
      }

      console.log('Gambar berhasil dari variant:', variant);
      return `/api/image/${filename}`;

    } catch {
      continue;
    }
  }

  console.log('Semua variasi slug gagal untuk:', gsmarenaSlug);
  return '';
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

    // ── STEP 1: Gemini generate spesifikasi ───────────────────────
    const geminiPrompt = `Specs for "${name}". Reply ONLY valid JSON, no markdown:
{"name":"","brand":"","release_year":0,"chipset":"","ram_gb":0,"ram_type":"","storage_gb":0,"storage_type":"","battery_mah":0,"charging_watt":0,"screen_size":0.0,"screen_type":"","screen_resolution":"","refresh_rate":0,"os":"","os_skin":"","weight_gram":0,"main_camera_mp":0,"main_camera_aperture":"","main_camera_ois":true,"ultrawide_mp":0,"telephoto_mp":0,"telephoto_zoom":"","front_camera_mp":0,"front_camera_aperture":"","price_usd":0,"geekbench_single":0,"geekbench_multi":0,"antutu_score":0,"gsmarena_slug":"","category":[],"camera_features":[]}
Rules: all numbers as number type. gsmarena_slug must start with parent brand (poco/redmi use xiaomi prefix). category from: gaming,kamera,baterai,budget,flagship,kerja. geekbench required.`;

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://carihp.id',
        'X-Title': 'CariHP',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        max_tokens: 1500,
        temperature: 0.1,
        messages: [
          { role: 'system', content: 'You are a smartphone specs database. Return only valid JSON.' },
          { role: 'user', content: geminiPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      console.error('OpenRouter error:', aiRes.status, err.slice(0, 200));
      return NextResponse.json({ error: 'AI error: ' + aiRes.status }, { status: 502 });
    }

    const aiData = await aiRes.json();
    // Nvidia Nemotron pakai reasoning mode - content bisa null, ambil dari reasoning
    const msg = aiData.choices?.[0]?.message;
    const rawText = msg?.content || 
      msg?.reasoning_details?.find((r: {type: string; text: string}) => r.type === 'reasoning.text')?.text ||
      msg?.reasoning || '';
    console.log('AI raw (400):', rawText.slice(0, 400));

    // Parse JSON
    let specs: Record<string, unknown> = {};
    try {
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      specs = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch {
      console.error('JSON parse error:', rawText.slice(0, 200));
      return NextResponse.json({ error: 'Gagal parse spesifikasi', detail: rawText.slice(0, 200) }, { status: 502 });
    }

    // ── STEP 2: Download + upload gambar ──────────────────────────
    const finalName = (specs.name as string) || name;
    const gsmarenaSlug = (specs.gsmarena_slug as string) || 
      finalName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    console.log('GSMArena slug:', gsmarenaSlug);
    const imageProxyUrl = await uploadImageToStorage(db, gsmarenaSlug);

    // ── STEP 3: Susun dan simpan data ─────────────────────────────
    const brand = (specs.brand as string) || finalName.split(' ')[0];
    const slug = slugify(finalName);
    const priceUsd = (specs.price_usd as number) || 0;
    const priceIdr = priceUsd ? usdToIdr(priceUsd) : 0;

    const chipsetFull = [
      specs.chipset,
      specs.ram_type ? `RAM: ${specs.ram_type}` : null,
      specs.storage_type ? `Storage: ${specs.storage_type}` : null,
    ].filter(Boolean).join(' | ');

    const screenTypeFull = [specs.screen_type, specs.screen_resolution].filter(Boolean).join(', ');
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
      image_url: imageProxyUrl,
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
      source: 'auto',
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

    console.log('Berhasil:', finalName, '| Gambar:', imageProxyUrl ? 'ada' : 'kosong');
    console.log('========================');

    return NextResponse.json({ success: true, slug: phoneData.slug, name: finalName, cached: false });

  } catch (err) {
    console.error('Fetch phone error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
