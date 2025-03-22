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
    const lowerText = text.toLowerCase();

    // Cek apakah ada kata kerja yang sesuai
    const isPlayCommand = playSynonyms.some(verb => lowerText.includes(verb));
    if (!isPlayCommand) {
        console.log("❌ Tidak ada kata kerja play yang cocok.");
        return null;
    }

    // Ambil bagian lagu setelah kata kerja
    let songMatch = text.match(/(?:putar|puterin|setel|mainkan|nyanyikan)\s+(?:lagu\s+)?(.+)/i);
    let songName = songMatch ? songMatch[1] : '';

    // Deteksi sumber (Spotify/Youtube)
    let source = 'youtube'; // Default ke YouTube
    if (/di spotify|dari spotify/i.test(songName)) {
        songName = songName.replace(/di spotify|dari spotify/i, '').trim();
        source = 'spotify';
    } else if (/di youtube|dari youtube/i.test(songName)) {
        songName = songName.replace(/di youtube|dari youtube/i, '').trim();
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
            console.log(song)
            return song
        }
    }

    return await yutubAudio(songName);
}

/**
 * AutoAI Handler untuk pesan WhatsApp
 * @param {Object} m
 * @param {Object} sock
 */
export async function autoAI(m, sock) {
    const chat = m.body || m.quoted?.text;
    console.log("🔥 autoAI triggered! Message:", chat);
    const parsed = parseMusicCommand(chat);
    // console.log(parseMusicCommand("putar lagu Despacito dari youtube"));
    // console.log(parseMusicCommand("puterin lagu Perfect dari spotify"));
    // console.log(parseMusicCommand("setel lagu Tak Ingin Usai"));


    if (!parsed) return; // Tidak ada perintah lagu

    const { songName, source } = parsed;
    console.log(`🔍 Mencari lagu: ${songName} dari ${source.toUpperCase()}`);

    const song = await searchMusic(songName, source);
    console.log(song)
    if (song) {
        const reply = `🎶 Lagu ditemukan di ${source.toUpperCase()}: *${song.title}* oleh *${song.author || song.channel || 'Unknown'}*`;
        await sock.sendMessage(m.chat, { text: reply }, { quoted:m });
        await sock.sendMessage(m.chat, { audio: { url: song.audio }, mimetype: 'audio/mpeg' }, { quoted:m });
    } else {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ Lagu tidak ditemukan di Spotify maupun YouTube.' }, { quoted:msg });
    }
}
