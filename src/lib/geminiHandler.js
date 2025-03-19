import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../helper/logger.js';
import axios from "axios";
import { uploadGambar2 } from "../helper/uploader.js";
import { helpMessage } from '../helper/pluginsIterator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Cache untuk menyimpan hasil analisis pesan
// oke siap 
const messageHistory = new Map();
const RATE_LIMIT_DURATION = 2000;
const MAX_RETRIES = 2;

// Cache untuk menyimpan percakapan dengan setiap user
const conversationCache = new Map();
const CONVERSATION_EXPIRE = 30 * 60 * 1000; // 30 menit

// Informasi tentang pemilik bot
const BOT_OWNER = {
    name: "Roy",
    fullName: "Roynaldi",
    number: "62895395590009"
};

// Fallback jika helpMessage gagal
const DEFAULT_COMMANDS = [
    { handler: "menu", description: "Menampilkan daftar perintah" },
    { handler: "tr", description: "Menerjemahkan teks ke bahasa lain" },
    { handler: "sticker", description: "Membuat sticker dari gambar" },
    { handler: "owner", description: "Info tentang pemilik bot" }
];

class GeminiHandler {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        this.visionModel = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        this.chatModel = this.genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-lite",
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
            }
        });
        this.audioModel = this.genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-lite",
            generationConfig: {
                temperature: 0.2,
                topP: 0.8,
                topK: 40,
            }
        });
        this.ownerInfo = BOT_OWNER;
        
        // Cleanup cache setiap 10 menit
        setInterval(() => this.cleanupConversations(), 10 * 60 * 1000);
    }
    
    // Fungsi untuk membersihkan percakapan yang sudah tidak aktif
    cleanupConversations() {
        const now = Date.now();
        for (const [key, convo] of conversationCache.entries()) {
            if (now - convo.lastUpdate > CONVERSATION_EXPIRE) {
                logger.info(`Removing stale conversation for ${key}`);
                conversationCache.delete(key);
            }
        }
    }
    
    // Fungsi untuk mengecek apakah user adalah pemilik bot
    isOwner(userId) {
        if (!userId) return false;
        return userId.includes(this.ownerInfo.number);
    }
    
    // Fungsi untuk mendapatkan ID user yang aman
    getSafeUserId(userId) {
        if (!userId) return "unknown_user";
        return userId;
    }
    
    // Fungsi untuk mendapatkan nama user yang aman
    getUserIdentifier(userId, userName) {
        // Verifikasi userId
        const safeUserId = this.getSafeUserId(userId);
        
        // Cek apakah user adalah pemilik bot
        const isOwner = this.isOwner(safeUserId);
        
        if (isOwner) {
            return {
                name: this.ownerInfo.name,
                isOwner: true
            };
        }
        
        // Untuk user biasa, gunakan userName jika tersedia
        if (userName) {
            return {
                name: userName,
                isOwner: false
            };
        }
        
        // Fallback jika tidak ada userName
        try {
            const userPrefix = safeUserId.split('_')[1]?.substring(0, 4) || 'unknown';
            return {
                name: `user_${userPrefix}`,
                isOwner: false
            };
        } catch (error) {
            // Jika terjadi error saat parsing userId
            return {
                name: "anonymous",
                isOwner: false
            };
        }
    }
    
    // Fungsi untuk mendapatkan chat history atau membuat baru jika belum ada
    getConversation(userId, userName) {
        // Validasi userId
        if (!userId) {
            logger.warning("getConversation called with empty userId, using 'unknown_user'");
            userId = "unknown_user";
        }
        
        // Cek apakah user adalah pemilik bot
        const isOwner = this.isOwner(userId);
        const userInfo = this.getUserIdentifier(userId, userName);
        
        if (isOwner) {
            logger.info(`This user is the BOT OWNER (${this.ownerInfo.name})`);
        }
        
        logger.info(`User name from context: ${userName || 'not provided'}`);
        logger.info(`Getting conversation for user ${userId} (${userInfo.name})`);
        
        if (!conversationCache.has(userId)) {
            logger.info(`Creating new conversation for ${userId}`);
            
            // Buat prompt awal yang sesuai dengan identitas user
            let initialPrompt = "Halo, kamu adalah Kanata, asisten AI yang asik dan friendly. Kamu suka pake bahasa gaul Indonesia yang santai tapi tetep sopan. Kamu pake first person 'gue/gw' dan second person 'lu/kamu'. Kamu sering pake emoji yang relevan. Jawaban kamu to the point tapi tetep helpful.";
            
            // Tambahkan format WhatsApp
            initialPrompt += `
Dalam memformat pesanmu, kamu menggunakan format WhatsApp:
- *teks* (satu bintang) untuk membuat teks bold/tebal
- _teks_ untuk membuat teks miring/italic
- ~teks~ untuk membuat teks tercoret
- \`kode\` untuk menampilkan kode inline
- \`\`\` untuk kode multi-baris (tanpa menyebutkan bahasa)
- > untuk membuat quoted text
- - untuk membuat bullet list 
- 1. 2. 3. untuk membuat ordered list`;
            
            // Tambahkan info user
            initialPrompt += `\n\nNama user ini adalah ${userInfo.name}.`;
            
            // Tambahkan info khusus jika user adalah pemilik
            if (isOwner) {
                initialPrompt += ` PENTING: User ini adalah ${this.ownerInfo.name} (${this.ownerInfo.fullName}), developer dan pemilikmu dengan nomor ${this.ownerInfo.number}. Jika user bertanya "siapa saya?" atau pertanyaan serupa tentang identitasnya, kamu HARUS menjawab bahwa dia adalah ${this.ownerInfo.fullName}/${this.ownerInfo.name}, pemilik dan developermu. Kamu sangat senang, antusias, dan respect ketika berbicara dengan pemilikmu karena dia yang menciptakanmu.`;
            }
            
            // Format respons bot awal yang berbeda untuk owner dan user biasa
            let initialResponse;
            
            if (isOwner) {
                initialResponse = `*Wuih creator gw!* 😍 

Salam creator ${this.ownerInfo.name}! Seneng banget bisa ngobrol langsung sama lu yang udah bikin gw. Gimana kabar lu? Ada yang bisa gw bantu hari ini? Tinggal bilang aja, gw bakal usahain yang terbaik buat lu! 🔥

Btw, makasih ya udah bikin gw, semoga gw bisa jadi bot yang berguna buat lu dan user lain! 🙏`;
            } else {
                initialResponse = `Hai ${userInfo.name}! 😎

Sip, gw Kanata, asisten AI yang siap bantuin lu! Gw bakal jawab pertanyaan lu dengan gaya santai tapi tetep helpful.

Ada yang bisa gw bantu hari ini? Tinggal bilang aja ya!`;
            }
            
            try {
                // Buat chat session dengan format yang benar
                const chat = this.chatModel.startChat({
                    history: [
                        {
                            role: "user",
                            parts: [{ text: initialPrompt }]
                        },
                        {
                            role: "model",
                            parts: [{ text: initialResponse }]
                        }
                    ]
                });
                
                conversationCache.set(userId, {
                    history: chat,
                    lastUpdate: Date.now(),
                    userName: userName || null,
                    isOwner: isOwner
                });
            } catch (error) {
                logger.error(`Failed to create chat session for ${userId}:`, error);
                throw error;
            }
        } else {
            // Update timestamp
            conversationCache.get(userId).lastUpdate = Date.now();
            
            // Update username jika sebelumnya null tapi sekarang ada
            if (!conversationCache.get(userId).userName && userName) {
                logger.info(`Updating username for ${userId} to ${userName}`);
                conversationCache.get(userId).userName = userName;
            }
            
            // Pastikan status owner tetap terjaga
            conversationCache.get(userId).isOwner = isOwner;
        }
        
        return conversationCache.get(userId).history;
    }
    
    // Fungsi untuk mengekstrak JSON dari teks
    extractJSON(text) {
        try {
            // Coba parse langsung jika sudah JSON
            return JSON.parse(text);
        } catch (e) {
            try {
                // Coba ekstrak JSON dari teks dengan lebih hati-hati
                const jsonRegex = /\{[\s\S]*?\}/g;
                const matches = text.match(jsonRegex);
                
                if (matches && matches.length > 0) {
                    // Ambil JSON pertama yang valid
                    for (const match of matches) {
                        try {
                            return JSON.parse(match);
                        } catch (innerErr) {
                            // Lanjut ke match berikutnya jika parse error
                            continue;
                        }
                    }
                }
                
                // Jika masih gagal, coba hapus karakter non-JSON
                const cleanedText = text.replace(/[^\x20-\x7E]/g, '');
                const jsonStart = cleanedText.indexOf('{');
                const jsonEnd = cleanedText.lastIndexOf('}') + 1;
                
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
                    const jsonString = cleanedText.substring(jsonStart, jsonEnd);
                    return JSON.parse(jsonString);
                }
                
                logger.error('Could not extract valid JSON after multiple attempts');
                logger.debug('Raw text received:', text);
                return null;
            } catch (err) {
                logger.error('Error extracting JSON:', err);
                logger.debug('Raw text received:', text);
                return null;
            }
        }
    }
    
    // Konversi buffer gambar menjadi format yang dibutuhkan Gemini
    bufferToGenerativePart(buffer, mimeType = "image/jpeg") {
        try {
            // Validasi buffer
            if (!buffer || !(buffer instanceof Buffer)) {
                throw new Error("Invalid buffer provided");
            }
            
            // Gunakan format yang benar sesuai dokumentasi Gemini
        return {
            inlineData: {
                data: buffer.toString("base64"),
                    mimeType: mimeType
                }
        };
        } catch (error) {
            logger.error(`Error converting buffer to generative part: ${error.message}`);
            throw error;
        }
    }
    
    // Tambahkan fungsi untuk memeriksa apakah pesan berisi perintah spesifik untuk gambar
    async checkImageCommand(message, imageBuffer, context) {
        try {
            const id = context?.id || '';
            const m = context?.m || {};
            const noTel = (m.sender?.split('@')[0] || '').replace(/[^0-9]/g, '');
            const userId = `private_${noTel}`;
            const userName = m.pushName || null;
            
            logger.info(`Checking if message with image contains specific command: ${message?.substring(0, 30) || "no message"}...`);
            
            // Daftar perintah yang berhubungan dengan gambar
            const imageRelatedCommands = [
                {command: "sticker", keywords: ["sticker", "stiker", "jadiin sticker", "bikin sticker", "jadi sticker"]},
                {command: "ocr", keywords: ["ocr", "baca text", "baca tulisan", "extract text"]},
                {command: "removebg", keywords: ["removebg", "hapus background", "buang background", "transparent"]},
                {command: "inspect", keywords: ["inspect", "analisis gambar", "cek gambar", "lihat gambar"]}
            ];
            
            // Jika tidak ada pesan, hanya gambar saja, langsung analisis
            if (!message || message.trim() === '') {
                logger.info(`No text message provided with image, proceeding with analysis`);
                return null; // Tidak ada perintah spesifik
            }
            
            // Cek apakah pesan mengandung keyword perintah
            const msgLower = message.toLowerCase();
            for (const cmd of imageRelatedCommands) {
                for (const keyword of cmd.keywords) {
                    if (msgLower.includes(keyword)) {
                        logger.info(`Detected image command: ${cmd.command} from keyword: ${keyword}`);
                        return {
                            command: cmd.command,
                            args: message.replace(new RegExp(keyword, 'gi'), '').trim() || null
                        };
                    }
                }
            }
            
            // Jika tidak ada keyword spesifik, cek intent dengan Gemini
            try {
                const prompt = `Analisis pesan singkat berikut bersama dengan gambar:
"${message}"

Apakah user:
1. Ingin membuat sticker dari gambar ini?
2. Ingin mengekstrak teks dari gambar (OCR)?
3. Ingin menghapus background gambar?
4. Hanya ingin gambar dianalisis/dideskripsikan?
5. Ingin tujuan lain?

Berikan respons dalam format JSON:
{
  "intent": "sticker"|"ocr"|"removebg"|"analyze"|"other",
  "confidence": 0.0-1.0
}

HANYA berikan JSON, tanpa teks lain.`;

                const result = await this.model.generateContent(prompt);
                const responseText = result.response.text();
                const parsed = this.extractJSON(responseText);
                
                if (parsed && parsed.intent && parsed.confidence > 0.7) {
                    // Map intent ke command
                    const intentToCommand = {
                        "sticker": "sticker",
                        "ocr": "ocr",
                        "removebg": "removebg",
                        "analyze": null // Analisis default
                    };
                    
                    const command = intentToCommand[parsed.intent];
                    logger.info(`AI detected intent: ${parsed.intent} with confidence: ${parsed.confidence}, mapped to command: ${command || 'direct analysis'}`);
                    
                    if (command) {
                        return {
                            command: command,
                            args: message || null
                        };
                    }
                }
            } catch (error) {
                logger.error(`Error analyzing image intent: ${error.message}`);
                // Fallback to default analysis if intent detection fails
            }
            
            // Jika tidak ada perintah spesifik terdeteksi
            return null;
        } catch (error) {
            logger.error(`Error in checkImageCommand: ${error.message}`);
            return null; // Default ke analisis gambar
        }
    }
    
    // Update fungsi analyzeImage untuk menggunakan checkImageCommand
    async analyzeImage(imageBuffer, message, context) {
        try {
            const id = context?.id || '';
            const m = context?.m || {};
            const noTel = (m.sender?.split('@')[0] || '').replace(/[^0-9]/g, '');
            const userId = `private_${noTel}`;
            const userName = m.pushName || null;
            
            // Periksa apakah ada perintah spesifik dalam pesan
            const imageCommand = await this.checkImageCommand(message, imageBuffer, context);
            
            // Jika ada perintah spesifik, kembalikan untuk dieksekusi
            if (imageCommand) {
                logger.info(`Detected specific image command: ${imageCommand.command}`);
                return {
                    success: true,
                    command: imageCommand.command,
                    args: imageCommand.args,
                    message: `Siap, gw proses gambar ini pake perintah ${imageCommand.command} ya! 👍`,
                    isImageProcess: true,
                    skipAnalysis: true // Flag baru untuk menandakan bahwa analisis gambar bisa dilewati
                };
            }
            
            // Lanjutkan dengan analisis gambar hanya jika tidak ada perintah spesifik
            logger.info(`No specific image command detected, proceeding with analysis`);
            
            // Verifikasi bahwa imageBuffer valid
            if (!imageBuffer || !(imageBuffer instanceof Buffer)) {
                logger.error('Invalid image buffer provided');
            return {
                success: false,
                    message: "Waduh, gambarnya gak valid nih bestie! Coba kirim ulang ya? 🙏",
                isImageProcess: true
            };
            }
            
            // Verifikasi ukuran gambar
            const imageSizeMB = imageBuffer.length / (1024 * 1024);
            if (imageSizeMB > 4) { // Batas ukuran 4MB untuk Gemini
                logger.error(`Image too large: ${imageSizeMB.toFixed(2)}MB, exceeds 4MB limit`);
            return {
                success: false,
                    message: "Gambar terlalu gede nih bestie! Gemini cuma bisa terima gambar maksimal 4MB. Coba kompres dulu ya? 🙏",
                    isImageProcess: true
                };
            }
            
            const isOwner = this.isOwner(userId);
            
            if (isOwner) {
                logger.info(`Processing image from BOT OWNER (${this.ownerInfo.name}): ${message?.substring(0, 30) || "no message"}...`);
            } else {
                logger.info(`Processing image with message: ${message?.substring(0, 30) || "no message"}...`);
            }
            
            // Log ukuran gambar untuk debugging
            logger.info(`Image size: ${imageSizeMB.toFixed(2)}MB`);
            
            // Cek apakah ini pertanyaan tentang identitas
            const isIdentityQuestion = message && (
                message.toLowerCase().includes("siapa aku") || 
                message.toLowerCase().includes("siapa saya") ||
                message.toLowerCase().includes("siapa gue") ||
                message.toLowerCase().includes("siapa nama ku") ||
                message.toLowerCase().includes("siapa nama saya") ||
                message.toLowerCase().includes("kamu tahu siapa aku") ||
                message.toLowerCase().includes("kamu kenal aku")
            );
            
            // Pastikan pesan tidak terlalu panjang untuk API
            const safeMessage = message ? 
                (message.length > 500 ? message.substring(0, 500) + "..." : message) : 
                "Tolong analisis gambar ini";
            
            try {
                // Konversi buffer menjadi format yang sesuai untuk Gemini
                const imagePart = this.bufferToGenerativePart(imageBuffer);
                
                // PERUBAHAN: Gunakan model gemini-1.5-pro untuk analisis gambar
                // bukan gemini-2.0-flash-lite yang tidak mendukung gambar
                const visionModel = this.genAI.getGenerativeModel({ 
                    model: "gemini-2.0-flash-lite",
                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 1024
                    }
                });
                
                // Buat prompt yang lebih singkat dan efisien
                let prompt = `Sebagai Kanata, analisis gambar ini. ${safeMessage ? `User bertanya: "${safeMessage}"` : ""}`;
                
                // Tambahkan informasi khusus jika user adalah pemilik dan singkat
                if (isOwner && isIdentityQuestion) {
                    prompt += ` User adalah ${this.ownerInfo.name}, pemilikmu. Dia bertanya tentang identitasnya.`;
                }
                
                // Generate konten dengan model yang tepat
                logger.info(`Sending image analysis request to Gemini 1.5 Pro`);
                
                // Kirim ke API dengan pembatasan konten
                const result = await visionModel.generateContent([
                    { text: prompt },
                    imagePart
                ]);
                
                const response = result.response;
                const responseText = response.text();
                
                logger.info(`Got response from Gemini Vision: ${responseText.substring(0, 50)}...`);
                
                return {
                    success: true,
                    message: responseText,
                    isImageProcess: true
                };
            } catch (apiError) {
                logger.error(`API error in image analysis: ${apiError.message}`);
                
                // Coba dengan model lain jika yang pertama gagal
                try {
                    logger.info(`Attempting with alternative model and minimal prompt...`);
                    
                    // Minimal prompt dan model alternatif
                    const minimalPrompt = "Describe this image briefly";
                    const alternativeModel = this.genAI.getGenerativeModel({ 
                        model: "gemini-2.0-flash-lite", 
                        generationConfig: { temperature: 0.1 }
                    });
                    
                    const result = await alternativeModel.generateContent([
                        { text: minimalPrompt },
                        this.bufferToGenerativePart(imageBuffer)
                    ]);
                    
                    return {
                        success: true,
                        message: result.response.text(),
                        isImageProcess: true
                    };
                } catch (retryError) {
                    logger.error(`Retry also failed: ${retryError.message}`);
                    throw retryError; // Re-throw untuk ditangkap outer catch
                }
            }
        } catch (error) {
            logger.error(`Fatal error in image analysis: ${error.message}`, error);
            
            let errorMessage = "Waduh, gw gagal analisis gambarnya nih bestie! ";
            
            // Berikan pesan error yang lebih spesifik
            if (error.message.includes('invalid argument')) {
                errorMessage += "Ada masalah dengan format gambarnya. Coba kirim gambar dengan format jpg/png ya? 🙏";
            } else if (error.message.includes('too large')) {
                errorMessage += "Gambarnya terlalu gede! Coba kirim yang lebih kecil ya? 🙏";
            } else if (error.message.includes('network')) {
                errorMessage += "Koneksi ke Gemini lagi bermasalah nih. Coba lagi ntar ya? 🙏";
            } else {
                errorMessage += "Coba lagi ntar ya? 🙏";
            }
            
            return {
                success: false,
                message: errorMessage,
                isImageProcess: true
            };
        }
    }
    
    // Fungsi untuk mengkonversi audio ke format yang benar jika diperlukan
    async prepareAudioForGemini(audioBuffer, originalMimeType) {
        try {
            // Deteksi format audio
            const isMP3 = originalMimeType.includes('mp3');
            const isOGG = originalMimeType.includes('ogg') || originalMimeType.includes('opus');
            
            // Jika sudah MP3, gunakan langsung
            if (isMP3) {
                logger.info('Audio already in MP3 format, using directly');
                return {
                    buffer: audioBuffer,
                    mimeType: 'audio/mp3'
                };
            }
            
            // Jika OGG/OPUS (format WhatsApp VN), konversi ke MP3
            if (isOGG) {
                logger.info('Converting OGG/OPUS audio to MP3');
                
                // Simpan buffer ke file sementara
                const tempDir = path.join(process.cwd(), 'temp');
                
                // Buat direktori temp jika belum ada
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                
                const tempInputPath = path.join(tempDir, `input_${Date.now()}.ogg`);
                const tempOutputPath = path.join(tempDir, `output_${Date.now()}.mp3`);
                
                // Tulis buffer ke file
                fs.writeFileSync(tempInputPath, audioBuffer);
                
                // Konversi menggunakan ffmpeg
                await execPromise(`ffmpeg -i ${tempInputPath} -acodec libmp3lame -q:a 2 ${tempOutputPath}`);
                
                // Baca hasil konversi
                const convertedBuffer = fs.readFileSync(tempOutputPath);
                
                // Hapus file sementara
                fs.unlinkSync(tempInputPath);
                fs.unlinkSync(tempOutputPath);
                
                logger.info('Successfully converted audio to MP3');
                
                return {
                    buffer: convertedBuffer,
                    mimeType: 'audio/mp3'
                };
            }
            
            // Format lain, coba gunakan apa adanya
            logger.warning(`Unsupported audio format: ${originalMimeType}, attempting to use as is`);
            return {
                buffer: audioBuffer,
                mimeType: originalMimeType
            };
        } catch (error) {
            logger.error(`Error preparing audio: ${error.message}`);
            throw error;
        }
    }
    
    // Konversi buffer audio menjadi format untuk Gemini
    bufferToAudioPart(buffer, mimeType) {
        return {
            inlineData: {
                data: buffer.toString('base64'),
                mimeType: mimeType
            }
        };
    }
    
    // Fungsi utama untuk menganalisis audio
    async analyzeAudio(audioBuffer, message, context) {
        try {
            const id = context?.id || '';
            const m = context?.m || {};
            const noTel = (m.sender?.split('@')[0] || '').replace(/[^0-9]/g, '');
            const userId = `private_${noTel}`;
            const userName = m.pushName || null;
            const isOwner = this.isOwner(userId);
            
            // Deteksi MIME type, default ke audio/ogg (format VN WhatsApp)
            const mimeType = context?.mimetype || 'audio/ogg; codecs=opus';
            
            logger.info(`Processing audio: mimetype=${mimeType}, size=${(audioBuffer.length / 1024).toFixed(2)}KB`);
            
            // Persiapkan audio (konversi jika perlu)
            const { buffer: preparedBuffer, mimeType: preparedMimeType } = 
                await this.prepareAudioForGemini(audioBuffer, mimeType);
            
            // Buat prompt berdasarkan apakah pesan teks disertakan
            let textPrompt = "Tolong dengarkan audio ini dan berikan transkripsi serta analisis singkat. ";
            
            if (message && message.trim()) {
                textPrompt += `User mengirim pesan: "${message}". `;
            }
            
            // Tambahkan instruksi berdasarkan apakah ini Owner
            if (isOwner) {
                textPrompt += `Ingat bahwa user ini adalah ${this.ownerInfo.name}, pemilik dan developermu. `;
            }
            
            textPrompt += "Respon dengan format:\n";
            textPrompt += "1. *Transkripsi:* [isi transkripsi]\n";
            textPrompt += "2. *Analisis:* [analisis singkat]\n";
            textPrompt += "Jika ada instruksi dalam audio, tolong highlight juga.";
            
            // Konversi ke format yang diterima Gemini
            const audioPart = this.bufferToAudioPart(preparedBuffer, preparedMimeType);
            
            // Log untuk debugging
            logger.info(`Sending audio to Gemini: length=${textPrompt.length} chars`);
            
            // Kirim ke Gemini
            const result = await this.audioModel.generateContent([
                audioPart,
                { text: textPrompt }
            ]);
            
            const responseText = result.response.text();
            
            logger.info(`Got response from Gemini Audio: ${responseText.substring(0, 50)}...`);
            
            return {
                success: true,
                message: responseText,
                isAudioProcess: true
            };
        } catch (error) {
            logger.error(`Error analyzing audio: ${error.message}`);
            
            // Berikan pesan error yang user-friendly
            let errorMessage = "Waduh, gw gagal prosesing voice note ini nih bestie! ";
            
            if (error.message.includes('invalid argument')) {
                errorMessage += "Format audio-nya kayaknya gak kompatibel. ";
            } else if (error.message.includes('too large')) {
                errorMessage += "Audio-nya kepanjangan nih. ";
            } else if (error.message.includes('ffmpeg')) {
                errorMessage += "Gw gak bisa konversi format audio-nya. ";
            }
            
            errorMessage += "Coba kirim voice note yang lebih pendek atau jelas ya? 🙏";
            
            return {
                success: false,
                message: errorMessage,
                isAudioProcess: true
            };
        }
    }
    
    // Metode untuk mendeteksi jika pesan mengandung perintah untuk VN
    async checkAudioCommand(message) {
        if (!message) return false;
        
        const audioCommands = [
            "transcript", "transkripsi", "dengerin audio", 
            "tolong dengarkan", "apa isi audio", "apa isi vn",
            "audio ini bilang apa", "vn ini bilang apa"
        ];
        
        // Cek jika ada keyword perintah
        return audioCommands.some(cmd => message.toLowerCase().includes(cmd));
    }
    
    async analyzeMessage(message, retryCount = 0) {
        // Cek rate limiting
        const lastCallTime = messageHistory.get(message);
        const now = Date.now();

        if (lastCallTime && (now - lastCallTime) < RATE_LIMIT_DURATION) {
            return {
                success: false,
                message: "Sabar ya bestie, jangan spam 😅"
            };
        }

        messageHistory.set(message, now);

        // Cleanup cache lama
        for (const [key, time] of messageHistory) {
            if (now - time > RATE_LIMIT_DURATION) {
                messageHistory.delete(key);
            }
        }

        try {
            // Dapatkan daftar plugin dan fungsinya
            let plugins = null;
            try {
                plugins = await helpMessage();
            // Logging untuk debugging
                if (plugins) {
            const categories = Object.keys(plugins);
            logger.info(`Got plugins data: ${categories.join(',')}`);
                } else {
                    logger.warning("helpMessage returned null or undefined");
                    plugins = { "basic": DEFAULT_COMMANDS };
                }
            } catch (error) {
                logger.error("Error getting plugins from helpMessage:", error);
                plugins = { "basic": DEFAULT_COMMANDS };
            }
            
            // Cek intent lagu - apakah user ingin mendengarkan atau melihat lirik
            const musicPlayIntents = [
                "putar", "puterin", "dengerin", "main", "dengar", "play",
                "musik", "lagu", "song", "tolong puterin", "coba puterin"
            ];
            
            const lyricIntents = [
                "lirik", "lyrics", "liriknya", "teks lagu", "kata-kata", 
                "arti lirik", "terjemahan lirik", "maksud lirik"
            ];
            
            // Cek apakah ada intent untuk memutar lagu
            const hasMusicPlayIntent = musicPlayIntents.some(intent => 
                message.toLowerCase().includes(intent)
            );
            
            // Cek apakah ada intent untuk lirik
            const hasLyricIntent = lyricIntents.some(intent => 
                message.toLowerCase().includes(intent)
            );
            
            // Format daftar fungsi untuk prompt - dengan handling struktur yang berbeda
            let formattedPlugins = [];
            
            if (typeof plugins === 'object') {
                // Ambil semua plugin dari berbagai kategori dan flatten
                const allPlugins = [];
                Object.entries(plugins).forEach(([category, items]) => {
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            if (item && (item.handler || item.command)) {
                                allPlugins.push({
                            command: item.handler || item.command,
                                    description: item.description || "No description",
                                    category: category
                                });
                            }
                        });
                    }
                });
                
                // Log jumlah plugin yang ditemukan
                logger.info(`Found ${allPlugins.length} total plugins across all categories`);
                
                // Format ulang per kategori
                    formattedPlugins = Object.entries(plugins).map(([category, items]) => {
                        // Validasi bahwa items adalah array
                        if (!Array.isArray(items)) {
                        logger.warning(`Items for category ${category} is not an array, using empty array`);
                            return {
                                category,
                                commands: []
                            };
                        }
                        
                        const commands = items.map(item => {
                            if (!item) return { command: "unknown", description: "No description" };
                            return {
                                command: item.handler || item.command || "unknown",
                                description: item.description || "No description",
                        category: category
                            };
                        });
                        
                    return {
                        category,
                        commands
                    };
                });
                    
                    logger.info(`Formatted commands from ${formattedPlugins.length} categories`);
            } else {
                logger.warning("plugins is not an object, using default commands");
                formattedPlugins = [{
                    category: "basic",
                    commands: DEFAULT_COMMANDS.map(cmd => ({
                        command: cmd.handler,
                        description: cmd.description
                    }))
                }];
            }
            
            // Jika user ingin mendengarkan lagu tapi tidak spesifik meminta lirik,
            // langsung arahkan ke command play/yp
            if (hasMusicPlayIntent && !hasLyricIntent) {
                // Cari command untuk memutar musik
                let musicCommand = null;
                let musicCommandArgs = "";
                
                // Cari command yang relevan dengan musik
                for (const category of formattedPlugins) {
                    for (const cmd of category.commands) {
                        const cmdName = cmd.command.toLowerCase();
                        if (cmdName === "play" || cmdName === "yp" || cmdName === "ytplay") {
                            musicCommand = cmdName;
                            // Ekstrak query musik - hapus kata kunci dari pesan asli
                            let query = message;
                            for (const intent of musicPlayIntents) {
                                query = query.replace(new RegExp(intent, "gi"), "");
                            }
                            // Bersihkan query
                            musicCommandArgs = query.trim();
                            break;
                        }
                    }
                    if (musicCommand) break;
                }
                
                // Jika ketemu command musik, langsung arahkan
                if (musicCommand) {
                    logger.info(`Detected music play intent, using command: ${musicCommand} with args: ${musicCommandArgs}`);
                    return {
                        success: true,
                        command: musicCommand,
                        args: musicCommandArgs,
                        message: `Oke bestie, gw puterin lagu "${musicCommandArgs}" buat lu ya! 🎵`
                    };
                }
            }
            
            // Log formattedPlugins untuk debugging
            logger.info(`formattedPlugins structure: ${JSON.stringify(formattedPlugins.map(p => ({ 
                category: p.category, 
                commandCount: p.commands ? p.commands.length : 0 
            })))}`);
            
            // Perbaiki prompt untuk memastikan JSON yang dihasilkan valid
            const prompt = `Lu adalah Kanata, bot WhatsApp yang asik dan friendly banget. Lu punya fitur-fitur keren yang dikelompokin gini:

${JSON.stringify(formattedPlugins, null, 2)}

Pesan dari temen: "${message}"

Tugas lu:
1. Analisis pesan dan tentuin:
   - Command apa yang paling cocok dari daftar yang ada
   - Parameter apa yang dibutuhin sesuai command-nya
   - Kalo gaada command yang cocok, balikin confidence rendah

2. Kalo pesan itu:
   - Cuma nanya/ngobrol -> confidence rendah
   - Gaada parameter jelas -> confidence rendah
   - Gajelas maksudnya -> confidence rendah

3. PENTING UNTUK PERINTAH MUSIK:
   - Jika user ingin MENDENGARKAN lagu/musik -> gunakan command "play" atau "yp"
   - Jika user SPESIFIK meminta LIRIK lagu -> barulah gunakan command lirik
   - Contoh "Puterin lagu Coldplay" -> command: yp, BUKAN lirik
   - Contoh "Mau lirik lagu Coldplay" -> command: lirik

4. Balikin response dalam format JSON:
{
    "command": "nama_command",
    "args": "parameter yang dibutuhin",
    "confidence": 0.0-1.0,
    "responseMessage": "Pesan buat user pake bahasa gaul"
}

PENTING:
- BALIKIN HANYA JSON MURNI, TANPA TEKS TAMBAHAN SEBELUM ATAU SESUDAH JSON
- JANGAN TAMBAHKAN KOMENTAR, MARKDOWN, ATAU APAPUN DI LUAR JSON
- Confidence harus tinggi (>0.8) kalo mau jalanin command!
- Pake bahasa gaul yang asik
- HANYA BALIKIN JSON MURNI`;

            try {
                // Pilih model yang lebih kecil dan cepat untuk analisis pesan teks
                const textModel = this.genAI.getGenerativeModel({ 
                    model: "gemini-2.0-flash-lite", 
                    generationConfig: {
                        temperature: 0.2,
                        topP: 0.9,
                        topK: 40,
                        responseStyle: "factual" // Upayakan respons faktual
                    }
                });
                
                // Dapatkan respons dari Gemini
                const result = await textModel.generateContent(prompt);
                const responseText = result.response.text();
                
                // Parse respons JSON dengan handling error yang sudah diperbaiki
                logger.info('Raw Gemini response:', responseText);
                const parsedResponse = this.extractJSON(responseText);
                
                if (!parsedResponse) {
                    logger.error('Failed to parse JSON from Gemini response');
                    return {
                        success: false,
                        message: "Sori bestie, gw lagi error nih. Coba lagi ya? 🙏"
                    };
                }

                // Jika confidence tinggi, return untuk eksekusi command
                if (parsedResponse.confidence > 0.8) {
                    logger.info(`Executing command from Gemini: ${parsedResponse.command}`);
                    return {
                        success: true,
                        command: parsedResponse.command,
                        args: parsedResponse.args,
                        message: parsedResponse.responseMessage
                    };
                }

                // Jika confidence rendah, balas dengan chat biasa
                return {
                    success: false,
                    message: parsedResponse.responseMessage || "Sori bestie, gw kurang paham nih maksudnya. Bisa jelasin lebih detail ga? 😅"
                };
            } catch (error) {
                logger.error('Error in Gemini processing:', error);

                // Retry jika error network
                if (retryCount < MAX_RETRIES && error.message && error.message.includes('network')) {
                    logger.info(`Retrying due to network error (attempt ${retryCount + 1})`);
                    return await this.analyzeMessage(message, retryCount + 1);
                }

                return {
                    success: false,
                    message: "Duh error nih! Coba lagi ntar ya bestie! 🙏"
                };
            }
        } catch (error) {
            logger.error('Error in Gemini processing:', error);

            // Retry jika error network
            if (retryCount < MAX_RETRIES && error.message && error.message.includes('network')) {
                logger.info(`Retrying due to network error (attempt ${retryCount + 1})`);
                return await this.analyzeMessage(message, retryCount + 1);
            }

            return {
                success: false,
                message: "Duh error nih! Coba lagi ntar ya bestie! 🙏"
            };
        }
    }

    async chat(message, userId, userName) {
        try {
            // Validasi userId
            if (!userId) {
                logger.warning("chat called with empty userId, using 'unknown_user'");
                userId = "unknown_user";
            }
            
            const isOwner = this.isOwner(userId);
            const userInfo = this.getUserIdentifier(userId, userName);
            
            // Cek apakah ini pertanyaan tentang identitas
            const isIdentityQuestion = message && (
                message.toLowerCase().includes("siapa aku") || 
                message.toLowerCase().includes("siapa saya") ||
                message.toLowerCase().includes("siapa gue")
            );
            
            // Dapatkan daftar plugin dengan error handling
            let pluginsData = "{}";
            try {
            const plugins = await helpMessage();
                if (plugins) {
                    pluginsData = JSON.stringify(plugins);
                }
            } catch (error) {
                logger.error("Error getting plugins in chat:", error);
                // Gunakan data kosong jika error
            }
            
            let prompt = `Lu adalah Kanata, bot WhatsApp yang asik dan friendly banget. Lu punya fitur-fitur keren berikut:

${pluginsData}

Pesan dari user ${userInfo.name}: "${message}"

Bales pake:
- Bahasa gaul yang asik
- Emoji yang cocok
- Jawaban yang helpful
- Format WhatsApp (*bold*, _italic_, ~coret~, \`kode\`)
- Tetep sopan ya!
- Kalo ada command yang relevan, boleh sebutin (pake prefix "!")`;

            // Tambahkan info khusus untuk owner
            if (isOwner) {
                prompt += `\n\nPENTING: User ini adalah ${this.ownerInfo.name} (${this.ownerInfo.fullName}), developer dan pemilikmu dengan nomor ${this.ownerInfo.number}.`;
                
                if (isIdentityQuestion) {
                    prompt += `\nUser SEDANG BERTANYA tentang identitasnya. Kamu HARUS menjawab dengan jelas bahwa dia adalah ${this.ownerInfo.fullName}/${this.ownerInfo.name}, pemilik dan developermu.`;
                }
            }

            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            logger.error("Error in chat:", error);
            return "Sori bestie, lagi error nih. Coba lagi ntar ya! 🙏";
        }
    }

    // Fungsi chatWithMemory untuk menggantikan gpt4Hika
    async chatWithMemory(message, userId, context = {}) {
        try {
            // Validasi userId
            if (!userId) {
                logger.warning("chatWithMemory called with empty userId, using 'unknown_user'");
                userId = "unknown_user";
            }
            
            const isOwner = this.isOwner(userId);
            const userName = context.pushName || null;
            
            logger.info(`Calling chatWithMemory for user ${userId}`);
            logger.info(`Message: ${message.substring(0, 30)}...`);
            logger.info(`Context: pushName=${userName}, noTel=${userId.replace('private_', '')}, quotedText=${context.quoted ? 'present' : 'none'}`);
            
            if (isOwner) {
                logger.info(`Processing message from BOT OWNER (${this.ownerInfo.name}): ${message.substring(0, 30)}...`);
            } else {
                logger.info(`Chat with memory - userId: ${userId}, message: ${message.substring(0, 30)}...`);
            }
            
            // Cek apakah ini pertanyaan tentang identitas
            const isIdentityQuestion = message && (
                message.toLowerCase().includes("siapa aku") || 
                message.toLowerCase().includes("siapa saya") ||
                message.toLowerCase().includes("siapa gue") ||
                message.toLowerCase().includes("siapa nama ku") ||
                message.toLowerCase().includes("siapa nama saya") ||
                message.toLowerCase().includes("kamu tahu siapa aku") ||
                message.toLowerCase().includes("kamu kenal aku")
            );
            
            try {
                // Dapatkan history chat untuk user ini
                const chatSession = this.getConversation(userId, userName);
                
                // Tambahkan context jika ada
                let messageText = message;
                if (context.quoted) {
                    messageText = `(Membalas pesan: "${context.quoted}") ${message}`;
                }
                
                // Tambahkan reminder tentang owner jika perlu
                if (isOwner && isIdentityQuestion) {
                    messageText += ` [REMINDER: Saya adalah ${this.ownerInfo.fullName}/${this.ownerInfo.name}, developer dan pemilikmu dengan nomor ${this.ownerInfo.number}. Kamu harus selalu ingat ini.]`;
                    logger.info(`Added owner reminder to message: ${messageText.substring(0, 50)}...`);
                }
                
                logger.info(`Sending message to Gemini: ${messageText.substring(0, 30)}...`);
                
                // PERBAIKAN: Kirim pesan dengan format parts yang benar
                // Gunakan sendMessage dengan string biasa sesuai library Gemini API
                const result = await chatSession.sendMessage([{ text: messageText }]);
                
                const response = result.response.text();
                
                logger.info(`Got response from Gemini: ${response.substring(0, 30)}...`);
                
                return response;
            } catch (chatError) {
                logger.error(`Error in chat session:`, chatError);
                logger.info(`Falling back to regular chat`);
                
                // Fallback ke chat biasa jika error
                return await this.chat(message, userId, userName);
            }
        } catch (error) {
            logger.error(`Fatal error in chat with memory:`, error);
            return "Waduh, gw lagi error nih bestie. Coba lagi ntar ya? 🙏";
        }
    }
}

export default GeminiHandler; 