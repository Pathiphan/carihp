import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { Smartphone, OnboardingAnswers } from '@/lib/types';
import { formatRupiah, getDisplayPrice } from '@/lib/utils';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { answers, phones }: { answers: OnboardingAnswers; phones: Smartphone[] } = await req.json();

    const phoneList = phones.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: formatRupiah(getDisplayPrice(p)),
      chipset: p.chipset,
      ram: `${p.ram_gb}GB`,
      battery: `${p.battery_mah}mAh`,
      camera: `${p.main_camera_mp}MP`,
      antutu: p.antutu_score,
      rating: p.rating_overall,
      category: p.category?.join(', '),
    }));

    const prompt = `Kamu adalah asisten pemilih smartphone yang ramah dan jujur. 
    
Profil pengguna:
- Kebutuhan: ${answers.usageTypes.join(', ')}
- Budget: ${formatRupiah(answers.budgetMin)} - ${formatRupiah(answers.budgetMax)}
- Prioritas utama: ${answers.priorities.join(' > ')}
- Brand favorit: ${answers.brandFavorites.length ? answers.brandFavorites.join(', ') : 'tidak ada'}
- Brand yang dihindari: ${answers.brandAvoid.length ? answers.brandAvoid.join(', ') : 'tidak ada'}

Daftar HP yang tersedia:
${JSON.stringify(phoneList, null, 2)}

Tugasmu:
1. Pilih 3-5 HP yang PALING cocok untuk profil pengguna ini dari daftar di atas
2. Setiap HP harus dari daftar yang diberikan (gunakan id yang sama persis)
3. Berikan alasan singkat dan santai dalam bahasa Indonesia (maks 1 kalimat per HP)
4. Berikan summary singkat kenapa pilihan ini cocok

Balas HANYA dalam format JSON berikut (tanpa penjelasan lain):
{
  "recommended": [
    {"id": "uuid-disini", "reason": "alasan singkat kenapa cocok untuk user ini"},
    {"id": "uuid-disini", "reason": "alasan singkat"},
    {"id": "uuid-disini", "reason": "alasan singkat"}
  ],
  "summary": "Satu kalimat ringkasan rekomendasi untuk user ini dalam bahasa Indonesia santai"
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (err) {
    console.error('Groq recommend error:', err);
    return NextResponse.json({ recommended: [], summary: '' }, { status: 500 });
  }
}
