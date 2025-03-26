import { spotifySong } from "../../lib/neoxr/spotify.js";
import { createCanvas, loadImage, registerFont } from 'canvas';
import moment from 'moment';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import svg2img from 'svg2img'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register Poppins fonts
registerFont(join(__dirname, '../../assets/fonts/Poppins-Bold.ttf'), { family: 'Poppins Bold' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Medium.ttf'), { family: 'Poppins Medium' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Regular.ttf'), { family: 'Poppins' });

export const handler = 'play'
export const description = 'Search Spotify Song/Artist'

export async function createSpotifyCard(title, author, thumbnail, duration) {
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#191414'); // Hitam
    gradient.addColorStop(1, '#1DB954'); // Hijau Spotify
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1DB954';
    ctx.font = 'bold 28px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('Kanata Spotify Player', 400, 50);

    try {
        // Load and draw thumbnail
        const image = await loadImage(thumbnail);
        ctx.drawImage(image, 30, 80, 250, 250);

        // Song title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '28px Poppins Bold';
        ctx.textAlign = 'left';
        ctx.fillText(title.length > 25 ? title.substring(0, 25) + '...' : title, 320, 200);

        // Artist name
        ctx.fillStyle = '#B3B3B3';
        ctx.font = '20px Poppins Medium';
        ctx.fillText(author, 320, 250);

        // Progress bar
        ctx.fillStyle = '#404040';
        ctx.fillRect(30, 360, canvas.width - 60, 10);
        ctx.fillStyle = '#1DB954';
        ctx.fillRect(30, 360, (canvas.width - 60) * 0.4, 10);

        // Timestamps
        ctx.fillStyle = '#B3B3B3';
        ctx.font = '14px Poppins';
        ctx.fillText('00:00', 30, 390);
        ctx.textAlign = 'right';
        ctx.fillText(moment.utc(duration).format('mm:ss'), canvas.width - 30, 390);

        // SVG Buttons
        const buttons = {
            previous: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18V6l-6 6 6 6zM9 6H7v12h2V6z" fill="#000"/></svg>',
            play: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7L8 5z" fill="#000"/></svg>',
            next: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18V6l6 6-6 6zM15 6h2v12h-2V6z" fill="#000"/></svg>',
        };

        const buttonPositions = [
            { svg: buttons.previous, x: 300 },
            { svg: buttons.play, x: 380 },
            { svg: buttons.next, x: 460 },
        ];

        for (const btn of buttonPositions) {
            await new Promise((resolve) => {
                svg2img(btn.svg, (error, buffer) => {
                    if (!error) {
                        loadImage(buffer).then(image => {
                            ctx.drawImage(image, btn.x, 420, 40, 40);
                            resolve();
                        });
                    } else {
                        console.error('Error generating SVG button:', error);
                        resolve();
                    }
                });
            });
        }

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
        }, { quoted: m });

        // Kirim audio
        await sock.sendMessage(id, {
            audio: { url: audio },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m });

        await m.react('✨');

    } catch (error) {
        console.error('Error in spotify play:', error);
        await sock.sendMessage(id, {
            text: '❌ Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.'
        });
        await m.react('❌');
    }
};


