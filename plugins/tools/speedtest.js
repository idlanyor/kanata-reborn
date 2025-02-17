import speedTest from 'speedtest-net';
import pkg from '@seaavey/baileys';
const { proto, generateWAMessageFromContent } = pkg;

export const handler = "speedtest";

export async function runSpeedTest() {
    try {
        let result = `🌐 *Speed Test Sedang Berjalan*\n\n`;
        result += `⏳ Mohon tunggu sekitar 30 detik...\n`;
        
        const test = await speedTest({
            acceptLicense: true,
            acceptGdpr: true
        });
        
        result = `🚀 *Hasil Speed Test*\n\n`;
        result += `📥 *Download*: ${(test.download.bandwidth / 125000)} Mbps\n`;
        result += `📤 *Upload*: ${(test.upload.bandwidth / 125000)} Mbps\n`;
        result += `📶 *Ping*: ${test.ping.latency} ms\n\n`;
        result += `🌍 *ISP*: ${test.isp}\n`;
        result += `📍 *Server*:\n`;
        result += `   • Nama: ${test.server.name}\n`;
        result += `   • Lokasi: ${test.server.location} (${test.server.country})\n`;
        
        return result;
    } catch (error) {
        throw new Error(`❌ Gagal melakukan speed test: ${error.message}`);
    }
}

export default async ({ sock, m, id }) => {
    try {
        await sock.sendMessage(id, { text: '⏳ Memulai speed test...' });
        
        let msg = generateWAMessageFromContent(
            id,
            {
                orderMessage: {
                    orderId: "8569472943180260",
                    thumbnail: null,
                    itemCount: 1,
                    status: 1,
                    surface: 1,
                    message: await runSpeedTest(),
                    orderTitle: "Speed Test",
                    sellerJid: '0@s.whatsapp.net',
                    token: '1',
                    totalAmount1000: 50000,
                    totalCurrencyCode: "IDR",
                }
            },
            {}
        );

        await sock.relayMessage(id, msg.message, {});
    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ Terjadi kesalahan: ${error.message}`
        });
    }
}; 