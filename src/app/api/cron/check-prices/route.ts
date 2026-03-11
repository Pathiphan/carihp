import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';
import { getDisplayPrice } from '@/lib/utils';
import { Smartphone } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data: items } = await db.from('watchlist').select('*, smartphone:smartphones(*)');
  if (!items?.length) return NextResponse.json({ message: 'No items', sent: 0 });

  let sent = 0;
  for (const item of items) {
    const phone = item.smartphone as Smartphone;
    if (!phone) continue;
    const currentPrice = getDisplayPrice(phone);
    const shouldNotify = item.target_price && currentPrice <= item.target_price && item.notify_drop;
    if (!shouldNotify) continue;

    try {
      await resend.emails.send({
        from: 'CariHP.id <notifikasi@carihp.id>',
        to: item.email,
        subject: `🎉 Harga ${phone.name} sudah turun!`,
        html: `
          <div style="font-family:'Nunito',sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #E5E7EB;">
            <h2 style="color:#2563EB;font-size:22px;margin:0 0 4px">CariHP.id</h2>
            <p style="color:#6B7280;margin:0 0 24px;font-size:14px">Notifikasi Watchlist</p>
            <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #E5E7EB;">
              <p style="font-size:12px;color:#6B7280;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em;">Kabar baik!</p>
              <h3 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 16px;">${phone.name}</h3>
              <p style="font-size:12px;color:#6B7280;margin:0">Harga sekarang</p>
              <p style="font-size:28px;font-weight:800;color:#16A34A;margin:4px 0 0;">Rp ${currentPrice.toLocaleString('id-ID')}</p>
              ${item.target_price ? `<p style="font-size:12px;color:#6B7280;margin:8px 0 0;">Target kamu: Rp ${item.target_price.toLocaleString('id-ID')}</p>` : ''}
            </div>
            <a href="${phone.link_shopee?.[0] ?? `${process.env.NEXT_PUBLIC_APP_URL}/detail/${phone.slug}`}"
              style="display:block;background:#2563EB;color:white;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
              Lihat & Beli Sekarang →
            </a>
            <p style="color:#9CA3AF;font-size:11px;text-align:center;margin-top:20px;">
              Email ini dikirim karena kamu mendaftar watchlist di CariHP.id
            </p>
          </div>`,
      });
      sent++;
    } catch (e) { console.error('Email error:', e); }
  }

  return NextResponse.json({ success: true, sent });
}
