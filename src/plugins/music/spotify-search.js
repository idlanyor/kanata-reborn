import {  proto, prepareWAMessageMedia, generateWAMessageFromContent } from '@fizzxydev/baileys-pro';

import { spotifySearch } from '../../lib/neoxr/spotify.js';
import { createCanvas,registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register Poppins fonts
registerFont(join(__dirname, '../../assets/fonts/Poppins-Bold.ttf'), { family: 'Poppins Bold' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Medium.ttf'), { family: 'Poppins Medium' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Regular.ttf'), { family: 'Poppins' });

export const handler = "spotifysearch"
export const description = "Cari Musik dari *Spotify*";

// Lokasi penyimpanan gambar sementara
const tempImagePath = path.join(process.cwd(), 'temp', 'spotify-search.jpg');

// Fungsi untuk membuat gambar Spotify Search menggunakan canvas
const createSpotifySearchImage = async (query, results = []) => {
    // Buat direktori temp jika belum ada
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');

    // Background utama
    ctx.fillStyle = '#191414';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(29, 185, 84, 0.05)');
    gradient.addColorStop(1, 'rgba(25, 20, 20, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Judul
    ctx.fillStyle = '#1DB954';
    ctx.font = 'bold 28px Poppins Bold';
    ctx.textAlign = 'center';
    ctx.fillText('Spotify Search', 400, 50);

    // Search bar
    ctx.fillStyle = '#333333';
    ctx.fillRect(150, 80, 500, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText('🔍', 160, 105);

    ctx.fillStyle = '#B3B3B3';
    ctx.font = '16px Poppins';
    ctx.fillText(query || 'Cari artis, lagu, atau album...', 190, 105);

    // Hasil pencarian
    let yPos = 150;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Poppins Bold';
    ctx.textAlign = 'left';
    ctx.fillText('Hasil Teratas', 150, yPos);

    yPos += 30;

    // Menampilkan hasil pencarian (maksimal 5)
    const displayResults = results.slice(0, 5);

    displayResults.forEach((result) => {
        ctx.fillStyle = '#333333';
        ctx.fillRect(150, yPos, 500, 60);

        ctx.fillStyle = '#555555';
        ctx.fillRect(170, yPos + 10, 40, 40);

        ctx.fillStyle = '#1DB954';
        ctx.font = 'bold 16px Poppins Bold';
        ctx.textAlign = 'center';

        // Ikon berdasarkan tipe
        const type = result.type || 'LAGU';
        if (type === 'LAGU') {
            ctx.fillText('♫', 190, yPos + 35);
        } else if (type === 'ARTIS') {
            ctx.fillText('👤', 190, yPos + 35);
        } else {
            ctx.fillText('💿', 190, yPos + 35);
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Poppins Bold';
        ctx.textAlign = 'left';
        ctx.fillText(result.title, 230, yPos + 25);

        ctx.fillStyle = '#B3B3B3';
        ctx.font = '14px Poppins Medium';
        ctx.fillText(result.artist || 'Various Artist', 230, yPos + 45);

        ctx.fillStyle = '#1DB954';
        ctx.font = '12px Poppins';
        ctx.textAlign = 'right';
        ctx.fillText(type, 630, yPos + 25);

        yPos += 70;
    });

    // Navigation bar
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    const navIcons = ['🏠', '🔍', '📚', '❤️'];
    const navLabels = ['Beranda', 'Cari', 'Koleksi', 'Favorit'];

    for (let i = 0; i < navIcons.length; i++) {
        const x = (canvas.width / navIcons.length) * (i + 0.5);

        ctx.fillStyle = i === 1 ? '#1DB954' : '#B3B3B3';
        ctx.font = '20px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText(navIcons[i], x, canvas.height - 25);

        ctx.font = '12px Poppins';
        ctx.fillText(navLabels[i], x, canvas.height - 10);
    }

    // Simpan gambar ke file dengan kualitas tinggi
    const buffer = canvas.toBuffer('image/jpeg', { quality: 1.0 });
    fs.writeFileSync(tempImagePath, buffer);

    return tempImagePath;
};

const spotifySearchResult = async (query) => {
    const hasilPencarian = await spotifySearch(query);
    let sections = [{
        title: "Kanata V3",
        highlight_label: 'Start Chats',
        rows: [{
            header: "Kanata V3",
            title: "Menu",
            description: `Kembali ke menu!`,
            id: '.menu'
        },
        {
            header: "Kanata V3",
            title: "Owner Bot",
            description: "Owner bot Kanata V3",
            id: '.owner'
        }]
    }];

    hasilPencarian.forEach((hasil) => {
        sections.push({
            title: `${hasil.title} - ${hasil.artist || 'Various Artist'}`,
            highlight_label: hasil.duration,
            rows: [
                {
                    title: `Download ${hasil.title}`,
                    description: `${hasil.artist || 'Various Artist'}`,
                    id: `spotify ${hasil.url}`
                }
            ]
        });
    });

    let listMessage = {
        title: '🔍 Hasil Pencarian Spotify',
        sections
    };
    return listMessage;
}

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn == "") {
        return sock.sendMessage(id, { text: "🔎 Mau cari apa?\nKetik *ss <query>*\nContoh: *ss himawari*" });
    }

    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } });

    try {
        // Cari hasil dari Spotify
        const hasilPencarian = await spotifySearch(psn);

        // Buat gambar dengan canvas
        const imagePath = await createSpotifySearchImage(psn, hasilPencarian);

        let roy = `*Powered By Kanata V3*\nMenampilkan hasil pencarian untuk: "${psn}", klik list untuk info selengkapnya. 🍿`;

        // Persiapkan media dengan kualitas tinggi
        const mediaOptions = {
            image: {
                url: imagePath
            },
            jpegThumbnail: fs.readFileSync(imagePath).toString('base64')
        };

        const preparedMedia = await prepareWAMessageMedia(mediaOptions, { upload: sock.waUploadToServer });

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    "messageContextInfo": {
                        "deviceListMetadata": {},
                        "deviceListMetadataVersion": 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: roy
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: '©️ Kanata V3'
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            subtitle: sender,
                            hasMediaAttachment: true,
                            ...preparedMedia
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    "name": "single_select",
                                    "buttonParamsJson": JSON.stringify(await spotifySearchResult(psn, sender))
                                },
                                {
                                    "name": "quick_reply",
                                    "buttonParamsJson": "{\"display_text\":\"Owner Bot\",\"id\":\"owner\"}"
                                }
                            ],
                        })
                    })
                }
            }
        }, { quoted: m });

        await sock.relayMessage(id, msg.message, {
            messageId: msg.key.id
        });

        // Hapus file gambar sementara setelah dikirim
        if (fs.existsSync(tempImagePath)) {
            fs.unlinkSync(tempImagePath);
        }

        await sock.sendMessage(id, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error('Error in spotifySearch:', error);
        await sock.sendMessage(id, { text: "❌ Terjadi kesalahan saat mencari musik. Silakan coba lagi nanti." });
        await sock.sendMessage(id, { react: { text: '❌', key: m.key } });
    }
} 