import fetch from 'node-fetch';

export const handler = 'short'
export const description = 'Memendekkan URL menggunakan is.gd'

export default async ({ sock, m, id, psn, sender }) => {
    if (!psn) {
        await sock.sendMessage(id, {
            text: '⚠️ Format salah!\n\n*Penggunaan:*\n.short url\n.short url customAlias\n\n*Contoh:*\n.short https://google.com\n.short https://google.com googleku',
            contextInfo: {
                externalAdReply: {
                    title: '乂 URL Shortener 乂',
                    body: 'Please provide a valid URL',
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
        const args = psn.split(' ');
        const url = args[0];
        const customAlias = args[1];

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error('URL tidak valid! URL harus dimulai dengan http:// atau https://');
        }

        let apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`;
        
        // Jika ada custom alias
        if (customAlias) {
            apiUrl += `&shorturl=${encodeURIComponent(customAlias)}`;
        }

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.errorcode) {
            throw new Error(data.errormessage);
        }

        const message = `╭─「 *URL SHORTENER* 」
├ *Original URL:* 
├ ${url}
├ 
├ *Shortened URL:* 
├ ${data.shorturl}
╰──────────────────

_Powered by is.gd_`;

        await sock.sendMessage(id, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: '乂 URL Shortener 乂',
                    body: 'Powered by is.gd',
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
            text: '❌ Terjadi kesalahan: ' + error.message,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Shortening Failed',
                    body: 'An error occurred while shortening URL',
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