import pkg from '@fizzxydev/baileys-pro';
import { getBuffer } from '../../helper/mediaMsg.js';
const { proto, generateWAMessageFromContent } = pkg;
import os from 'os';
import si from 'systeminformation';

export const handler = "stats";
export const description = "📊 Informasi Sistem Server";

export async function systemSpec() {
    // Dapatkan informasi sistem dasar
    const platform = os.platform();
    const release = os.release();
    const osType = os.type();

    // Format pesan utama
    let OS = `╭─❒ 「 *INFORMASI SISTEM SERVER* 」 ❒\n`;
    OS += `│\n`;

    // Informasi OS
    OS += `├─💻 *Sistem Operasi*\n`;
    OS += `│  └─ ${osType} (${platform} ${release})\n\n`;

    // Informasi RAM
    const totalMem = os.totalmem() / (1024 ** 3);
    const freeMem = os.freemem() / (1024 ** 3);
    const usedMem = totalMem - freeMem;
    const ramUsagePercent = (usedMem / totalMem) * 100;
    const ramFreePercent = (freeMem / totalMem) * 100;

    OS += `├─🧠 *Informasi RAM*\n`;
    OS += `│  ├─ Total: ${totalMem.toFixed(2)} GB\n`;
    OS += `│  ├─ Terpakai: ${usedMem.toFixed(2)} GB (${ramUsagePercent.toFixed(2)}%)\n`;
    OS += `│  └─ Tersedia: ${freeMem.toFixed(2)} GB (${ramFreePercent.toFixed(2)}%)\n\n`;

    // Informasi Uptime
    const uptime = os.uptime() / 3600;
    const hours = Math.floor(uptime);
    const minutes = Math.floor((uptime - hours) * 60);
    const seconds = Math.floor(((uptime - hours) * 60 - minutes) * 60);

    OS += `├─⏱️ *Waktu Aktif*\n`;
    OS += `│  └─ ${hours} jam ${minutes} menit ${seconds} detik\n\n`;

    // Informasi CPU
    const cpus = os.cpus();
    const cpuLoad = calculateCpuLoad();

    OS += `├─🖥️ *Informasi CPU*\n`;
    cpus.forEach((cpu, index) => {
        OS += `│  ├─ Core ${index + 1}: ${cpu.model}\n`;
    });
    OS += `│  └─ Penggunaan: ${cpuLoad.toFixed(2)}%\n\n`;

    // Informasi Jaringan
    const networkStats = await si.networkStats();
    const networkInterfaces = os.networkInterfaces();

    OS += `├─🌐 *Interfaces Jaringan*\n`;
    for (const [name, interfaces] of Object.entries(networkInterfaces)) {
        interfaces.forEach((iface) => {
            OS += `│  ├─ ${name} (${iface.family})\n`;
            OS += `│  │  ├─ IP: ${iface.address}\n`;
            OS += `│  │  ├─ Netmask: ${iface.netmask}\n`;
            OS += `│  │  └─ MAC: ${iface.mac}\n`;
        });
    }

    OS += `│\n`;
    OS += `├─📊 *Traffic Jaringan*\n`;
    networkStats.forEach((net, index) => {
        OS += `│  ├─ Interface ${index + 1}\n`;
        OS += `│  │  ├─ Terima: ${(net.rx_bytes / (1024 ** 2)).toFixed(2)} MB\n`;
        OS += `│  │  ├─ Kirim: ${(net.tx_bytes / (1024 ** 2)).toFixed(2)} MB\n`;
        OS += `│  │  └─ Kecepatan: ${net.ms} ms\n`;
    });

    OS += `│\n`;
    OS += `╰──────────────────`;

    return OS;
}

function calculateCpuLoad() {
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;

    cpus.forEach((core) => {
        for (const type in core.times) {
            total += core.times[type];
        }
        idle += core.times.idle;
    });

    return 100 - (idle / total) * 100;
}

export default async ({ sock, m, id }) => {
    try {
        const msg = generateWAMessageFromContent(
            id,
            {
                orderMessage: {
                    orderId: "1707943303457604",
                    thumbnail: await getBuffer('https://files.catbox.moe/2wynab.jpg'),
                    itemCount: 5,
                    status: 2,
                    surface: "Kanata Bot",
                    message: await systemSpec(),
                    orderTitle: "Speed Test",
                    sellerJid: '0@s.whatsapp.net',
                    token: 'Ad951k70M6Y6QHLfdMgpm7VnWhQ+EeS1kKG5gnmyCwwS/g==',
                    totalAmount1000: 100000,
                    totalCurrencyCode: "IDR",
                    productId: "1707943303457604",
                    title: "Kanata Bot",
                    description: "Informasi Sistem",
                    currencyCode: "IDR",
                    priceAmount1000: "91000",
                    totalCurrencyCode: 'IDR',
                    messageVersion: 2,
                    contextInfo: { mentionedJid: [id] },
                },
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
