/**
 * @author : idlanyor~VC~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Pray Schedule Notification
 * @module : ES6 Module
 * Bebas tempel jangan copot we em-nya 🙇
 */
import { readFile } from 'fs/promises';
import fs from 'fs/promises';
import fetch from 'node-fetch';
import cron from 'node-cron';
import { setTimeout } from 'timers';
import pkg from '@seaavey/baileys';
const { proto, generateWAMessageFromContent } = pkg;

const URL = 'https://fastrestapis.fasturl.cloud/religious/prayerschedule?city=Purbalingga';
const FILE_PATH = 'lib/services/jadwalshalat.json';
const ADZAN_AUDIO = 'lib/assets/audio/adzan.mp3';
const IMSAK_AUDIO = 'lib/assets/audio/imsak.mp3';

const data = await readFile(FILE_PATH, 'utf-8');
const jsh = JSON.parse(data);
const today = new Date().getDate().toString().padStart(2, '0');
const jadwalToday = jsh.result.monthSchedule.find(item => item.date === today);

async function fetchPrayerSchedule() {
    try {
        const response = await fetch(URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
        console.log(`Prayer schedule updated: ${new Date().toISOString()}`);
    } catch (error) {
        console.error('Failed to fetch prayer schedule:', error);
    }
}

const delayUntil = (targetTime, callback) => {
    const now = new Date();
    const delay = targetTime - now;

    if (delay > 0) {
        setTimeout(callback, delay);
    }
};

export const schedulePrayerReminders = async (sock, chatId) => {
    if (!jadwalToday) {
        console.log('Jadwal tidak ditemukan untuk hari ini');
        return;
    }

    const now = new Date();
    
    const prayerTimes = [
        { name: 'Sahur', time: "02:30", isAdzan: false, isImsak: false },
        { name: 'Imsyak', time: jadwalToday.imsyak, isAdzan: false, isImsak: true },
        { name: 'Shubuh', time: jadwalToday.shubuh, isAdzan: true, isImsak: false },
        { name: 'Terbit', time: jadwalToday.terbit, isAdzan: false, isImsak: false },
        { name: 'Dhuha', time: jadwalToday.dhuha, isAdzan: false, isImsak: false },
        { name: 'Dzuhur', time: jadwalToday.dzuhur, isAdzan: true, isImsak: false },
        { name: 'Ashar', time: jadwalToday.ashr, isAdzan: true, isImsak: false },
        { name: 'Maghrib', time: jadwalToday.maghrib, isAdzan: true, isImsak: false },
        { name: 'Isya', time: jadwalToday.isya, isAdzan: true, isImsak: false }
    ];

    prayerTimes.forEach(({ name, time, isAdzan, isImsak }) => {
        const [hours, minutes] = time.split(':').map(Number);
        const prayerTime = new Date(now);
        prayerTime.setHours(hours, minutes, 0, 0);

        delayUntil(prayerTime, async () => {
            const message = generateWAMessageFromContent(chatId, proto.Message.fromObject({
                extendedTextMessage: {
                    text: generatePrayerMessage(name, time),
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 9999999,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363305152329358@newsletter',
                            newsletterName: 'Kanata Prayer Times',
                            serverMessageId: -1
                        },
                        externalAdReply: {
                            title: `🕌 Waktu ${name} telah tiba`,
                            body: `${time} WIB • Purbalingga`,
                            thumbnailUrl: getPrayerImage(name),
                            sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }
            }), { userJid: chatId });

            await sock.relayMessage(chatId, message.message, { messageId: message.key.id });

            // Kirim audio adzan atau imsak jika waktunya
            if (isAdzan) {
                await sock.sendMessage(chatId, { 
                    audio: { url: ADZAN_AUDIO },
                    mimetype: 'audio/mp4',
                    ptt: true,
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 9999999,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363305152329358@newsletter',
                            newsletterName: 'Kanata Prayer Times',
                            serverMessageId: -1
                        }
                    }
                });
            } else if (isImsak) {
                await sock.sendMessage(chatId, { 
                    audio: { url: IMSAK_AUDIO },
                    mimetype: 'audio/mp4',
                    ptt: true,
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 9999999,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363305152329358@newsletter',
                            newsletterName: 'Kanata Prayer Times',
                            serverMessageId: -1
                        }
                    }
                });
            }
        });
    });
};

function generatePrayerMessage(name, time) {
    let text = `╭─「 *WAKTU SHALAT* 」\n`;
    text += `├ 🕌 *${name}*\n`;
    text += `├ 🕐 *${time} WIB*\n`;
    text += `├ 📍 *Purbalingga dan sekitarnya*\n│\n`;

    switch (name) {
        case 'Sahur':
            text += `├ Waktunya *${name}*, mari bergegas\n`;
            text += `├ menyiapkan santapan sahur 📿🤲🏻\n`;
            text += `├ _Selamat menjalankan ibadah Sahur_\n`;
            break;
        case 'Imsyak':
            text += `├ Waktu *${name}* telah tiba\n`;
            text += `├ Selamat menjalankan ibadah puasa\n`;
            text += `├ Semoga puasa kita diterima Allah SWT 🤲🏻\n`;
            break;
        case 'Terbit':
            text += `├ *Semangat Pagi*\n`;
            text += `├ Waktu *${name}* telah tiba\n`;
            text += `├ Selamat beraktifitas, semoga hari ini\n`;
            text += `├ senantiasa dilindungi Allah SWT 🤲🏻\n`;
            break;
        case 'Maghrib':
            text += `├ 🌙 *Selamat Berbuka Puasa!* 🌙\n`;
            text += `├ Waktu *${name}* telah tiba\n`;
            text += `├ Silakan berbuka puasa dengan yang manis\n`;
            text += `├ dan jangan lupa shalat Maghrib 🤲🏻\n`;
            break;
        default:
            if (['Shubuh', 'Dzuhur', 'Ashar', 'Isya'].includes(name)) {
                text += `├ Waktu Shalat *${name}* telah tiba\n`;
                text += `├ Mari tinggalkan aktivitas sejenak\n`;
                text += `├ Ambil wudhu dan laksanakan kewajiban 📿🤲🏻\n`;
            }
    }

    text += `╰──────────────────\n\n`;
    text += `_Powered by Kanata-V2_`;
    return text;
}

function getPrayerImage(name) {
    const images = {
        'Sahur': 'https://telegra.ph/file/sahur.jpg',
        'Imsyak': 'https://telegra.ph/file/imsak.jpg',
        'Shubuh': 'https://telegra.ph/file/subuh.jpg',
        'Terbit': 'https://telegra.ph/file/terbit.jpg',
        'Dhuha': 'https://telegra.ph/file/dhuha.jpg',
        'Dzuhur': 'https://telegra.ph/file/dzuhur.jpg',
        'Ashar': 'https://telegra.ph/file/ashar.jpg',
        'Maghrib': 'https://telegra.ph/file/maghrib.jpg',
        'Isya': 'https://telegra.ph/file/isya.jpg'
    };
    return images[name] || 'https://s6.imgcdn.dev/YYoFZh.jpg';
}

cron.schedule('0 0 */28 * *', fetchPrayerSchedule);
