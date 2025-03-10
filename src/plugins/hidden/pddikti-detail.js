import { mahasiswaDetail } from "../../lib/scraper/pddikti.js";
import loadAssets from "../../helper/loadAssets.js";

export const handler = "pdd";
export const description = "Dapatkan informasi mahasiswa dari PDDikti berdasarkan NIM atau Nama";

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        return await sock.sendMessage(id, {
            text: "⚠️ Mohon gunakan fitur `pddikti` terlebih dahulu sebelum menjalankan perintah ini."
        });
    }

    await sock.sendMessage(id, {
        text: "⏳ Sedang mengambil data dari PDDikti, harap tunggu sebentar..."
    });

    try {
        const result = await mahasiswaDetail(psn);
        if (!result) {
            return await sock.sendMessage(id, {
                text: "❌ Data tidak ditemukan. Pastikan NIM atau Nama yang dimasukkan benar."
            });
        }

        const text = `🎓 *Informasi Mahasiswa PDDikti* 🎓\n\n`
            + `👤 *Nama:* ${result["Nama"]}\n`
            + `🏛 *Perguruan Tinggi:* ${result["Perguruan Tinggi"]}\n`
            + `🚻 *Jenis Kelamin:* ${result["Jenis Kelamin"]}\n`
            + `📅 *Tanggal Masuk:* ${result["Tanggal Masuk"]}\n`
            + `🆔 *NIM:* ${result["NIM"]}\n`
            + `📚 *Program Studi:* ${result["Jenjang - Program Studi"]}\n`
            + `📝 *Status Awal Mahasiswa:* ${result["Status Awal Mahasiswa"]}\n`
            + `✅ *Status Terakhir Mahasiswa:* ${result["Status Terakhir Mahasiswa"]}`;

        const imageUrl = await loadAssets("pddikti.jpg", "image");
        await sock.sendMessage(id, {
            image: { url: imageUrl },
            caption: text
        }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(id, {
            text: "❌ Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti."
        });
        console.error("Error fetching PDDikti data:", error);
    }
};
