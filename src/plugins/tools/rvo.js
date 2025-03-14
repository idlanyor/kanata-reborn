import { getMedia } from "../../helper/mediaMsg.js";

export const handler = 'rvo'
export const description = 'Read View Once'

export default async ({ sock, m, id }) => {
    try {
        // Cek apakah ada quoted message dan apakah itu view once
        const ViewOnceImg = m.quoted?.message?.imageMessage;
        const ViewOnceVid = m.quoted?.message?.videoMessage;

        if (!m.quoted || (!ViewOnceImg?.viewOnce && !ViewOnceVid?.viewOnce)) {
            await m.reply('❌ Reply pesan view once yang ingin dibuka!');
            return;
        }

        let attf;
        if (ViewOnceImg?.viewOnce) {
            attf = await getMedia({ message: { imageMessage: ViewOnceImg } });

            await sock.sendMessage(id, {
                image: attf,
                caption: ViewOnceImg.caption || '',
            }, { quoted: m });

        } else if (ViewOnceVid?.viewOnce) {
            attf = await getMedia({ message: { videoMessage: ViewOnceVid } });

            await sock.sendMessage(id, {
                video: attf,
                caption: ViewOnceVid.caption || '',
            }, { quoted: m });
        }

        // Hapus pesan view once setelah berhasil dikirim
        await sock.sendMessage(m.chat, { delete: m.quoted.key });

    } catch (error) {
        console.error('Error in rvo:', error);
        await m.reply('❌ Terjadi kesalahan saat memproses media view once');
        await m.react('❌');
    }
};
