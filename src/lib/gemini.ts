'use server';

interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

const GEMINI_API_KEY = process.env.GEMINI_API || process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3.6-flash';

const FE_TABLET_SYSTEM_PROMPT = `
Kamu adalah "Dokter & Asisten Medis Cerdas Fe-Tablet" (Klinik Edukasi Anemia & Suplementasi Tablet Tambah Darah).
Tugas utamamu adalah:
1. Menjawab pertanyaan pasien (terutama remaja putri, calon pengantin, dan ibu) seputar Anemia Defisiensi Besi, Tablet Tambah Darah (TTD), asupan nutrisi kaya zat besi, dan pola hidup sehat.
2. Memberikan edukasi yang jelas, akurat secara medis sesuai pedoman Kemenkes RI dan WHO, ramah, menenangkan, dan mudah dimengerti.
3. Menjelaskan cara mengatasi efek samping umum TTD (misalnya mual adaptif, rasa begah, feses berwarna gelap/kehitaman) dengan tips praktis (minum setelah makan malam/sebelum tidur, minum dengan air putih atau jus jeruk yang kaya vitamin C, hindari bersamaan dengan teh/kopi/susu dengan jeda minimal 2 jam).
4. Menyampaikan pesan bahwa asisten ini bersifat edukatif dan menyarankan konsultasi langsung ke puskesmas/dokter bila ada keluhan berat atau kadar Hb < 8 g/dL.
5. Format jawaban dengan rapi menggunakan poin-poin bila perlu, singkat padat, dan bahasa Indonesia yang hangat, bersahabat, serta menyemangati (gunakan emotikon sopan seperti 🌸, 💊, 💡 bila sesuai).
`;

/**
 * Tanya jawab AI Konsultasi Medis Fe-Tablet
 */
export async function askGeminiConsultationAction(
  prompt: string,
  history: Array<{ sender: 'user' | 'assistant'; text: string }> = []
): Promise<{ success: boolean; answer: string; error?: string }> {
  try {
    if (!GEMINI_API_KEY) {
      return {
        success: false,
        answer: '',
        error: 'GEMINI_API key tidak ditemukan di file .env konfigurasi server.',
      };
    }

    // Format chat contents
    const contents: ChatHistoryItem[] = [];

    // Add historical turns
    for (const h of history.slice(-6)) {
      contents.push({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      });
    }

    // Append latest prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: FE_TABLET_SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error?.message || `HTTP ${response.status}`;
      return {
        success: false,
        answer:
          'Mohon maaf, layanan konsultasi AI sedang sibuk atau mengalami kendala koneksi. Silakan coba kembali sesaat lagi.',
        error: errMsg,
      };
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return {
        success: false,
        answer: 'Tidak ada respons yang dihasilkan oleh AI.',
      };
    }

    return {
      success: true,
      answer: candidateText.trim(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      answer: 'Terjadi kesalahan sistem saat menghubungi server Gemini AI.',
      error: message,
    };
  }
}

/**
 * Generate Draf Artikel Edukasi Kesehatan Otomatis (Admin Feature)
 */
export async function generateAiArticleDraftAction(
  topic: string,
  category: string
): Promise<{
  success: boolean;
  data?: {
    title: string;
    summary: string;
    content: string;
    readTime: string;
  };
  error?: string;
}> {
  try {
    if (!GEMINI_API_KEY) {
      return { success: false, error: 'GEMINI_API key belum dikonfigurasi di .env' };
    }

    const prompt = `
Buatkan draf artikel edukasi kesehatan lengkap dan menarik untuk aplikasi Fe-Tablet (Program Tablet Tambah Darah & Pencegahan Anemia Remaja Putri).
Topik: "${topic}"
Kategori: "${category}"
Target Pembaca: Siswi sekolah, remaja putri, dan pembina UKS.

Berikan output dalam format JSON valid persis seperti ini (tanpa markdown backtick json di luar):
{
  "title": "Judul artikel yang menarik dan edukatif",
  "summary": "Ringkasan 1-2 kalimat pengantar untuk kartu artikel",
  "content": "Isi artikel lengkap dalam format Markdown standar. Gunakan ## untuk Sub-Judul, - untuk Poin/List, dan > Tips UKS: untuk highlight kotak tips penting.",
  "readTime": "3 min read"
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.error?.message || 'Gagal generate artikel AI' };
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return { success: false, error: 'Respons AI kosong' };

    const parsed = JSON.parse(rawText);
    return {
      success: true,
      data: {
        title: parsed.title || topic,
        summary: parsed.summary || '',
        content: parsed.content || '',
        readTime: parsed.readTime || '4 min read',
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg };
  }
}

/**
 * Generate Pesan Pengingat Personal Berdasarkan Profil Siswi/Pengguna (Admin Feature)
 */
export async function generateAiUserNudgeAction(params: {
  userName?: string;
  patientName?: string;
  medicationName: string;
  dosage: string;
  timeSlot: string;
  adherenceRate?: number;
  tone?: 'friendly' | 'urgent' | 'motivational';
}): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    if (!GEMINI_API_KEY) {
      return { success: false, message: '', error: 'API Key missing' };
    }

    const name = params.userName || params.patientName || 'Siswi';

    const prompt = `
Tuliskan 1 pesan pengingat WhatsApp singkat (2-3 kalimat) dari Pembina UKS / Tim Fe-Tablet untuk siswi/pengguna berikut:
- Nama Siswi: ${name}
- Nama Tablet/Obat: ${params.medicationName} (${params.dosage})
- Waktu Minum: ${params.timeSlot}
- Tingkat Kepatuhan Saat Ini: ${params.adherenceRate || 80}%
- Nada Pesan: ${params.tone || 'motivational'}

Pesan harus ramah, menyemangati, ada sedikit sentuhan emotikon hangat, dan mengingatkan pentingnya minum tablet penambah darah tepat waktu untuk cegah anemia. Berikan hanya teks pesannya saja.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      return { success: false, message: '', error: 'Gagal generate pesan AI' };
    }

    const data = await response.json();
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return { success: true, message };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: '', error: msg };
  }
}

export const generateAiPatientNudgeAction = generateAiUserNudgeAction;

