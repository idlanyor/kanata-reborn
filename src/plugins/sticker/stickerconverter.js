import { downloadContentFromMessage } from "@antidonasi/baileys";

export const handler = "toimg2";
export const description = "🔄 Konversi Stiker Lanjutan";

// Custom function to get sticker media from both direct and quoted messages
async function getStickerMedia(msg) {
    try {
        let stickerMessage = null;
        let mediaType = 'sticker';
        let messageType = 'stickerMessage';

        // Check if it's a direct sticker message
        if (msg.message?.stickerMessage) {
            stickerMessage = msg.message.stickerMessage;
        }
        // Check if it's a quoted sticker message
        else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
            stickerMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage;
        }
        else {
            throw new Error('No sticker found in message');
        }

        // Download the sticker content
        const stream = await downloadContentFromMessage(stickerMessage, mediaType);
        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        return {
            buffer,
            mimetype: stickerMessage?.mimetype,
            fileName: stickerMessage?.fileName,
            isAnimated: stickerMessage?.isAnimated,
            type: stickerMessage?.type
        };

    } catch (error) {
        console.error('Error downloading sticker:', error);
        throw new Error('Failed to download sticker: ' + error.message);
    }
}

export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    try {
        // Check if message contains a sticker
        if (!m.message?.stickerMessage) {
            // Check if it's a quoted message with sticker
            const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage?.stickerMessage) {
                await sock.sendMessage(id, { 
                    text: `🔄 *Advanced Sticker Converter*\n\n📝 *Cara Penggunaan:*\n• Reply stiker dengan caption: .stickerconv [format]\n• Atau kirim stiker dengan caption: .stickerconv [format]\n\n📋 *Format yang Didukung:*\n• .stickerconv png - Konversi ke PNG (default)\n• .stickerconv jpg - Konversi ke JPG\n• .stickerconv webp - Konversi ke WebP\n• .stickerconv gif - Konversi ke GIF (untuk stiker animasi)\n\n💡 *Fitur:*\n• Konversi stiker ke berbagai format\n• Mendukung stiker animasi dan statis\n• Kualitas tinggi\n• Informasi detail stiker` 
                });
                return;
            }
        }

        // Get the sticker media using custom function
        const stickerData = await getStickerMedia(m);
        
        if (!stickerData || !stickerData.buffer) {
            await sock.sendMessage(id, { 
                text: "❌ Gagal mengambil data stiker. Silakan coba lagi." 
            });
            return;
        }

        // Determine output format
        const format = psn?.toLowerCase() || 'png';
        const supportedFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
        
        if (!supportedFormats.includes(format)) {
            await sock.sendMessage(id, { 
                text: `❌ Format tidak didukung: ${format}\n\n📋 *Format yang didukung:*\n${supportedFormats.map(f => `• ${f.toUpperCase()}`).join('\n')}` 
            });
            return;
        }

        // Set mimetype based on format
        const mimetypeMap = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp',
            'gif': 'image/gif'
        };
        const mimetype = mimetypeMap[format];

        // Send processing message
        const processingMsg = await sock.sendMessage(id, { 
            text: `⏳ Sedang mengkonversi stiker ke ${format.toUpperCase()}...` 
        });

        try {
            // Get sticker information from the data
            const isAnimated = stickerData.isAnimated;
            const stickerType = stickerData.type;
            const fileSize = stickerData.buffer.length;
            const fileSizeKB = (fileSize / 1024).toFixed(2);

            // Create image message from sticker buffer
            const imageMessage = {
                image: stickerData.buffer,
                caption: `🔄 *Advanced Sticker Converter*\n\n📱 *Dikonversi oleh:* Kanata Bot\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}\n📄 *Format Output:* ${format.toUpperCase()}\n🎬 *Tipe Stiker:* ${isAnimated ? 'Animasi' : 'Statis'}\n📊 *Ukuran File:* ${fileSizeKB} KB\n🏷️ *Tipe:* ${stickerType || 'Unknown'}\n\n💡 Stiker berhasil dikonversi dengan kualitas tinggi!`,
                mimetype: mimetype,
                contextInfo: {
                    mentionedJid: [sender]
                }
            };

            // Send the converted image
            await sock.sendMessage(id, imageMessage, { quoted: m });
            
            // Delete processing message
            if (processingMsg.key) {
                await sock.sendMessage(id, { delete: processingMsg.key });
            }

            // Send additional info for animated stickers
            if (isAnimated && format !== 'gif') {
                await sock.sendMessage(id, { 
                    text: `💡 *Tips:* Stiker ini adalah stiker animasi. Untuk hasil terbaik, gunakan format GIF (.stickerconv gif)` 
                });
            }

        } catch (conversionError) {
            console.error('Error converting sticker to image:', conversionError);
            await sock.sendMessage(id, { 
                text: `❌ Gagal mengkonversi stiker ke ${format.toUpperCase()}:\n${conversionError.message}\n\n💡 *Tips:*\n• Pastikan stiker tidak rusak\n• Coba dengan format lain\n• Periksa koneksi internet` 
            });
        }

    } catch (error) {
        console.error('Error in advanced sticker conversion:', error);
        await sock.sendMessage(id, { 
            text: `❌ Terjadi kesalahan:\n${error.message}\n\n🔧 *Solusi:*\n• Pastikan stiker valid\n• Coba lagi dalam beberapa saat\n• Hubungi admin jika masalah berlanjut` 
        });
    }
}; 