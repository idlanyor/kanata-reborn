import { helpMessage } from '../../helper/help.js'

export const handler = ["menudownloader", "menutools", "menuowner", "menugroup", "menuai", "menugame", "menuanime", "menusticker", "menusearch"]
export const description = "Menampilkan menu berdasarkan kategori";

export default async ({ sock, id, m, cmd }) => {
    const { plugins } = await helpMessage()
    console.log(cmd) 
    
    // Ambil kategori dari command (misal menudownloader -> downloader)

    // return
    const category = cmd.replace('menu', '').toUpperCase()
    
    if (!plugins[category.toLowerCase()]) {
        await sock.sendMessage(id, {
            text: '❌ Kategori tidak ditemukan!'
        })
        return
    }

    let text = `*${category} MENU*\n\n`
    plugins[category.toLowerCase()].forEach(cmd => {
        const cmdName = Array.isArray(cmd.handler) 
            ? cmd.handler.map(h => h.toUpperCase()).join(', ')
            : cmd.handler.toUpperCase()
        text += `⌁ *${cmdName}*\n`
    })

    await sock.sendMessage(id, {
        text,
        footer: '© 2024 Kanata Bot • Created by Roy',
        buttons: [
            {
                buttonId: 'menu',
                buttonText: {
                    displayText: '⬅️ Kembali'
                },
                type: 1
            }
        ],
        headerType: 1,
        viewOnce: true
    }, { quoted:m })
} 