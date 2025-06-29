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
import { proto, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';

const URL = globalThis.hikaru.baseUrl + 'religious/prayerschedule?city=Purbalingga';
const FILE_PATH = 'src/lib/services/jadwalshalat.json';

const data = await readFile(FILE_PATH, 'utf-8');
const jsh = JSON.parse(data);
const today = new Date().getDate().toString().padStart(2, '0');
const jadwalToday = jsh.result.monthSchedule.find(item => item.date === today);

async function fetchPrayerSchedule() {
    try {
        const response = await fetch(URL, {
            headers: {
                'x-api-key': globalThis.hikaru.apiKey
            }
        });
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
        // { name: 'Ramadhan', time: "00:00" },
        // { name: 'Sahur', time: "02:30" },
        // { name: 'Imsyak', time: jadwalToday.imsyak },
        { name: 'Shubuh', time: jadwalToday.shubuh },
        { name: 'Dzuhur', time: jadwalToday.dzuhur },
        { name: 'Ashar', time: jadwalToday.ashr },
        // { name: 'Buka', time: jadwalToday.maghrib },
        { name: 'Maghrib', time: jadwalToday.maghrib },
        { name: 'Isya', time: jadwalToday.isya }
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
                            thumbnailUrl: await getPrayerImage(name),
                            sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }
            }), { userJid: chatId });
            await sock.relayMessage(chatId, message.message, { messageId: message.key.id });

        });
    });
};

function generatePrayerMessage(name, time) {
    let text = `╭─「 *SHALAT NOTIFICATION* 」\n`;
    text += `├ 🕌 *${name}*\n`;
    text += `├ 🕐 *${time} WIB*\n`;
    text += `├ 📍 *Purbalingga dan sekitarnya*\n│\n`;

    switch (name) {
        // case 'Sahur':
        //     text += `├ Waktunya *${name}*, mari bergegas\n`;
        //     text += `├ menyiapkan santapan sahur 📿🤲🏻\n`;
        //     text += `├ _Selamat menjalankan ibadah Sahur_\n`;
        //     break;
        // case 'Ramadhan':
        //     text += `├ 🌙 Diawali dengan Bismillah, menyambut bulan penuh barokah 🌙\n`;
        //     text += `├ 📿 Mari tingkatkan keimanan dan takwa 📿\n`;
        //     text += `├ 🤲 Semoga diampunkan segala dosa 🤲\n`;
        //     text += `├ 🌟 Marhaban ya Ramadhan 1446 H/2025 M 🌟\n`;
        //     text += `├ 🕌 Selamat menunaikan ibadah puasa 🕌\n`;
        //     break;
        // case 'Imsyak':
        //     text += `├ Waktu *${name}* telah tiba\n`;
        //     text += `├ Selamat menjalankan ibadah puasa\n`;
        //     text += `├ Semoga puasa kita diterima Allah SWT 🤲🏻\n`;
        //     break;
        case 'Terbit':
            text += `├ *Semangat Pagi*\n`;
            text += `├ Waktu *${name}* telah tiba\n`;
            text += `├ Selamat beraktifitas, semoga hari ini\n`;
            text += `├ senantiasa dilindungi Allah SWT 🤲🏻\n`;
            break;
        case 'Maghrib':
            // text += `├ 🌙 *Selamat Berbuka Puasa!* 🌙\n`;
            text += `├ Waktu *${name}* telah tiba\n`;
            // text += `├ Silakan berbuka puasa dengan yang manis\n`;
            text += `├ Silakan persiapkan diri untuk shalat Berjamaah di masjid / mushola terdekat\n`;
            text += `├ sesungguhnya pahala shalat berjamaah adalah 27x lipat lebih banyak dibanding shalat sendirian 🤲🏻\n 🤲🏻\n`;
            // text += `├ dan jangan lupa shalat Maghrib 🤲🏻\n`;
            break;
        // case 'Isya':
        //     text += `├ Waktu Isya & Tarawih telah tiba\n`;
        //     text += `├ Silakan persiapkan diri untuk shalat Berjamaah di masjid / mushola terdekat\n`;
        //     text += `├ sesungguhnya pahala shalat berjamaah adalah 27x lipat lebih banyak dibanding shalat sendirian 🤲🏻\n`;
        //     break;
        case 'Shubuh':
            text += `├ 🌙 Waktu *${name}* telah tiba 🌙\n`;
            text += `├ Ayo shalat berjamaah!\n`;
            text += `├ Ambil wudhu dan bergegas menuju Masjid/Mushola terdekat\n`;
            text += `├ _Mereka yang memperoleh pahala paling besar karena mengerjakan sholat adalah mereka yang (tempat tinggalnya) paling jauh (dari masjid), kemudian mereka yang lebih jauh dari itu, dan seterusnya. Demikian pula orang yang menunggu mengerjakan sholat bersama imam memperoleh pahala yang lebih besar daripada orang yang mengerjakan sholat lalu pergi tidur_ 🤲🏻\n`;
            break;
        default:
            if (['Dzuhur', 'Ashar', 'Isya'].includes(name)) {
                text += `├ Waktu Shalat *${name}* telah tiba\n`;
                text += `├ Mari tinggalkan aktivitas sejenak\n`;
                text += `├ Ambil wudhu dan laksanakan kewajiban 📿🤲🏻\n`;
            }
    }

    text += `╰──────────────────\n\n`;
    text += `_Powered by Kanata-V3_`;
    return text;
}

async function getPrayerImage(name) {
    const images = {
        // 'Sahur': globalThis.hikaru.baseUrl + 'file/v2/FieAa6x.jpg',
        // 'Imsyak': globalThis.hikaru.baseUrl + 'file/v2/wdGBB0L.jpg',
        'Shubuh': globalThis.hikaru.baseUrl + 'file/v2/J7r7Kzj.jpg',
        'Dzuhur': globalThis.hikaru.baseUrl + 'file/v2/Nm7xLET.jpg',
        'Ashar': globalThis.hikaru.baseUrl + 'file/v2/vl5k4iD.jpg',
        'Maghrib': globalThis.hikaru.baseUrl + 'file/v2/dATGtcL.jpg',
        // 'Buka': globalThis.hikaru.baseUrl + 'file/v2/NaP2lnd.jpg',
        'Isya': globalThis.hikaru.baseUrl + 'file/v2/pLwruV9.jpg',
        // 'Ramadhan': globalThis.hikaru.baseUrl + 'file/v2/sdb0OYA.jpg',
    };
    console.log(images[name]);
    return images[name] || globalThis.hikaru.baseUrl + 'file/v2/sdb0OYA.jpg';
}

cron.schedule('0 0 */28 * *', fetchPrayerSchedule);
// fetchPrayerSchedule();
