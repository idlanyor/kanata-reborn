import nlp from 'compromise';
import { spotifySong } from './neoxr/spotify.js';
import { yutubAudio } from './downloader.js';

// Daftar kata kerja yang bisa digunakan untuk minta lagu
const playSynonyms = ['putar', 'puterin', 'putarkan', 'mainkan', 'setel', 'nyanyikan'];

/**
 * Mengekstrak informasi dari input teks
 * @param {string} text
 * @returns {Object} { songName, source }
 */
function parseMusicCommand(text) {
    const doc = nlp(text);
    const verbs = doc.verbs().out('array').map(word => word.toLowerCase());

    // Cek apakah ada kata kunci play
    const isPlayCommand = verbs.some(verb => playSynonyms.includes(verb));
    if (!isPlayCommand) return null;

    let songName = doc.after('lagu').out('text').trim();
    let source = 'youtube'; // Default ke YouTube

    if (songName.includes('dari spotify')) {
        songName = songName.replace('dari spotify', '').trim();
        source = 'spotify';
    } else if (songName.includes('dari youtube')) {
        songName = songName.replace('dari youtube', '').trim();
        source = 'youtube';
    }

    return songName ? { songName, source } : null;
}

/**
 * Mencari lagu di Spotify atau YouTube dengan fallback otomatis
 * @param {string} songName
 * @param {string} source
 * @returns {Promise<Object|null>} { title, artist, url }
 */
async function searchMusic(songName, source) {
    let song = null;

    if (source === 'spotify') {
        song = await spotifySong(songName);
        if (song) {
            await sock.sendMessage(id, { text: `bentar ya,kanata cariin lagu *${songName}* dulu di Spotify` });
            let { thumbnail, title, author, audio } = await spotifySong(psn)
            caption = '*Hasil Pencarian Spotify*';
            caption += `\n\n🎶 *Judul:* ${title}`;
            caption += `\n\n🎶 *Author:* ${author}`;
            caption += `\n _⏳ Bentar yaa, audio lagi dikirim ⏳_`;
            await sock.sendMessage(id, { image: { url: thumbnail }, caption }, { quoted: m });

            await sock.sendMessage(id, { audio: { url: audio }, mimetype: 'audio/mpeg', fileName: title }, { quoted: m });
        }
        console.log('Ngga ada nih di Spotify , aku coba cari di YouTube...');
    }

    return yutubAudio(songName);
}

/**
 * AutoAI Handler untuk pesan WhatsApp
 * @param {Object} msg
 * @param {Object} sock
 */
export async function autoAI(msg, sock) {
    const chat = msg.message.conversation || msg.message.extendedTextMessage?.text;
    const parsed = parseMusicCommand(chat);

    if (!parsed) return; // Tidak ada perintah lagu

    const { songName, source } = parsed;
    console.log(`🔍 Mencari lagu: ${songName} dari ${source.toUpperCase()}`);

    const song = await searchMusic(songName, source);

    if (song) {
        const reply = `🎶 Lagu ditemukan di ${source.toUpperCase()}: *${song.title}* oleh *${song.artist || 'Unknown'}*\n🔗 ${song.url}`;
        await sock.sendMessage(msg.key.remoteJid, { text: reply }, { quoted: msg });
    } else {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ Lagu tidak ditemukan di Spotify maupun YouTube.' }, { quoted: msg });
    }
}
