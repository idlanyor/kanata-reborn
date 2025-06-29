import os from 'os';
import si from 'systeminformation'; // Tambahkan library systeminformation

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
    const uptime = os.uptime() / 3600; // Dalam jam

    const hours = Math.floor(uptime);
    const minutes = Math.floor((uptime - hours) * 60);
    const seconds = Math.floor(((uptime - hours) * 60 - minutes) * 60);

    OS += `🧠 *Total RAM*: ${totalMem.toFixed(2)} GB\n`;
    OS += `📊 *RAM Terpakai*: ${usedMem.toFixed(2)} GB (${ramUsagePercent.toFixed(2)}%)\n`;
    OS += `💾 *RAM Tersedia*: ${freeMem.toFixed(2)} GB (${ramFreePercent.toFixed(2)}%)\n\n`;

    // Informasi Waktu Aktif (Uptime)
    OS += `⏱️ *Uptime*: ${hours} jam ${minutes} menit ${seconds} detik\n\n`;

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
    OS += `   📤 *Write*: ${(diskIo.wIO / (1024 ** 2)).toFixed(2)} MB\n\n`;

    // Informasi Jaringan
    const networkStats = await si.networkStats();
    const networkInterfaces = os.networkInterfaces();
    OS += `🌐 *Network Interfaces*:\n`;
    for (const [name, interfaces] of Object.entries(networkInterfaces)) {
        interfaces.forEach((iface) => {
            OS += `   🔹 *${name}* (${iface.family})\n`;
            OS += `      ▪️ IP Address: ${iface.address}\n`;
            OS += `      ▪️ Netmask: ${iface.netmask}\n`;
            OS += `      ▪️ MAC Address: ${iface.mac}\n`;
        });
    }

    OS += `📊 *Network Traffic*:\n`;
    networkStats.forEach((net, index) => {
        OS += `   🔹 *Interface ${index + 1}*:\n`;
        OS += `      ▪️ Received: ${(net.rx_bytes / (1024 ** 2)).toFixed(2)} MB\n`;
        OS += `      ▪️ Transmitted: ${(net.tx_bytes / (1024 ** 2)).toFixed(2)} MB\n`;
        OS += `      ▪️ Speed: ${net.ms} ms\n`;
    });

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
    // let msg = generateWAMessageFromContent(
    //     globalThis.newsLetterJid,
    //     {
    //         orderMessage: {
    //             productId: "8569472943180260",
    //             title: "Kanata Bot",
    //             description: "now",
    //             currencyCode: "IDR",
    //             message: await systemSpec(),
    //             priceAmount1000: "91000",
    //             thumbnail: await getBuffer('https://files.catbox.moe/2wynab.jpg'),
    //             surface: "Kanata Bot",
    //             contextInfo: { mentionedJid: [id] },
    //         },
    //     }, {});
    // await sock.relayMessage(globalThis.newsLetterJid, msg.message, {});
    await sock.sendMessage(globalThis.newsLetterJid, { text: await systemSpec() });
};
