import { getPpUrl } from '../../helper/bot.js';
import { helpMessage } from '../../helper/help.js'
import { menuCard } from '../../lib/canvas/menu.js'
export const handler = ["menu", "help", "h", "hai"]
export const description = "List All Menu";

export default async ({ sock, id, m, noTel, sender }) => {
    const { caption, plugins } = await helpMessage()
    const menuImage = await menuCard(m.pushName || 'User', noTel, await getPpUrl(sock, noTel) || 'https://files.catbox.moe/2wynab.jpg')
    // Generate sections dengan format yang lebih menarik
    let sections = []
    const emojis = {
        'DOWNLOADER': '📥',
        'TOOLS': '🛠️',
        'OWNER': '👑',
        'GROUP': '👥',
        'AI': '🤖',
        'GAME': '🎮',
        'ANIME': '🎭',
        'STICKER': '🎨',
        'SEARCH': '🔍'
    }

    // Filter out 'HIDDEN' category
    for (const plugin in plugins) {
        if (plugin.toUpperCase() !== 'HIDDEN') {
            sections.push({
                header: '╭─「 KANATA BOT MENU 」',
                highlight_label: '3.0',
                title: `${emojis[plugin.toUpperCase()] || '📌'} ${plugin.toUpperCase()} MENU`,
                rows: plugins[plugin].map((command) => {
                    const cmdName = Array.isArray(command.handler)
                        ? command.handler.map(h => h.toUpperCase()).join(', ')
                        : command.handler.toUpperCase()
                    return {
                        title: `⌁ ${cmdName}`,
                        description: command.description || 'Tidak ada deskripsi',
                        id: `${command.handler}`
                    }
                })
            })
        }
    }

    // Calculate total commands excluding HIDDEN
    const totalCommands = Object.entries(plugins)
        .filter(([category]) => category.toUpperCase() !== 'HIDDEN')
        .reduce((acc, [_, commands]) => acc + commands.length, 0);

    // Calculate total categories excluding HIDDEN
    const totalCategories = Object.keys(plugins)
        .filter(category => category.toUpperCase() !== 'HIDDEN')
        .length;

    // Generate waktu
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
├ Version: 3.0
├ Library: @fizzxydev/baileys-pro
├ Platform: NodeJS
├ Type : ES6 Module
│
├ *Command Info:*
├ Prefix: Multi
├ Total Commands: ${totalCommands}
├ Total Categories: ${totalCategories}
╰──────────────────

${caption}

╭─「 *How to Use* 」
├ Type *!help/!menu* for full commands
├ Type *!ping* to check bot status
├ Type *!owner* to contact owner
╰──────────────────`

    await sock.sendMessage(id, {
        caption: menuMessage,
        image: menuImage,
        buttons: [
            {
                buttonId: 'ping',
                buttonText: {
                    displayText: '🚀 Test Ping'
                },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({
                        title: '📚 DAFTAR MENU KANATA V3',
                        sections
                    }),
                },
            },
            {
                buttonId: 'owner',
                buttonText: {
                    displayText: '👑 Owner Contact'
                },
                type: 1,
            }
        ],
        footer: '© 2024 Kanata Bot • Created with ❤️ by Roy',
        headerType: 1,
        viewOnce: true,
        contextInfo: {
            mentionedJid: [sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: globalThis.newsLetterJid,
                newsletterName: '乂 Powered By : Roy 乂',
                serverMessageId: -1
            },
            forwardingScore: 999,
            externalAdReply: {
                title: '乂 Kanata V3 Menu 乂',
                body: 'Welcome to Kanata Universe!',
                thumbnailUrl: globalThis.ppUrl,
                sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                mediaType: 1,
                renderLargerThumbnail: false
            }
        },
    }, {
        quoted: {
            key: {
                remoteJid: 'status@broadcast',
                participant: "13135550002@s.whatsapp.net",
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363293401077915@newsletter',
                    newsletterName: sender || 'User',
                    caption: `${m.pushName} - ${noTel}` || 'Kanata V3'
                }
            }
        }
    })
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
