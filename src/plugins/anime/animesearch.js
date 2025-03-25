import { searchAnime } from "../../helper/anime/fetchAnimeList.js";

export const handler = 'animesearch'
export const description = 'Search anime by Query'

export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) return m.reply('Kasih judulnya cik,contoh `!animesearch sakamoto days`');
    const data = await searchAnime({ search: psn })
    // console.log(data)
    // return
    let sections = [];
    data.forEach((d) => {
        sections.push({
            title: `${d.judul} - ${d.slug}`,
            rows: [
                {
                    title: `${d.judul}`,
                    description: `${d.slug}`,
                    id: `animedetail ${d.slug}`
                }
            ]
        })
    })
    sock.sendMessage(id, {
        text: `Berikut adalah hasil pencarian yang ditemukan berdasarkan query _${psn.trim()}_`,
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
                    displayText: 'anime search'
                },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({
                        title: 'Anime Search Result',
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
