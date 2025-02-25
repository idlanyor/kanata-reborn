import { getMedia } from "../../helper/mediaMsg.js";

export const handler = 'rvo'
export const description = 'Read View Once'

export default async ({ sock, m, id, attf }) => {
    try {
        // Cek apakah ada quoted message
        if (!m.quotedMsg) {
            await m.reply('❌ Reply pesan view once yang ingin dibuka!');
            return;
        }



        // Cek apakah pesan yang di-quote adalah view once
        const ViewOnceVid = m.quoted?.viewOnceMessageV2?.message?.videoMessage;
        const ViewOnceImg = m.quoted?.viewOnceMessageV2?.message?.imageMessage;

        if (!ViewOnceImg?.viewOnce && !ViewOnceVid?.viewOnce) {
            await m.reply('❌ Pesan yang di-reply bukan view once!');
            return;
        }

        // Kirim media sesuai jenisnya
        // console.log(ViewOnceImg?.viewOnce)
        // return
        if (ViewOnceImg?.viewOnce) {
            attf = await getMedia({
                message: {
                    imageMessage: ViewOnceImg
                }
            })

            await sock.sendMessage(id, {
                image: attf,
                caption: ViewOnceImg?.caption || '',
            }, { quoted: m });
        } else if (ViewOnceVid?.viewOnce) {
            attf = await getMedia({
                message: {
                    videoMessage: ViewOnceVid
                }
            })
            await sock.sendMessage(id, {
                video: attf,
                caption: ViewOnceVid.caption || '',
            }, { quoted: m });
        }

        // Kirim reaksi sukses
        await m.react('👁️');

    } catch (error) {
        console.error('Error in rvo:', error);
        await m.reply('❌ Terjadi kesalahan saat memproses media view once');
        await m.react('❌');
    }
};

export const help = {
    name: 'rvo',
    description: 'Membuka media view once',
    usage: 'Reply pesan view once dengan command .rvo'
};
