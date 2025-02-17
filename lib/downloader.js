import axios from 'axios';
import { betaDownload } from '../helper/betabotz.js';
import { nyxs } from '../helper/nxys.js';
import { hikaru } from '../helper/hikaru.js';
import { ytmp3, ytmp4 } from "@vreden/youtube_scraper";
export async function tiktok(url) {
    try {
        let { data } = await axios.get('https://roy.sirandu.icu/api/tiktok', {
            params: {
                url
            }
        })
        // return result.data
        return { title: data.result.caption || 'Kanata V2', video: data.result.video[1].url||data.result.video[0].url, audio: data.result.audio }
    } catch (error) {
        return error
    }
}
export async function snack(url) {
    try {
        let result = await betaDownload('snackvideo', {
            params: {
                url: url
            }
        })
        // return result.data
        return { title: result.data.result.title, video: result.data.result.media, author: result.data.result.author }
    } catch (error) {
        return error
    }
}

// console.log(await tiktok('https://vt.tiktok.com/ZSjWP7x83/'))
export async function meta(url) {
    try {
        let { data } = await axios.get('https://roy.sirandu.icu/api/ig', {
            params: {
                url
            }
        })
        return data.result
    } catch (error) {
        return error
    }
}

export async function instagram(url) {
    try {
        const { data } = await hikaru('downup/igdown', {
            params: { url }
        });

        console.log(data)
        if (Array.isArray(data)) {
            if (data.length > 0 && data[0].url) {
                return data[0].url;
            }
        } else if (data && data.url) {
            return data.url;
        }

    } catch (error) {
        // Tangani kesalahan dan kembalikan pesan kesalahan
        return `Terjadi kesalahan: ${error.message}`;
    }
}
// console.log(await instagram('https://www.instagram.com/reel/DDCJKb8vXcc/?igsh=MXNzeGlpZGF3NXNrZw=='))
// console.log(await meta('https://www.facebook.com/share/r/14bjUseLMP/'))

function getYouTubeId(url) {
    // Regex kanggo njupuk ID YouTube
    const match = url.match(/(?:v=|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);

    // Yen match ketemu, njupuk ID YouTube-nya
    return match ? match[1] : null;
}
export async function yutub(url) {
    let id = getYouTubeId(url);
    console.log(id)
    try {
        let response = await nyxs(`dl/yt-direct`, {
            params: {
                url: `https://www.youtube.com/watch?v=${id}`
            }
        })
        let result = await response.data.result
        return {
            thumbnail: result.thumbnail,
            title: result.title,
            duration: result.length,
            audio: result.urlAudio,
            video: result.urlVideo,
        }
    } catch (error) {
        return { error: error.message || "Terjadi kesalahan saat memproses permintaan." };
    }
}
export async function yutubVideo(url) {
    let id = getYouTubeId(url);
    try {
        return await ytmp4(`https://www.youtube.com/watch?v=${id}`)
            .then(result => {
                if (result.status) {
                    return {
                        thumbnail: result.metadata.thumbnail,
                        title: result.metadata.title || 'Tidak ada judul',
                        channel: result.metadata.author?.name || 'YNTKTS',
                        video: result.download.url,
                    }
                } else {
                    console.error('Error:', result.result);
                    return
                }
            });

    } catch (error) {
        return { error: error.message || "Terjadi kesalahan saat memproses permintaan." };
    }
}
export async function yutubAudio(url) {
    let id = getYouTubeId(url);
    try {
        return await ytmp3(`https://www.youtube.com/watch?v=${id}`)
            .then(result => {
                console.log(result.metadata)
                if (result.status) {
                    return {
                        thumbnail: result.metadata.thumbnail,
                        title: result.metadata.title || 'Tidak ada judul',
                        channel: result.metadata.author?.name || 'YNTKTS',
                        audio: result.download.url,
                    }
                } else {
                    console.error('Error:', result.result);
                    return
                }
            });

    } catch (error) {
        return { error: error.message || "Terjadi kesalahan saat memproses permintaan." };
    }
}
export async function spotify(url) {
    try {
        const { data } = await axios.get('https://api.siputzx.my.id/api/d/spotify', {
            params: {
                url
            }
        })
        return {
            thumbnail: data.metadata.cover_url,
            title: data.metadata.name,
            author: data.metadata.artist,
            audio: data.download
        }
    } catch (error) {
        return { error: error.message || "Terjadi kesalahan saat memproses permintaan." };
    }
}


// await yutubAudio('https://www.youtube.com/watch?v=8tZlvoUZ-Ek&pp=ygUMeWEgYmVnaXR1bGFo')
// console.log(await yutubAudio('https://www.youtube.com/watch?v=8tZlvoUZ-Ek&pp=ygUMeWEgYmVnaXR1bGFo'))
// console.log(await spotify('https://open.spotify.com/track/2gcMYiZzzmzoF8PPAfL3IO?si=XGDKMzmmSJ2rHjvpE_Yuow'))
// // console.log(await youtube.batchDownload(["https://www.youtube.com/watch?v=8tZlvoUZ-Ek&pp=ygUMeWEgYmVnaXR1bGFo"],1))
// // console.log(await meta("https://www.instagram.com/reel/C81uiueJ4ho/?utm_source=ig_web_copy_link"))