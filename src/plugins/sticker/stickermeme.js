import { createSticker, StickerTypes } from "wa-sticker-formatter";
import { uploadGambar2 } from '../../helper/uploader.js'

export const handler = "smeme"
export const description = "Sticker Meme maker";

export default async ({ sock, m, id, psn, attf }) => {
    try {
        let imageBuffer;
        
        // Cek apakah ada gambar yang di-quote atau dikirim langsung
        if (m.quotedMsg) {
            return
            // imageBuffer = await m.quotedMsg.download();
        } else if (attf) {
            imageBuffer = attf;
        } else {
            await m.reply('❌ Kirim/reply gambar dengan caption .smeme text1|text2\n\nNote: text2 bersifat opsional');
            return;
        }

        // Cek format teks
        let topText = ' ', bottomText = ' ';
        if (psn) {
            const texts = psn.split('.').map(t => t.trim());
            if (texts.length === 1) {
                // Jika hanya 1 teks, jadikan bottom text
                bottomText = texts[0];
            } else if (texts.length === 2) {
                // Jika 2 teks, jadikan top dan bottom
                [topText, bottomText] = texts;
            }
        }

        if (!topText && !bottomText) {
            await m.reply('❌ Masukkan teks untuk meme! Format: .smeme text1.text2');
            return;
        }

        // Upload gambar ke imgbb
        const imageUrl = await uploadGambar2(imageBuffer);
        if (!imageUrl) {
            await m.reply('❌ Gagal mengupload gambar!');
            return;
        }

        // Generate meme menggunakan memegen.link API
        const memeUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(topText)}/${encodeURIComponent(bottomText || ' ')}.png?background=${encodeURIComponent(imageUrl)}`;

        // Buat sticker
        const stickerOptions = {
            pack: "Kanata sMeme",
            author: "Roy~404~",
            type: StickerTypes.FULL,
            quality: 100
        };

        try {
            const response = await fetch(memeUrl);
            if (!response.ok) throw new Error('Gagal mengambil meme');
            
            const buffer = await response.arrayBuffer();
            const sticker = await createSticker(Buffer.from(buffer), stickerOptions);
            
            await sock.sendMessage(id, { 
                sticker: sticker 
            }, { 
                quoted: m 
            });

            await m.react('✨');
        } catch (error) {
            console.error('Error creating sticker:', error);
            await m.reply('❌ Gagal membuat sticker meme!');
            await m.react('❌');
        }

    } catch (error) {
        console.error('Error in smeme:', error);
        await m.reply('❌ Terjadi kesalahan saat memproses meme');
        await m.react('❌');
    }
};

export const help = {
    name: 'smeme',
    description: 'Membuat sticker meme',
    usage: '.smeme text1|text2 (reply/kirim gambar)'
};
