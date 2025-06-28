import { downloadContentFromMessage } from "@antidonasi/baileys";

export const handler = "s2i";
export const description = "🔄 Stiker ke Gambar (Shortcut)";

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
                    text: `🔄 *Stiker ke Gambar*\n\n📝 *Cara Penggunaan:*\n• Reply stiker dengan caption: .s2i\n• Atau kirim stiker dengan caption: .s2i\n\n💡 *Fitur:*\n• Konversi cepat stiker ke PNG\n• Mendukung stiker animasi dan statis\n• Kualitas tinggi` 
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

        // Send processing message
        const processingMsg = await sock.sendMessage(id, { 
            text: "⏳ Sedang mengkonversi stiker..." 
        });

        try {
            // Check if it's an animated sticker
            const isAnimated = stickerData.isAnimated;

            // Create image message from sticker buffer
            const imageMessage = {
                image: stickerData.buffer,
                caption: `🔄 *Stiker ke Gambar*\n\n📱 *Dikonversi oleh:* Kanata Bot\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}\n🎬 *Tipe:* ${isAnimated ? 'Stiker Animasi' : 'Stiker Statis'}\n\n💡 Stiker berhasil dikonversi!`,
                mimetype: 'image/png',
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

        } catch (conversionError) {
            console.error('Error converting sticker to image:', conversionError);
            await sock.sendMessage(id, { 
                text: `❌ Gagal mengkonversi stiker:\n${conversionError.message}` 
            });
        }

    } catch (error) {
        console.error('Error in s2i conversion:', error);
        await sock.sendMessage(id, { 
            text: `❌ Terjadi kesalahan:\n${error.message}` 
        });
    }
}; 