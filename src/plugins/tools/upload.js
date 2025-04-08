import { uploadFile } from "../../helper/uploader.js";
import { sendIAMessage } from "../../helper/button.js";

export const description = "📤 *Upload File to Catbox* 📤";
export const handler = 'tourl'

export default async ({ sock, m, id, psn, sender, noTel, attf, mime }) => {
    if (!Buffer.isBuffer(attf)) {
        await m.reply(`📤 *CATBOX UPLOADER*\n\n*Cara Penggunaan:*\n- Kirim file dengan caption .tourl\n- Reply file dengan .tourl\n\n*Support:*\n- Image\n- Video\n- Document\n- Audio`);
        return;
    }

    try {
        // Get filename from message
        const fileName = m.message?.documentMessage?.fileName ||
            m.message?.imageMessage?.fileName ||
            m.message?.videoMessage?.fileName ||
            m.message?.audioMessage?.fileName ||
            `file${Date.now()}${mime ? '.' + mime.split('/')[1] : ''}`;

        const fileUrl = await uploadFile(attf, fileName);

        const btns = [
            {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Copy Link',
                    copy_code: fileUrl,
                }),
            },
            {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Visit Link',
                    url: fileUrl,
                }),
            }
        ];

        const caption = `*📤 UPLOAD BERHASIL!*\n\n` +
            `📁 *Nama File:* ${fileName}\n` +
            `📊 *Ukuran:* ${(attf.length / (1024 * 1024)).toFixed(2)} MB\n` +
            `🔗 *Link:* ${fileUrl}\n\n` +
            `📝 *Note:* Klik tombol Copy Link untuk menyalin URL\n` +
            `atau gunakan tombol Visit Link untuk membuka file.\n\n` +
            `_Powered by Kanata Bot_`;

        await sendIAMessage(id, btns, m, {
            header: '乂 Catbox File Uploader 乂',
            content: caption,
            footer: '© 2024 Kanata Bot • Created with ❤️ by Roy',
            media: fileUrl,
            mediaType: mime?.startsWith('image/') ? "image" : "document"
        }, sock);

        await m.react('✅');

    } catch (error) {
        console.log('❌ Error uploading file:', error);
        await m.reply(`⚠️ *Upload Gagal!*\n\n🚨 *Error:* ${error.message}\n\nSilakan coba lagi nanti.`);
        await m.react('❌');
    }
};
