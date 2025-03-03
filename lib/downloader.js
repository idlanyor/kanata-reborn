import axios from 'axios';
import { betaDownload } from '../helper/betabotz.js';
import { nyxs } from '../helper/nxys.js';
import { hikaru } from '../helper/hikaru.js';
import { ytmp3, ytmp4 } from "@vreden/youtube_scraper";
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function tiktok(url) {
    try {
        let { data } = await axios.get('https://roy.sirandu.icu/api/tiktok', {
            params: {
                url
            }
        })
        // return result.data
        return { title: data.result.caption || 'Kanata V3', video: data.result.video[1].url||data.result.video[0].url, audio: data.result.audio }
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

// Fungsi helper untuk menjalankan yt-dlp
async function runYtDlp(url, options) {
    try {
        // Tambahkan opsi --no-check-certificates dan --force-ipv4 untuk menghindari masalah koneksi
        const command = `yt-dlp --no-check-certificates --force-ipv4 ${options} "${url}"`;
        console.log('Menjalankan perintah:', command);
        
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr) {
            console.warn('yt-dlp stderr:', stderr);
        }
        
        // Periksa apakah stdout kosong
        if (!stdout.trim()) {
            throw new Error('Tidak ada data yang diterima dari yt-dlp');
        }
        
        return stdout.trim();
    } catch (error) {
        console.error('Error detail:', error);
        
        // Pesan error yang lebih spesifik
        if (error.message.includes('HTTP Error 400')) {
            throw new Error('Gagal mengakses YouTube API. Kemungkinan masalah jaringan atau pembatasan akses.');
        } else if (error.message.includes('Signature extraction failed')) {
            throw new Error('Gagal mengekstrak signature video. Coba perbarui yt-dlp dengan menjalankan: yt-dlp -U');
        }
        
        throw new Error(`Gagal menjalankan yt-dlp: ${error.message}`);
    }
}

export async function yutub(url) {
    try {
        // Dapatkan info video
        const info = await runYtDlp(url, '--dump-json');
        const videoInfo = JSON.parse(info);
        
        // Buat direktori temporary jika belum ada
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        
        const outputVideo = path.join(tempDir, `${videoInfo.id}_video.mp4`);
        const outputAudio = path.join(tempDir, `${videoInfo.id}_audio.mp3`);
        
        // Download video dengan kualitas terbaik (max 720p)
        await runYtDlp(url, `-f "bv*[height<=720]+ba/b[height<=720]/best" -o "${outputVideo}"`);
        await runYtDlp(url, `-x --audio-format mp3 -o "${outputAudio}"`);
        
        return {
            thumbnail: videoInfo.thumbnail,
            title: videoInfo.title,
            duration: videoInfo.duration,
            audio: outputAudio,
            video: outputVideo,
        };
    } catch (error) {
        return { error: error.message || "Terjadi kesalahan saat memproses permintaan." };
    }
}

// Tambahkan fungsi ytsearch
async function ytsearch(query) {
    try {
        const searchResult = await runYtDlp(`ytsearch1:${query}`, '--dump-json');
        const videoInfo = JSON.parse(searchResult);
        return {
            url: `https://www.youtube.com/watch?v=${videoInfo.id}`,
            title: videoInfo.title,
            thumbnail: videoInfo.thumbnail,
            duration: videoInfo.duration,
            channel: videoInfo.channel
        };
    } catch (error) {
        throw new Error(`Error searching video: ${error.message}`);
    }
}

export async function yutubVideo(query) {
    try {
        // Cek apakah input adalah URL atau query pencarian
        const isUrl = query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);
        let videoUrl = query;

        if (!isUrl) {
            // Jika bukan URL, lakukan pencarian terlebih dahulu
            const searchResult = await ytsearch(query);
            videoUrl = searchResult.url;
        }

        // Dapatkan info video
        const info = await runYtDlp(videoUrl, '--dump-json');
        const videoInfo = JSON.parse(info);
        
        // Buat direktori temp jika belum ada
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        
        const outputPath = path.join(tempDir, `${videoInfo.id}.mp4`);
        
        // Download video dengan kualitas terbaik (max 720p)
        await runYtDlp(videoUrl, `-f "bv*[height<=720]+ba/b[height<=720]/best" -o "${outputPath}"`);
        
        // Verifikasi file telah terdownload
        try {
            await fs.access(outputPath);
        } catch (error) {
            throw new Error('Gagal mengunduh video. File tidak ditemukan.');
        }
        
        return {
            thumbnail: videoInfo.thumbnail,
            title: videoInfo.title,
            channel: videoInfo.channel,
            duration: videoInfo.duration,
            filesize: (await fs.stat(outputPath)).size,
            video: outputPath
        };
    } catch (error) {
        // Tambahkan logging untuk debugging
        console.error('Error in yutubVideo:', error);
        return { 
            error: error.message || "Terjadi kesalahan saat memproses permintaan.",
            details: error.stack
        };
    }
}

export async function yutubAudio(query) {
    try {
        // Cek apakah input adalah URL atau query pencarian
        const isUrl = query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);
        let videoUrl = query;

        if (!isUrl) {
            // Jika bukan URL, lakukan pencarian terlebih dahulu
            const searchResult = await ytsearch(query);
            videoUrl = searchResult.url;
        }

        // Dapatkan info video
        const info = await runYtDlp(videoUrl, '--dump-json');
        const videoInfo = JSON.parse(info);
        
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        
        const outputPath = path.join(tempDir, `${videoInfo.id}.mp3`);
        
        // Download dan convert ke MP3
        await runYtDlp(videoUrl, `-x --audio-format mp3 --audio-quality 128K -o "${outputPath}"`);
        
        return {
            thumbnail: videoInfo.thumbnail,
            title: videoInfo.title,
            channel: videoInfo.channel,
            duration: videoInfo.duration,
            audio: outputPath
        };
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

export async function testURL(url) {
    try {
        // Coba mendapatkan info video untuk memvalidasi URL
        const info = await runYtDlp(url, '--dump-json');
        const videoInfo = JSON.parse(info);
        
        return {
            valid: true,
            info: {
                id: videoInfo.id,
                title: videoInfo.title,
                duration: videoInfo.duration,
                thumbnail: videoInfo.thumbnail,
                channel: videoInfo.channel
            }
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message || "URL tidak valid atau video tidak tersedia"
        };
    }
}

// const test = await testURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
// console.log(test);
// await yutubAudio('https://www.youtube.com/watch?v=8tZlvoUZ-Ek&pp=ygUMeWEgYmVnaXR1bGFo')
// console.log(await yutubAudio('https://www.youtube.com/watch?v=8tZlvoUZ-Ek&pp=ygUMeWEgYmVnaXR1bGFo'))
// console.log(await spotify('https://open.spotify.com/track/2gcMYiZzzmzoF8PPAfL3IO?si=XGDKMzmmSJ2rHjvpE_Yuow'))
// // console.log(await youtube.batchDownload(["https://www.youtube.com/watch?v=8tZlvoUZ-Ek&pp=ygUMeWEgYmVnaXR1bGFo"],1))
// // console.log(await meta("https://www.instagram.com/reel/C81uiueJ4ho/?utm_source=ig_web_copy_link"))