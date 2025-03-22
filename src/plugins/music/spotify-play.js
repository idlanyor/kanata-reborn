import { spotifySong } from "../../lib/neoxr/spotify.js";
import { createCanvas, loadImage, registerFont } from 'canvas';
import moment from 'moment';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register Poppins fonts
registerFont(join(__dirname, '../../assets/fonts/Poppins-Bold.ttf'), { family: 'Poppins Bold' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Medium.ttf'), { family: 'Poppins Medium' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Regular.ttf'), { family: 'Poppins' });

export const handler = 'play'
export const description = 'Search Spotify Song/Artist'

async function createSpotifyCard(title, author, thumbnail, duration) {
    const canvas = createCanvas(800, 250);
    const ctx = canvas.getContext('2d');
    
    // Background gradient dengan efek blur
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#121212');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    try {
        // Load dan gambar thumbnail
        const image = await loadImage(thumbnail);
        const imageSize = 200;
        const imageX = 30;
        const imageY = (canvas.height - imageSize) / 2;
        
        // Shadow untuk thumbnail
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Gambar thumbnail
        ctx.drawImage(image, imageX, imageY, imageSize, imageSize);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Judul lagu dengan Poppins Bold
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '28px Poppins Bold';
        ctx.fillText(title.length > 25 ? title.substring(0, 25) + '...' : title, 260, 85);
        
        // Nama artis dengan Poppins Medium
        ctx.fillStyle = '#B3B3B3';
        ctx.font = '20px Poppins Medium';
        ctx.fillText(author, 260, 120);
        
        // Progress bar background
        ctx.fillStyle = '#404040';
        ctx.fillRect(260, 160, 500, 4);
        
        // Progress bar (random position)
        ctx.fillStyle = '#1DB954';
        ctx.fillRect(260, 160, 200, 4);
        
        // Timestamps dengan Poppins Regular
        ctx.fillStyle = '#B3B3B3';
        ctx.font = '14px Poppins';
        ctx.fillText('00:00', 260, 190);
        
        // Duration
        const durationText = moment.utc(duration).format('mm:ss');
        const durationWidth = ctx.measureText(durationText).width;
        ctx.fillText(durationText, 760 - durationWidth, 190);
        
        // Spotify logo
        ctx.fillStyle = '#1DB954';
        ctx.beginPath();
        ctx.arc(750, 40, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Tambah icon play di logo
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(745, 35);
        ctx.lineTo(745, 45);
        ctx.lineTo(755, 40);
        ctx.closePath();
        ctx.fill();
        
        return canvas.toBuffer();
    } catch (error) {
        console.error('Error creating Spotify card:', error);
        throw error;
    }
}

export default async ({ sock, m, id, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { text: '🎵 Masukkan judul lagu yang ingin diputar atau dicari.' });
            return;
        }

        await m.react('🔍');
        await sock.sendMessage(id, { text: `🔍 Sedang mencari *${psn}* di Spotify...` });
        
        const { thumbnail, title, author, audio, duration = 180000 } = await spotifySong(psn);
        
        // Buat Spotify card
        const cardBuffer = await createSpotifyCard(title, author, thumbnail, duration);
        
        // Kirim card dan info
        await sock.sendMessage(id, { 
            image: cardBuffer,
            caption: `🎵 *${title}*\n👤 ${author}\n\n_⏳ Mohon tunggu, audio sedang dikirim..._`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: author,
                    thumbnailUrl: thumbnail,
                    sourceUrl: 'https://open.spotify.com',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
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

        // Kirim audio
        await sock.sendMessage(id, { 
            audio: { url: audio }, 
            mimetype: 'audio/mpeg', 
            fileName: `${title}.mp3` 
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

        await m.react('✨');
        
    } catch (error) {
        console.error('Error in spotify play:', error);
        await sock.sendMessage(id, { 
            text: '❌ Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.' 
        });
        await m.react('❌');
    }
};

export const help = {
    name: "play",
    description: "Play music from Spotify",
    usage: ".play <song title>",
    example: ".play Bla Bla Bla Bla"
};
