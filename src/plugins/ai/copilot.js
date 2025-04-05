export const handler = 'copilot'
export const description = 'Realtime Copilot AI Provided by FastURL'
import { uploadGambar } from "../../helper/uploader.js";
import { copilotHika } from "../../lib/ai.js";
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    try {
        if (psn.trim() === '') {
            sock.sendMessage(id, {
                text: "Gunakan prefix *copilot* untuk bertanya apa saja ke AI(support gambar juga).\nContoh: _*copilot siapa presiden Indonesia saat ini?*_\n\n",
            });
            return;
        }
        const result = await copilotHika({ prompt: psn, id, imageUrl: Buffer.isBuffer(attf) ? await uploadGambar(attf) : null });
        await sock.sendMessage(id, { text: result.text });
        if (result.images.length > 0) {
            result.images.forEach(async (img) => {
                await sock.sendMessage(id, { image: { url: img.url } })
            });
        }
    } catch (error) {
        await sock.sendMessage(id, { text: `⚠️ *Ups, Terjadi kesalahan*:\n${error.message}` });
    }
};
