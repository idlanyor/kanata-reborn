import { fetchAnimeBySlug, searchAnime } from "../../helper/anime/fetchAnimeList.js";

export const handler = 'animedetail'
export const description = 'Get detailed Anime by Slug'

export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    // if (psn) return m.reply('Kasih slugnya cik,contoh `!animedetail sakamoto-day-sub-indo`');
    const data = await fetchAnimeBySlug(psn)
    // console.log(data)
    // return
    let sections = [];
    data.episodes.forEach((d) => {
        sections.push({
            title: `${d.judul}`,
            rows: [
                {
                    title: `${d.judul}`,
                    description: `${d.tanggal}`,
                    id: `animeepisode ${d.slug}`
                }
            ]
        })
    })
    caption = `
📺 *${data.judul?.trim()}*
🎬 *${data.nama?.trim()}*
🇯🇵 *${data.namaJapan?.trim()}*
⭐ *${data.skor?.trim()}*
🏢 *${data.produser?.trim()}*
📌 *${data.tipe?.trim()}*
✅ *${data.status?.trim()}*
🔢 *${data.totalEpisode?.trim()}*
⏳ *${data.durasi?.trim()}*
📅 *${data.rilis?.trim()}*
🎥 *${data.studio?.trim()}*
🎭 *${data.genre?.trim()}*
Klik *Daftar Episode* untuk melihat daftar episode
        `
    sock.sendMessage(id, {
        image: { url: data.gambar },
        caption,
        footer: 'KanataV3 x RyzenDesu.vip',
        buttons: [
            {
                buttonId: 'genrelist',
                buttonText: {
                    displayText: 'Genre List'
                },
                type: 1,
            },
            {
                buttonId: 'jadwalanime',
                buttonText: {
                    displayText: 'Jadwal Anime'
                },
                type: 1,
            },
            {
                buttonId: 'action',
                buttonText: {
                    displayText: 'anime detail'
                },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({
                        title: 'Daftar Episode',
                        sections
                    }),
                },
            },
        ],
        headerType: 1,
        viewOnce: true
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
    });
};
