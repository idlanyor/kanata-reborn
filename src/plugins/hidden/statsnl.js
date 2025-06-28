import pkg from '@antidonasi/baileys';
import os from 'os';
import si from 'systeminformation';

export const handler = "statsnl"
export const description = "📊 Informasi sistem";
export async function systemSpec() {
    const platform = os.platform();
    const release = os.release();
    const osType = os.type();
    let OS = `🌐「 *Server System Information* 」* 🌐\n\n`;

    // Informasi OS
    OS += `💻 *OS*: ${osType} (${platform} ${release})\n`;

    // Informasi RAM
    const totalMem = os.totalmem() / (1024 ** 3); // Dalam GB
    const freeMem = os.freemem() / (1024 ** 3); // Dalam GB
    const usedMem = totalMem - freeMem;
    const ramUsagePercent = (usedMem / totalMem) * 100; // Persentase RAM terpakai
    const ramFreePercent = (freeMem / totalMem) * 100; // Persentase RAM tersedia
    const uptime = os.uptime(); // Dalam detik

    // Format uptime (Hari, jam, menit, detik)
    const days = Math.floor(uptime / (24 * 3600));
    const hours = Math.floor((uptime % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    OS += `🧠 *Total RAM*: ${totalMem.toFixed(2)} GB\n`;
    OS += `📊 *RAM Terpakai*: ${usedMem.toFixed(2)} GB (${ramUsagePercent.toFixed(2)}%)\n`;
    OS += `💾 *RAM Tersedia*: ${freeMem.toFixed(2)} GB (${ramFreePercent.toFixed(2)}%)\n\n`;

    // Informasi Waktu Aktif (Uptime)
    OS += `⏱️ *Uptime*: ${days} hari ${hours} jam ${minutes} menit ${seconds} detik\n\n`;

    // Informasi CPU
    OS += `🖥️ *CPU Info*:\n`;
    const cpus = os.cpus();
    const cpuLoad = calculateCpuLoad();
    cpus.forEach((cpu, index) => {
        OS += `   🔹 *CPU ${index + 1}*: ${cpu.model}\n`;
    });
    OS += `📉 *CPU Usage*: ${cpuLoad.toFixed(2)}%\n\n`;

    // Informasi IO Bandwidth (Disk Activity)
    const diskIo = await si.disksIO();
    OS += `💽 *Disk Activity*:\n`;
    OS += `   📥 *Read*: ${(diskIo.rIO / (1024 ** 2)).toFixed(2)} MB\n`;
    OS += `   📤 *Write*: ${(diskIo.wIO / (1024 ** 2)).toFixed(2)} MB\n`;

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

    const usage = 100 - (idle / total) * 100;
    return usage;
}

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    await sock.sendMessage(globalThis.newsLetterJid, { text: await systemSpec() });
};