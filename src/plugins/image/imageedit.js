import { GoogleGenerativeAI } from "@google/generative-ai";
export const handler = "imageedit"
export const description = "✨ Edit gambar dengan AI! Kirim/reply gambar dengan caption: *imageedit [deskripsi edit]*";

export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, {
            text: "🖼️ Kirim atau reply gambar dengan caption:\n\n*.imageedit [deskripsi edit]*\n\nContoh:\n*.imageedit tambahkan latar belakang pantai*\n*.imageedit tambahkan efek anime*"
        });
        return;
    }

    if (!psn) {
        await sock.sendMessage(id, {
            text: "✍️ Tambahkan deskripsi edit yang diinginkan!\n\nContoh:\n*.imageedit tambahkan latar belakang pantai*"
        });
        return;
    }

    await sock.sendMessage(id, { text: '🎨 Bentar ya bestie, gw lagi edit gambarnya... ⏳' });

    try {
        // Inisialisasi Gemini dengan API key
        const genAI = new GoogleGenerativeAI(globalThis.apiKey.gemini);
        
        // Setup model dengan konfigurasi khusus untuk editing
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp-image-generation",
            generationConfig: {
                responseModalities: ['Text', 'Image'],
                temperature: 0.4,
                topK: 32,
                topP: 0.8,
            },
        });

        // Konversi buffer ke base64
        const base64Image = attf.toString('base64');

        // Buat prompt yang lebih terstruktur
        const basePrompt = `Kamu adalah editor gambar profesional. Tolong edit gambar ini sesuai permintaan:

"${psn}"

Panduan editing:
- Pertahankan subjek utama dan ekspresinya
- Sesuaikan dengan style yang diminta
- Pastikan hasil tetap natural dan berkualitas tinggi
- Jangan tambahkan watermark atau teks
- Fokus pada detail dan keseimbangan warna

Mohon edit gambar sesuai permintaan tersebut dengan mempertahankan kualitas tinggi.`;

        // Siapkan konten untuk Gemini
        const contents = [
            { text: basePrompt },
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image
                }
            }
        ];

        // Generate konten
        const response = await model.generateContent(contents);
        
        // Proses hasil generate
        for (const part of response.response.candidates[0].content.parts) {
            if (part.inlineData) {
                const imageData = part.inlineData.data;
                const buffer = Buffer.from(imageData, 'base64');
                
                // Kirim hasil ke WhatsApp
                await sock.sendMessage(id, {
                    image: buffer,
                    caption: `✨ Ini hasil editannya bestie!\n\n📝 *Edit yang diminta:* ${psn}\n\n_Generated by Gemini_`
                }, { quoted: {
            key: {
                remoteJid: 'status@broadcast',
                participant: "13135550002@s.whatsapp.net",
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363293401077915@newsletter',
                    newsletterName: 'Roy',
                    caption: 'Kanata V3'
                }
            }
        } });
                return;
            } else if (part.text) {
                console.log("Gemini response text:", part.text);
            }
        }

    } catch (error) {
        console.error("Error in image editing:", error);
        
        let errorMessage = "⚠️ Waduh error nih bestie! ";
        
        if (error.message.includes('invalid argument')) {
            errorMessage += "Format gambarnya gak didukung. Coba kirim gambar JPG/PNG ya?";
        } else if (error.message.includes('too large')) {
            errorMessage += "Gambarnya kegedean! Maksimal 4MB ya.";
        } else if (error.message.includes('network')) {
            errorMessage += "Koneksi ke Gemini lagi bermasalah. Coba lagi ntar ya?";
        } else {
            errorMessage += "Coba lagi ntar ya? 🙏";
        }

        await sock.sendMessage(id, { text: errorMessage });
    }
}; 