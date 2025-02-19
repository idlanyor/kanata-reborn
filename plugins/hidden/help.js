import { helpMessage } from '../../helper/help.js'
import loadAssets from '../../helper/loadAssets.js';
import pkg from '@seaavey/baileys';
const { proto, generateWAMessageFromContent } = pkg;

export const handler = ["menu", "help", "h", "hai"]
export const description = "List All Menu";

export default async ({ sock, id, m, noTel, sender }) => {
    const time = new Date()
    const hours = time.getHours()
    let greeting = ''
    if (hours >= 4 && hours < 11) greeting = 'Pagi'
    else if (hours >= 11 && hours < 15) greeting = 'Siang'
    else if (hours >= 15 && hours < 18) greeting = 'Sore'
    else greeting = 'Malam'

    const menuMessage = `╭─「 KANATA BOT 」
├ Selamat ${greeting} 👋
├ @${noTel}
│
├ *Time:* ${time.toLocaleTimeString()}
├ *Date:* ${time.toLocaleDateString()}
│
├ *Bot Info:*
├ Version: 2.0
├ Library: @seeavey/baileys
├ Platform: NodeJS
│
├ *Cara Penggunaan:*
├ Ketik *!category* untuk melihat
├ daftar kategori menu yang 
├ tersedia
╰──────────────────`

    await sock.sendMessage(id, {
        caption: menuMessage,
        image: {
            url: await loadAssets('kanata-cover.jpeg', 'image'),
        },
        buttons: [
            {
                buttonId: 'category',
                buttonText: {
                    displayText: '📋 Lihat Kategori'
                },
                type: 1
            },
            {
                buttonId: 'owner',
                buttonText: {
                    displayText: '👑 Owner Contact'
                },
                type: 1
            }
        ],
        footer: '© 2024 Kanata Bot • Created by Roy',
        headerType: 1,
        viewOnce: true,
        contextInfo: {
            mentionedJid: [sender],
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {
                title: '乂 Kanata Bot Menu 乂', 
                body: 'Click here to join our channel!',
                thumbnailUrl: 'https://s6.imgcdn.dev/YYoFZh.jpg',
                sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

// {
//     key: {
//         remoteJid: 'status@broadcast',
//         participant: '0@s.whatsapp.net'
//     },
//     message: {
//         newsletterAdminInviteMessage: {
//             newsletterJid: '120363293401077915@newsletter',
//             newsletterName: 'Roy',
//             caption: 'Kanata'
//         }
//     }
// }