import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import pkg from 'file-type';
const { fileTypeFromBuffer } = pkg;

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

// Fungsi untuk mengecek apakah ffmpeg terinstall
async function checkFfmpeg() {
    try {
        await execAsync('ffmpeg -version');
        return true;
    } catch (error) {
        return false;
    }
}

// Fungsi untuk membuat direktori jika belum ada
function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

// Fungsi untuk menyimpan media sementara
async function saveTempMedia(buffer, prefix = '') {
    const tempDir = './temp';
    ensureDirectoryExists(tempDir);
    
    const fileType = await fileTypeFromBuffer(buffer);
    const extension = fileType ? fileType.ext : 'bin';
    const tempFile = path.join(tempDir, `${prefix}_${Date.now()}.${extension}`);
    
    await writeFileAsync(tempFile, buffer);
    return tempFile;
}

// Fungsi untuk menghapus file temporary
async function cleanupTempFiles(...files) {
    for (const file of files) {
        try {
            await unlinkAsync(file);
        } catch (error) {
            console.error(`Error cleaning up ${file}:`, error);
        }
    }
}

// Handler utama
export default async ({ sock, m, id, psn, args, cmd, prefix }) => {
    try {
        // Cek apakah ffmpeg terinstall
        if (!await checkFfmpeg()) {
            await m.reply('❌ FFmpeg tidak terinstall. Silakan install FFmpeg terlebih dahulu.');
            return;
        }

        const subCommand = args[0]?.toLowerCase();
        
        // Bantuan
        if (!subCommand || subCommand === 'help' || subCommand === 'bantuan') {
            const helpText = `🎥 *BANTUAN MEDIA CONVERTER*\n\n` +
                    `🔹 ${prefix}convert tomp3 - Konversi video ke MP3\n` +
                    `🔹 ${prefix}convert compress - Kompres video/gambar\n` +
                    `🔹 ${prefix}convert cut <durasi_detik> - Potong durasi video\n\n` +
                    `Cara penggunaan:\n` +
                    `- Kirim media dengan caption command\n` +
                    `- Reply media dengan command\n\n` +
                    `Contoh:\n` +
                    `${prefix}convert tomp3\n` +
                    `${prefix}convert compress\n` +
                    `${prefix}convert cut 30`;
            
            await m.reply(helpText);
            return;
        }
        
        // Dapatkan media dari pesan
        const quotedMsg = m.quoted || m;
        const mediaBuffer = await quotedMsg.download();
        
        if (!mediaBuffer) {
            await m.reply('❌ Tidak ada media yang ditemukan. Silakan kirim atau reply media dengan command.');
            return;
        }
        
        await m.react('⏳');
        
        // Konversi video ke MP3
        if (subCommand === 'tomp3') {
            const inputFile = await saveTempMedia(mediaBuffer, 'input');
            const outputFile = inputFile.replace(/\.[^.]+$/, '.mp3');
            
            try {
                await execAsync(`ffmpeg -i "${inputFile}" -vn -acodec libmp3lame -q:a 4 "${outputFile}"`);
                
                await sock.sendMessage(id, {
                    audio: fs.readFileSync(outputFile),
                    mimetype: 'audio/mp3'
                }, { quoted: m });
                
                await m.react('✅');
            } catch (error) {
                console.error('Error converting to MP3:', error);
                await m.reply('❌ Gagal mengkonversi ke MP3');
                await m.react('❌');
            } finally {
                await cleanupTempFiles(inputFile, outputFile);
            }
            return;
        }
        
        // Kompres video/gambar
        if (subCommand === 'compress') {
            const inputFile = await saveTempMedia(mediaBuffer, 'input');
            const outputFile = inputFile.replace(/\.[^.]+$/, '_compressed$&');
            
            try {
                // Deteksi tipe file
                const fileType = await fileTypeFromBuffer(mediaBuffer);
                
                if (fileType.mime.startsWith('video/')) {
                    // Kompres video
                    await execAsync(`ffmpeg -i "${inputFile}" -c:v libx264 -crf 28 -preset faster -c:a aac -b:a 128k "${outputFile}"`);
                    
                    await sock.sendMessage(id, {
                        video: fs.readFileSync(outputFile),
                        caption: '🎥 Video telah dikompress'
                    }, { quoted: m });
                } else if (fileType.mime.startsWith('image/')) {
                    // Kompres gambar
                    await execAsync(`ffmpeg -i "${inputFile}" -q:v 2 "${outputFile}"`);
                    
                    await sock.sendMessage(id, {
                        image: fs.readFileSync(outputFile),
                        caption: '🖼️ Gambar telah dikompress'
                    }, { quoted: m });
                } else {
                    await m.reply('❌ Format file tidak didukung');
                    return;
                }
                
                await m.react('✅');
            } catch (error) {
                console.error('Error compressing media:', error);
                await m.reply('❌ Gagal mengkompress media');
                await m.react('❌');
            } finally {
                await cleanupTempFiles(inputFile, outputFile);
            }
            return;
        }
        
        // Potong durasi video
        if (subCommand === 'cut') {
            const duration = parseInt(args[1]);
            
            if (!duration || isNaN(duration)) {
                await m.reply(`❌ Masukkan durasi dalam detik\nContoh: ${prefix}convert cut 30`);
                return;
            }
            
            const inputFile = await saveTempMedia(mediaBuffer, 'input');
            const outputFile = inputFile.replace(/\.[^.]+$/, '_cut$&');
            
            try {
                await execAsync(`ffmpeg -i "${inputFile}" -t ${duration} -c copy "${outputFile}"`);
                
                await sock.sendMessage(id, {
                    video: fs.readFileSync(outputFile),
                    caption: `🎥 Video telah dipotong menjadi ${duration} detik`
                }, { quoted: m });
                
                await m.react('✅');
            } catch (error) {
                console.error('Error cutting video:', error);
                await m.reply('❌ Gagal memotong video');
                await m.react('❌');
            } finally {
                await cleanupTempFiles(inputFile, outputFile);
            }
            return;
        }
        
        // Perintah tidak dikenal
        await m.reply(`❓ Perintah tidak dikenal\nGunakan ${prefix}convert help untuk melihat bantuan`);
        
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat mengkonversi media');
        await m.react('❌');
    }
}; 