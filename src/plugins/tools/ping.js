import pkg from '@fizzxydev/baileys-pro';
const { proto, generateWAMessageFromContent } = pkg
import moment from 'moment';
import os from 'os';

export const description = "Ping Bot & System Info";
export const handler = "ping";

const calculatePing = function (timestamp, now) {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getSystemInfo = () => {
    const totalRAM = os.totalmem();
    const freeRAM = os.freemem();
    const usedRAM = totalRAM - freeRAM;
    const ramUsage = ((usedRAM / totalRAM) * 100).toFixed(2);
    
    const uptime = os.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return {
        ram: {
            total: formatBytes(totalRAM),
            used: formatBytes(usedRAM),
            free: formatBytes(freeRAM),
            usage: ramUsage
        },
        uptime: {
            hours,
            minutes,
            seconds
        },
        platform: os.platform(),
        arch: os.arch()
    };
};

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    const pingTime = calculatePing(m.messageTimestamp, Date.now());
    const sysInfo = getSystemInfo();
    
    // Generate progress bar for RAM
    const progressBarLength = 10;
    const filledBars = Math.round((sysInfo.ram.usage / 100) * progressBarLength);
    const progressBar = '█'.repeat(filledBars) + '░'.repeat(progressBarLength - filledBars);

    const message = generateWAMessageFromContent(id, proto.Message.fromObject({
        extendedTextMessage: {
            text: `*🤖 KANATA BOT STATUS*\n\n` +
                  `*⚡ Response Time:* ${pingTime} detik\n\n` +
                  `*💻 System Information*\n` +
                  `➸ *Platform:* ${sysInfo.platform} (${sysInfo.arch})\n` +
                  `➸ *RAM Usage:* ${progressBar} ${sysInfo.ram.usage}%\n` +
                  `➸ *Total RAM:* ${sysInfo.ram.total}\n` +
                  `➸ *Used RAM:* ${sysInfo.ram.used}\n` +
                  `➸ *Free RAM:* ${sysInfo.ram.free}\n\n` +
                  `*⏰ Uptime:* ${sysInfo.uptime.hours}h ${sysInfo.uptime.minutes}m ${sysInfo.uptime.seconds}s\n\n` +
                  `_Powered by Kanata Bot_`,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 9999999,
                externalAdReply: {
                    title: `乂 Kanata Bot Status 乂`,
                    body: `Response Time: ${pingTime}s`,
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true,
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    showAdAttribution: true,
                    description: `Klik iklan untuk mengirim pesan!`
                },
                mentionedJid: [m.sender]
            }
        }
    }), { userJid: id, quoted:m });

    await sock.relayMessage(id, message.message, { messageId: message.key.id });

    // Kirim reaksi berdasarkan kecepatan respons
    let reactionEmoji = '🚀'; // Default fast
    if (pingTime > 3) reactionEmoji = '⚡'; // Medium
    if (pingTime > 5) reactionEmoji = '🐌'; // Slow
    
    await sock.sendMessage(id, { 
        react: { 
            text: reactionEmoji, 
            key: m.key 
        } 
    });
};
