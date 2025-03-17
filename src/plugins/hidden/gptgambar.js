import axios from "axios";
import { uploadGambar2 } from "../../helper/uploader.js";

export const description = "📤 *Image Analyzer* 📤";
export const handler = ['jelasin', 'tulis', 'kanata', 'bacakan', 'bacain', 'kerjain', 'kerjakan', 'jelaskan', `terjemahkan`, 'mangsud', 'maksud']
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {

  if (Buffer.isBuffer(attf)) {
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    try {
      // Pesan sukses upload gambar
      const imageUrl = await uploadGambar2(attf);
      const { data } = await axios.get('https://fastrestapis.fasturl.cloud/aillm/gpt-4o-turbo', {
        params: {
          ask: psn,
          imageUrl,
          style: 'Kamu adalah AI spesialis analisis gambar yang mampu mengenali dan menjelaskan objek, teks, dan kode yang ada di dalam gambar. Jika ada teks, kamu akan mengekstraknya secara akurat. Jika ada kode pemrograman, kamu akan mengidentifikasinya, menjelaskan fungsinya, dan memastikan bisa dieksekusi jika memungkinkan. Penjelasanmu jelas, detail, dan to the point.',
          sessionId: id

        }
      })
      await sock.sendMessage(id, {
        text: data.result,
      }, { quoted: m });
      await sock.sendMessage(id, { react: { text: '✅', key: m.key } })
    } catch (error) {
      // Pesan error
      await sock.sendMessage(id, {
        text: `⚠️ *Terjadi Kesalahan saat upload gambar!* ⚠️\n\n🚨 *Alasan*: ${error.message}\nSilakan coba lagi nanti.`,
      });
    }
    return;
  }

  // Cek kalo ora ana gambar sing dilampirake
  if (!m.message?.conversation && !m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
    return;
  }
  return
};
