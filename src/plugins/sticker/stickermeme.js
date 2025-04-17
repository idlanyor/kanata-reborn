import { createSticker, StickerTypes } from "wa-sticker-formatter";
import axios from 'axios';
import FormData from 'form-data';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export const handler = "smeme"
export const description = "Sticker Meme maker";

async function createMemeWithAPI(imageBuffer, topText, bottomText) {
    try {
        // Simpan gambar ke file sementara
        const tempDir = join(tmpdir(), `meme_${Date.now()}`);
        const imagePath = join(tempDir, 'input.jpg');
        await writeFile(imagePath, imageBuffer);
        
        // Siapkan form data untuk API
        const formData = new FormData();
        formData.append('image', Buffer.from(imageBuffer), {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });
        
        // Tambahkan teks ke form data
        if (topText) formData.append('top', topText);
        if (bottomText) formData.append('bottom', bottomText);
        
        // Kirim ke API
        const response = await axios.post('https://api.memegen.link/images/custom', formData, {
            headers: {
                ...formData.getHeaders(),
                'Accept': 'image/png'
            },
            responseType: 'arraybuffer'
        });
        
        // Hapus file sementara
        await unlink(imagePath).catch(() => {});
        
        // Kembalikan buffer hasil
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Error creating meme with API:', error);
        throw error;
    }
}

export default async ({ sock, m, id, psn, attf }) => {
    try {
        let mediaBuffer;
        
        // Cek media dari quote atau attachment
        if (m.quotedMsg) {
            const quotedMsg = m.quotedMsg;
            if (quotedMsg.type === 'image') {
                mediaBuffer = await quotedMsg.download();
            } else {
                await m.reply('❌ Hanya gambar yang didukung untuk saat ini');
                return;
            }
        } else if (attf && m.type === 'image') {
            mediaBuffer = attf;
        } else {
            await m.reply('❌ Kirim/reply gambar dengan caption .smeme text1.text2\n\nNote: text2 bersifat opsional');
            return;
        }

        // Parse teks
        let topText = '', bottomText = '';
        if (psn) {
            const texts = psn.split('.').map(t => t.trim());
            if (texts.length === 1) {
                bottomText = texts[0];
            } else if (texts.length >= 2) {
                [topText, bottomText] = texts;
            }
        }

        if (!topText && !bottomText) {
            await m.reply('❌ Masukkan teks untuk meme! Format: .smeme text1.text2');
            return;
        }

        await m.react('⏳');

        // Buat meme menggunakan API
        const memeBuffer = await createMemeWithAPI(mediaBuffer, topText, bottomText);

        // Buat sticker
        const stickerOptions = {
            pack: "Kanata sMeme",
            author: "Roy~404~",
            type: StickerTypes.FULL,
            quality: 100
        };

        const sticker = await createSticker(memeBuffer, stickerOptions);
        
        await sock.sendMessage(id, { 
            sticker: sticker 
        }, { 
            quoted: m 
        });

        await m.react('✨');
        
    } catch (error) {
        console.error('Error in smeme:', error);
        await m.reply('❌ Terjadi kesalahan saat memproses meme');
        await m.react('❌');
    }
};

export const help = {
    name: 'smeme',
    description: 'Membuat sticker meme dari gambar',
    usage: '.smeme text1.text2 (reply/kirim gambar)'
};
