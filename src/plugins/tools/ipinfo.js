import pkg from 'ipinfo';
const { IPinfo } = pkg;

export const handler = 'ipinfo'
export const description = 'Get IP Address Information'

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: '⚠️ Mohon masukkan alamat IP yang valid!\n\nContoh: .ipinfo 8.8.8.8',
            contextInfo: {
                externalAdReply: {
                    title: '乂 IP Information 乂',
                    body: 'Please provide a valid IP address',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
        return;
    }

    try {
        // Inisialisasi client IPinfo
        // Gunakan token demo untuk testing, sebaiknya ganti dengan token asli
        const client = new IPinfo();
        
        // Dapatkan informasi IP
        const response = await client.lookupIp(psn);

        const message = `╭─「 *IP INFORMATION* 」
├ *IP:* ${response.ip}
├ *Hostname:* ${response.hostname || '(Not available)'}
├ *City:* ${response.city}
├ *Region:* ${response.region}
├ *Country:* ${response.country}
├ *Location:* ${response.loc}
├ *Organization:* ${response.org}
├ *Postal:* ${response.postal}
├ *Timezone:* ${response.timezone}
╰──────────────────

_Powered by Kanata-V3_`;

        await sock.sendMessage(id, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '乂 IP Information 乂',
                    body: `Information for IP: ${response.ip}`,
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '✅',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: '❌ Terjadi kesalahan saat mengambil informasi IP: ' + error.message,
            contextInfo: {
                externalAdReply: {
                    title: '❌ IP Lookup Failed',
                    body: 'An error occurred while fetching IP info',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });

        // Kirim reaksi error
        await sock.sendMessage(id, {
            react: {
                text: '❌',
                key: m.key
            }
        });
    }
}; 