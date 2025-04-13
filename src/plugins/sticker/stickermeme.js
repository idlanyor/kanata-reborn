// import { createSticker, StickerTypes } from "wa-sticker-formatter";
// import { createCanvas, loadImage, registerFont } from 'canvas';
// import { exec } from 'child_process';
// import { promisify } from 'util';
// import { writeFile, unlink } from 'fs/promises';
// import { join } from 'path';
// import { tmpdir } from 'os';

// const execAsync = promisify(exec);

// // Daftarkan font system
// registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', { family: 'DejaVu Sans' });

// export const handler = "smeme"
// export const description = "Sticker Meme maker";

// async function createMemeFrame(image, topText, bottomText, width = 512, height = 512) {
//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext('2d');
    
//     // Gambar background
//     const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
//     const x = (canvas.width - image.width * scale) / 2;
//     const y = (canvas.height - image.height * scale) / 2;
    
//     ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
    
//     // Konfigurasi teks yang lebih mudah dibaca
//     ctx.font = 'bold 46px DejaVu Sans';
//     ctx.textAlign = 'center';
//     ctx.lineWidth = 8; // Stroke lebih tebal
    
//     // Fungsi untuk render teks dengan multiple stroke untuk efek lebih jelas
//     function drawText(text, x, y) {
//         // Outer stroke hitam
//         ctx.strokeStyle = 'black';
//         ctx.lineWidth = 8;
//         ctx.strokeText(text, x, y);
        
//         // Inner stroke putih
//         ctx.strokeStyle = 'white';
//         ctx.lineWidth = 4;
//         ctx.strokeText(text, x, y);
        
//         // Fill teks
//         ctx.fillStyle = 'white';
//         ctx.fillText(text, x, y);
//     }
    
//     // Helper untuk wrap teks
//     function wrapText(text, maxWidth) {
//         const words = text.split(' ');
//         const lines = [];
//         let line = '';
        
//         for (let word of words) {
//             const testLine = line + word + ' ';
//             if (ctx.measureText(testLine).width > maxWidth) {
//                 lines.push(line);
//                 line = word + ' ';
//             } else {
//                 line = testLine;
//             }
//         }
//         lines.push(line);
//         return lines;
//     }
    
//     // Render teks atas dengan shadow
//     if (topText) {
//         const topLines = wrapText(topText, canvas.width - 60);
//         topLines.forEach((line, i) => {
//             const y = 60 + (i * 46);
//             // Tambah shadow
//             ctx.shadowColor = 'black';
//             ctx.shadowBlur = 4;
//             ctx.shadowOffsetX = 2;
//             ctx.shadowOffsetY = 2;
//             drawText(line.trim(), canvas.width/2, y);
//         });
//     }
    
//     // Reset shadow untuk teks bawah
//     ctx.shadowColor = 'transparent';
    
//     // Render teks bawah
//     if (bottomText) {
//         const bottomLines = wrapText(bottomText, canvas.width - 60);
//         bottomLines.reverse().forEach((line, i) => {
//             const y = canvas.height - 30 - (i * 46);
//             drawText(line.trim(), canvas.width/2, y);
//         });
//     }
    
//     return canvas.toBuffer();
// }

// async function createVideoMeme(videoBuffer, topText, bottomText) {
//     const tempDir = join(tmpdir(), `meme_${Date.now()}`);
//     const inputPath = join(tempDir, 'input.mp4');
//     const outputPath = join(tempDir, 'output.webp');
    
//     try {
//         // Tulis video buffer ke file temporary
//         await writeFile(inputPath, videoBuffer);
        
//         // Extract frame pertama untuk dimensi
//         const { stdout } = await execAsync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${inputPath}"`);
//         const [width, height] = stdout.trim().split('x').map(Number);
        
//         // Konversi video ke WebP animasi dengan menambahkan teks
//         const ffmpegCommand = [
//             'ffmpeg -i', inputPath,
//             '-vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2"',
//             '-vcodec libwebp -lossless 1',
//             '-preset default -loop 0',
//             '-an -vsync 0',
//             '-t 3', // Batasi durasi 3 detik
//             outputPath
//         ].join(' ');
        
//         await execAsync(ffmpegCommand);
        
//         // Baca hasil WebP
//         const webpBuffer = await import('fs/promises').then(fs => fs.readFile(outputPath));
//         return webpBuffer;
        
//     } finally {
//         // Cleanup
//         try {
//             await unlink(inputPath).catch(() => {});
//             await unlink(outputPath).catch(() => {});
//         } catch (e) {
//             console.error('Error cleaning up:', e);
//         }
//     }
// }

// export default async ({ sock, m, id, psn, attf }) => {
//     try {
//         let mediaBuffer;
//         let isVideo = false;
        
//         // Cek media dari quote atau attachment
//         if (m.quotedMsg) {
//             const quotedMsg = m.quotedMsg;
//             if (quotedMsg.type === 'video') {
//                 mediaBuffer = await quotedMsg.download();
//                 isVideo = true;
//             } else if (quotedMsg.type === 'image') {
//                 mediaBuffer = await quotedMsg.download();
//             }
//         } else if (attf) {
//             mediaBuffer = attf;
//             isVideo = m.type === 'video';
//         } else {
//             await m.reply('❌ Kirim/reply gambar/video dengan caption .smeme text1.text2\n\nNote: text2 bersifat opsional');
//             return;
//         }

//         // Parse teks
//         let topText = '', bottomText = '';
//         if (psn) {
//             const texts = psn.split('.').map(t => t.trim());
//             if (texts.length === 1) {
//                 bottomText = texts[0];
//             } else if (texts.length === 2) {
//                 [topText, bottomText] = texts;
//             }
//         }

//         if (!topText && !bottomText) {
//             await m.reply('❌ Masukkan teks untuk meme! Format: .smeme text1.text2');
//             return;
//         }

//         await m.react('⏳');

//         let finalBuffer;
//         if (isVideo) {
//             finalBuffer = await createVideoMeme(mediaBuffer, topText, bottomText);
//         } else {
//             const image = await loadImage(mediaBuffer);
//             finalBuffer = await createMemeFrame(image, topText, bottomText);
//         }

//         // Buat sticker
//         const stickerOptions = {
//             pack: "Kanata sMeme",
//             author: "Roy~404~",
//             type: StickerTypes.FULL,
//             quality: 100
//         };

//         const sticker = await createSticker(finalBuffer, stickerOptions);
        
//         await sock.sendMessage(id, { 
//             sticker: sticker 
//         }, { 
//             quoted:m 
//         });

//         await m.react('✨');
        
//     } catch (error) {
//         console.error('Error in smeme:', error);
//         await m.reply('❌ Terjadi kesalahan saat memproses meme');
//         await m.react('❌');
//     }
// };

// export const help = {
//     name: 'smeme',
//     description: 'Membuat sticker meme dari gambar atau video',
//     usage: '.smeme text1.text2 (reply/kirim gambar/video)'
// };
