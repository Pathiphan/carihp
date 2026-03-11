import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { Smartphone } from '@/lib/types';
import { formatRupiah, getDisplayPrice } from '@/lib/utils';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { phones }: { phones: Smartphone[] } = await req.json();

    const phoneData = phones.map(p => ({
      nama: p.name,
      harga: formatRupiah(getDisplayPrice(p)),
      chipset: p.chipset,
      ram: `${p.ram_gb}GB`,
      baterai: `${p.battery_mah}mAh`,
      kamera: `${p.main_camera_mp}MP`,
      layar: `${p.screen_size}" ${p.screen_type} ${p.refresh_rate}Hz`,
      geekbench_single: p.geekbench_single || 'N/A',
      antutu: p.antutu_score || 'N/A',
    }));

    const prompt = `Bandingkan HP berikut secara singkat dan jelas:
${JSON.stringify(phoneData, null, 2)}

Format jawaban (wajib ikuti):
🏆 PEMENANG OVERALL: [nama HP] — [alasan 1 kalimat]

⚡ Performa: [nama pemenang] unggul karena [alasan singkat]
📷 Kamera: [nama pemenang] unggul karena [alasan singkat]  
🔋 Baterai: [nama pemenang] unggul karena [alasan singkat]
💰 Value: [nama pemenang] unggul karena [alasan singkat]

💬 Kesimpulan: [2-3 kalimat, siapa cocok beli HP mana]

Gunakan bahasa Indonesia santai. Jangan bertele-tele.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 400,
    });

    const verdict = completion.choices[0]?.message?.content || 'Tidak dapat menganalisis saat ini.';

    return NextResponse.json({ verdict });
  } catch (err) {
    console.error('Groq verdict error:', err);
    return NextResponse.json({ verdict: 'Maaf, AI sedang tidak tersedia. Coba lagi nanti.' }, { status: 500 });
  }
}
