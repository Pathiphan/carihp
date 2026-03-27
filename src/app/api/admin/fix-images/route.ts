import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function toGSMArenaSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function downloadAndUpload(
  db: ReturnType<typeof supabaseAdmin>,
  phoneId: string,
  phoneName: string
): Promise<boolean> {
  try {
    const slug = toGSMArenaSlug(phoneName);
    const imageUrl = `https://fdn2.gsmarena.com/vv/bigpic/${slug}.jpg`;

    const imgRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.gsmarena.com/',
      },
    });

    if (!imgRes.ok) return false;
    const contentType = imgRes.headers.get('content-type') || '';
    if (!contentType.includes('image')) return false;

    const buffer = await imgRes.arrayBuffer();
    const filename = `${slug}.jpg`;

    const { error: uploadError } = await db.storage
      .from('phone-images')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error for', phoneName, uploadError.message);
      return false;
    }

    // Update image_url di database
    await db.from('smartphones')
      .update({ image_url: `/api/image/${filename}` })
      .eq('id', phoneId);

    console.log('Fixed image for:', phoneName);
    return true;

  } catch (err) {
    console.error('Fix image error for', phoneName, err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = supabaseAdmin();

    // Ambil semua HP yang belum punya gambar atau gambar dari GSMArena langsung
    const { data: phones, error } = await db
      .from('smartphones')
      .select('id, name, image_url')
      .or('image_url.is.null,image_url.eq.,image_url.like.%gsmarena%,image_url.like.%fdn2%');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = phones?.length || 0;
    let fixed = 0;

    console.log(`=== FIX IMAGES: ${total} HP perlu diperbaiki ===`);

    for (const phone of phones || []) {
      const success = await downloadAndUpload(db, phone.id, phone.name);
      if (success) fixed++;
      // Delay kecil agar tidak rate-limited
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`=== SELESAI: ${fixed}/${total} berhasil ===`);

    return NextResponse.json({ success: true, total, fixed });

  } catch (err) {
    console.error('Fix images error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
