// import { helpMessage } from '../../helper/help.js'
// import pkg from '@fizzxydev/baileys-pro';
// const { proto, generateWAMessageFromContent } = pkg;
// import loadAssets from '../../helper/loadAssets.js';

// export const handler = ["category", "c", "kategori"]
// export const description = "Menampilkan daftar kategori menu";

// export default async ({ sock, id, m, noTel, sender }) => {
//     const { plugins } = await helpMessage()
    
//     const emojis = {
//         'DOWNLOADER': '📥',
//         'TOOLS': '🛠️', 
//         'OWNER': '👑',
//         'GROUP': '👥',
//         'AI': '🤖',
//         'GAME': '🎮',
//         'ANIME': '🎭',
//         'STICKER': '🎨',
//         'SEARCH': '🔍'
//     }

//     let sections = [{
//         title: '📋 DAFTAR KATEGORI',
//         rows: []
//     }]

//     // Filter kategori HIDDEN
//     for (const category in plugins) {
//         if (category.toUpperCase() !== 'HIDDEN') {
//             sections[0].rows.push({
//                 title: `${emojis[category.toUpperCase()] || '📌'} ${category.toUpperCase()}`,
//                 description: `Menampilkan menu kategori ${category}`,
//                 id: `menu${category.toLowerCase()}`
//             })
//         }
//     }

//     const time = new Date()
//     const hours = time.getHours()
//     let greeting = ''
//     if (hours >= 4 && hours < 11) greeting = 'Pagi'
//     else if (hours >= 11 && hours < 15) greeting = 'Siang'
//     else if (hours >= 15 && hours < 18) greeting = 'Sore'
//     else greeting = 'Malam'

//     await sock.sendMessage(id, {
//         text: `╭─「 KANATA BOT 」
// ├ Selamat ${greeting} 👋
// ├ @${noTel}
// │
// ├ Silahkan pilih kategori menu
// ├ yang ingin ditampilkan
// ╰──────────────────`,
//         footer: '© 2024 Kanata Bot • Created by Roy',
//         buttons: [
//             {
//                 buttonId: 'action',
//                 buttonText: {
//                     displayText: '📋 Pilih Kategori'
//                 },
//                 type: 4,
//                 nativeFlowInfo: {
//                     name: 'single_select',
//                     paramsJson: JSON.stringify({
//                         title: '📚 KATEGORI MENU',
//                         sections
//                     })
//                 }
//             }
//         ],
//         headerType: 1,
//         viewOnce: true,
//         contextInfo: {
//             mentionedJid: [sender],
//             isForwarded: true,
//             forwardingScore: 999,
//             externalAdReply: {
//                 title: '乂 Kanata Bot Menu 乂',
//                 body: 'Click here to join our channel!',
//                 thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
//                 sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
//                 mediaType: 1,
//                 renderLargerThumbnail: true
//             }
//         }
//     }, { quoted:m })
// } 
