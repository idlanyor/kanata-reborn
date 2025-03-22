import { pddiktiSearch } from "../../lib/scraper/pddikti.js";

export const handler = 'pddikti'
export const description = 'Resolve Information from Pddikti by NIM/Name'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (psn == "") return await sock.sendMessage(id, { text: 'Masukkan Nim/Nama untuk dicari,contoh `pddikti SSI202203088`' })
    await sock.sendMessage(id, { text: 'Tunggu sebentar,ini sedikit memakan waktu ...' })
    const result = await pddiktiSearch(psn)
    const rows = []
    result.forEach((d, i) => {
        rows.push({
            header: d.nim,
            title: `${d.nama} - ${d.nim}`,
            description: `${d.programStudi} - ${d.perguruanTinggi}`,
            id: `pdd ${d.link}`,
        })
    })
    await sock.sendMessage(id, {
        text: `Hasil Pencarian *PDDikti* untuk ${psn}\n Klik Hasil pencarian untuk melihat detail`,
        footer: 'Kanata-V3',
        buttons: [

            {
                buttonId: 'action',
                buttonText: {
                    displayText: 'PDDikti Scraper by Roy'
                },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({
                        title: 'Hasil Pencarian',
                        sections: [
                            {
                                title: 'Hasil Pencarian Pddikti',
                                highlight_label: '!',
                                rows
                            },
                        ],
                    }),
                },
            },
        ],
        headerType: 1,
        viewOnce: true
    }, { quoted: {
            key: {
                remoteJid: 'status@broadcast',
                participant: "13135550002@s.whatsapp.net",
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363293401077915@newsletter',
                    newsletterName: 'Roy',
                    caption: 'Kanata V3'
                }
            }
        } });
};
