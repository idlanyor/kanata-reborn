import { getMp3Murotal } from "../../lib/scraper/murrotal-mp3.js";

export const handler = "murrotal";
export const description = "Download Murrotal Al-Quran MP3";

export default async ({ sock, m, id, psn }) => {
    try {
        await m.react('⏳');
        
        const result = await getMp3Murotal();
        
        if (!result.status) {
            await m.reply('❌ Gagal mengambil data murrotal: ' + result.message);
            return;
        }

        // Jika ada nomor surah spesifik
        if (psn) {
            const surahNumber = psn.trim();
            const surah = result.data.files.find(file => file.file.startsWith(surahNumber + "_"));
            
            if (!surah) {
                await m.reply(`❌ Surah dengan nomor ${surahNumber} tidak ditemukan`);
                return;
            }

            await sock.sendMessage(id, {
                text: `*MURROTAL AL-QURAN*\n\n` +
                      `📖 Surah: ${surah.name}\n` +
                      `🎙️ Qori: ${result.data.reciter}\n` +
                      `📊 Ukuran: ${surah.size}\n\n` +
                      `Sedang mengirim audio...`,
                contextInfo: {
                    externalAdReply: {
                        title: surah.name,
                        body: `Qori: ${result.data.reciter}`,
                        thumbnailUrl: 'https://i.ibb.co/FKhkZrB/quran.jpg',
                        sourceUrl: surah.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });

            // Kirim audio
            await sock.sendMessage(id, {
                audio: { url: surah.url },
                mimetype: 'audio/mp4',
                ptt: false
            });
            
            await m.react('✨');
            return;
        }

        // Buat sections untuk list message
        const sections = [];
        let currentSection = { rows: [] };
        let currentTitle = "";

        result.data.files.forEach(file => {
            // Ambil nomor surah dari nama file
            const surahNum = parseInt(file.file.split("_")[0]);
            // Tentukan kategori berdasarkan nomor surah
            const sectionTitle = surahNum <= 38 ? "Juz 1-4" :
                               surahNum <= 76 ? "Juz 5-8" :
                               "Juz 9-12";

            // Jika section title berubah, buat section baru
            if (currentTitle !== sectionTitle) {
                if (currentTitle !== "") {
                    sections.push({
                        title: currentTitle,
                        rows: currentSection.rows
                    });
                }
                currentTitle = sectionTitle;
                currentSection = { rows: [] };
            }

            currentSection.rows.push({
                title: file.name,
                description: `Ukuran: ${file.size}`,
                rowId: `.murrotal ${surahNum}`
            });
        });

        // Tambahkan section terakhir
        if (currentSection.rows.length > 0) {
            sections.push({
                title: currentTitle,
                rows: currentSection.rows
            });
        }

        const listMessage = {
            text: "*MURROTAL AL-QURAN*\n\n" +
                  "🎙️ Qori: Misyari Rasyid Al-Afasy\n" +
                  "📚 Total Surah: " + result.data.total + "\n\n" +
                  "Silahkan pilih surah yang ingin didengarkan:",
            footer: "© 2024 Kanata Bot",
            title: "Daftar Surah Al-Quran",
            buttonText: "Daftar Surah 📖",
            sections,
            viewOnce: true,
            contextInfo: {
                externalAdReply: {
                    title: 'Murrotal Al-Quran',
                    body: 'Qori: Misyari Rasyid',
                    thumbnailUrl: 'https://i.ibb.co/FKhkZrB/quran.jpg',
                    sourceUrl: 'https://quran.com',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        };

        await sock.sendMessage(id, listMessage);
        await m.react('📖');

    } catch (error) {
        console.error('Error in murrotal command:', error);
        await m.reply('❌ Terjadi kesalahan saat memproses permintaan');
        await m.react('❌');
    }
};

export const help = {
    name: "murrotal",
    description: "Download Murrotal Al-Quran MP3",
    usage: ".murrotal [nomor surah]",
    example: ".murrotal 1"
}; 