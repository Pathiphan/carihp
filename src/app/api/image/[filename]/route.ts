import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    if (!filename) return new NextResponse('Not found', { status: 404 });

    const db = supabaseAdmin();

    // Download dari Supabase Storage (private bucket)
    const { data, error } = await db.storage
      .from('phone-images')
      .download(filename);

    if (error || !data) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const buffer = await data.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Image proxy error:', err);
    return new NextResponse('Error', { status: 500 });
  }
}
