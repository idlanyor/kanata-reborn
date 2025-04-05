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
            // Cari surah berdasarkan nomor dengan format 3 digit (001, 002, dll)
            const paddedNumber = surahNumber.padStart(3, '0');
            const surah = result.data.files.find(file => file.file.startsWith(paddedNumber + "_"));
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
                        thumbnailUrl: 'https://files.catbox.moe/mv2mq4.jpg',
                        sourceUrl: surah.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });

            // Kirim audio
            await sock.sendMessage(id, {
                audio: await fetch(surah.url),
                mimetype: 'audio/mpeg',
                ptt: false
            });

            await m.react('✨');
            return;
        }

        const listRows = result.data.files.map(file => {
            const surahNum = parseInt(file.file.split("_")[0]);
            return {
                header: file.name,
                title: '',
                description: `Ukuran: ${file.size}`,
                id: `murrotal ${surahNum}`,
            };
        });

        // Bagi menjadi beberapa section berdasarkan juz
        const sections = [
            {
                title: "Juz 1-4",
                highlight_label: "📖",
                rows: listRows.filter(row => {
                    const surahNum = parseInt(row.id.split(" ")[1]);
                    return surahNum <= 38;
                })
            },
            {
                title: "Juz 5-8",
                highlight_label: "📖",
                rows: listRows.filter(row => {
                    const surahNum = parseInt(row.id.split(" ")[1]);
                    return surahNum > 38 && surahNum <= 76;
                })
            },
            {
                title: "Juz 9-12",
                highlight_label: "📖",
                rows: listRows.filter(row => {
                    const surahNum = parseInt(row.id.split(" ")[1]);
                    return surahNum > 76;
                })
            }
        ];

        await sock.sendMessage(id, {
            text: "*MURROTAL AL-QURAN*\n\n" +
                "🎙️ Qori: Misyari Rasyid Al-Afasy\n" +
                "📚 Total Surah: " + result.data.total + "\n\n" +
                "Silahkan pilih surah yang ingin didengarkan:",
            footer: '© 2024 Kanata Bot',
            buttons: [
                {
                    buttonId: 'action',
                    buttonText: {
                        displayText: 'Daftar Surah 📖'
                    },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: 'Daftar Surah Al-Quran',
                            sections: sections
                        }),
                    },
                },
            ],
            headerType: 1,
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
        }, { quoted: m });

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