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
        this.visionModel = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite",
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 1024
            }
        });
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
                // Coba ekstrak JSON dari teks
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (err) {
                logger.error('Error extracting JSON:', err);
            }
            return null;
        }
    }

    // Konversi buffer gambar menjadi format yang dibutuhkan Gemini
    bufferToGenerativePart(buffer, mimeType = "image/jpeg") {
        try {
            if (!buffer || !(buffer instanceof Buffer)) {
                throw new Error("Invalid buffer provided");
            }

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


    async analyzeImage(imageBuffer, message, context) {
        try {
            // Skip jika bukan format gambar
            if (!imageBuffer || !(imageBuffer instanceof Buffer)) {
                return {
                    success: false,
                    message: "Format file tidak didukung",
                    isImageProcess: true
                };
            }
            console.log(message)
            // Skip jika tidak ada caption
            if (!message) {
                return {
                    success: false,
                    message: "Mohon sertakan caption/pertanyaan",
                    isImageProcess: true
                };
            }


            // Validasi context dan propertinya
            const id = context.id || '';
            const m = context.m || {};
            const noTel = (m.sender?.split('@')[0] || '').replace(/[^0-9]/g, '');
            const userId = `private_${noTel}`;
            const userName = m.pushName || null;

            // Verifikasi ukuran gambar
            const imageSizeMB = imageBuffer.length / (1024 * 1024);
            if (imageSizeMB > 4) {
                logger.error(`Image too large: ${imageSizeMB.toFixed(2)}MB, exceeds 4MB limit`);
                return {
                    success: false,
                    message: "Gambar terlalu gede nih bestie! Gemini cuma bisa terima gambar maksimal 4MB. Coba kompres dulu ya? 🙏",
                    isImageProcess: true
                };
            }

            const isOwner = this.isOwner(userId);

            if (isOwner) {
                logger.info(`Processing image from BOT OWNER (${this.ownerInfo?.name || 'Unknown'}): ${message?.substring(0, 30) || "no message"}...`);
            } else {
                logger.info(`Processing image with message: ${message?.substring(0, 30) || "no message"}...`);
            }

            logger.info(`Image size: ${imageSizeMB.toFixed(2)}MB`);


            const safeMessage = message.length > 500 ? message.substring(0, 500) + "..." : message;

            try {
                const imagePart = this.bufferToGenerativePart(imageBuffer);


                let prompt = `analisis gambar ini. ${userName} bertanya: "${safeMessage}"`;

                if (isOwner && this.ownerInfo) {
                    prompt += ` User adalah ${this.ownerInfo.name}, pemilikmu. Dia bertanya ${safeMessage}.`;
                }

                logger.info(`Sending image analysis request to Gemini 1.5 Pro`);

                const result = await this.visionModel.generateContent([
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

                try {
                    logger.info(`Attempting with alternative model and minimal prompt...`);

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
                    throw retryError;
                }
            }
        } catch (error) {
            logger.error(`Fatal error in image analysis: ${error.message}`, error);

            let errorMessage = "Waduh, gw gagal analisis gambarnya nih bestie! ";

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

    // Fungsi untuk mengecek tipe media - pastikan ini diperbarui
    isAudioMessage(context) {
        try {
            // Cek flag khusus
            if (context && context.isAudio === true) {
                return true;
            }

            if (!context || !context.m) return false;

            const m = context.m;
            // Cek dari tipe pesan
            const message = m.message || {};

            // Cek berbagai cara audio bisa muncul di pesan WhatsApp
            if (message.audioMessage) return true;
            if (message.pttMessage) return true;

            // Cek juga dari context type dan mimetype
            const type = context.type || '';
            const mimetype = context.mimetype || '';

            return (
                type.includes('audio') ||
                type.includes('ptt') ||
                mimetype.includes('audio') ||
                mimetype.includes('ogg') ||
                mimetype.includes('opus') ||
                mimetype.includes('mp3') ||
                mimetype.includes('wav')
            );
        } catch (error) {
            logger.error(`Error checking audio message: ${error.message}`);
            return false;
        }
    }

    isImageMessage(context) {
        try {
            if (!context || !context.m) return false;

            const m = context.m;
            const type = Object.keys(m.message || {})[0];

            // Cek tipe pesan gambar
            return (
                type === 'imageMessage' ||
                (context.mimetype && (
                    context.mimetype.includes('image') ||
                    context.mimetype.includes('jpg') ||
                    context.mimetype.includes('jpeg') ||
                    context.mimetype.includes('png')
                ))
            );
        } catch (error) {
            logger.error(`Error checking image message type: ${error.message}`);
            return false;
        }
    }

    // Perbarui juga fungsi processMedia untuk menggunakan fungsi-fungsi baru
    async processMedia(mediaBuffer, message, context) {
        try {
            // Tambahkan logging untuk debugging
            logger.info(`ProcessMedia called with: context.type=${context.type}, context.mimetype=${context.mimetype || 'unknown'}`);
            logger.info(`Context flags: isAudio=${!!context.isAudio}, isImage=${!!context.isImage}`);

            // Cek tipe media berdasarkan flag khusus dulu
            if (context.isAudio === true) {
                logger.info(`Processing as audio (explicit flag)`);
                return await this.analyzeAudio(mediaBuffer, message, context);
            }

            if (context.isImage === true) {
                logger.info(`Processing as image (explicit flag)`);
                return await this.analyzeImage(mediaBuffer, message, context);
            }

            // Cek menggunakan fungsi helper
            if (this.isAudioMessage(context)) {
                logger.info(`Detected as audio/voice note`);
                return await this.analyzeAudio(mediaBuffer, message, context);
            } else if (this.isImageMessage(context)) {
                logger.info(`Detected as image`);
                return await this.analyzeImage(mediaBuffer, message, context);
            } else {
                // Jika tipe tidak terdeteksi, coba deteksi dari MIME type
                const mimetype = context.mimetype || '';

                if (mimetype.includes('audio') || mimetype.includes('ogg') || mimetype.includes('opus')) {
                    logger.info(`Detected as audio from mimetype`);
                    return await this.analyzeAudio(mediaBuffer, message, context);
                } else if (mimetype.includes('image')) {
                    logger.info(`Detected as image from mimetype`);
                    return await this.analyzeImage(mediaBuffer, message, context);
                } else {
                    // Default fallback
                    logger.warn(`Unknown media type, defaulting to media error response`);
                    return {
                        success: false,
                        message: "Maaf bestie, gw gak bisa proses media jenis ini. Coba kirim format lain ya? 🙏",
                        isUnknownMedia: true
                    };
                }
            }
        } catch (error) {
            logger.error(`Error in processMedia: ${error.message}`);
            return {
                success: false,
                message: "Waduh error nih! Gw gak bisa proses media ini. Coba lagi ntar ya bestie! 🙏",
                isProcessError: true
            };
        }
    }

    // Fungsi untuk analisis voice note/audio
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

            // Cek ukuran audio
            if (audioBuffer.length > 10 * 1024 * 1024) {
                return {
                    success: false,
                    message: "Voice note/audio-nya kepanjangan nih bestie! Maksimal 10MB ya, coba kirim yang lebih pendek 🙏",
                    isAudioProcess: true
                };
            }

            // Konversi audio ke base64
            const base64Audio = audioBuffer.toString('base64');

            // Analisis pesan teks yang menyertai audio
            let textPrompt = "";
            if (message && message.trim()) {
                // Cek apakah ini perintah
                if (message.toLowerCase().startsWith('!') || message.toLowerCase().startsWith('.')) {
                    // Ambil command dan parameter
                    const [cmd, ...args] = message.slice(1).split(' ');
                    const cmdLower = cmd.toLowerCase();

                    // Dapatkan daftar plugin
                    let plugins = null;
                    try {
                        plugins = await helpMessage();
                    } catch (error) {
                        logger.warning("helpMessage returned null or undefined");
                        plugins = { "basic": DEFAULT_COMMANDS };
                    }

                    // Cari command yang cocok di semua kategori
                    let matchedCommand = null;
                    let matchedCategory = null;

                    Object.entries(plugins).forEach(([category, items]) => {
                        if (Array.isArray(items)) {
                            items.forEach(item => {
                                if (item && (item.handler === cmdLower || item.command === cmdLower)) {
                                    matchedCommand = item;
                                    matchedCategory = category;
                                }
                            });
                        }
                    });

                    if (matchedCommand) {
                        textPrompt = `Ini adalah perintah "${cmdLower}" dari kategori "${matchedCategory}". 
                            Deskripsi: ${matchedCommand.description || 'Tidak ada deskripsi'}
                            Parameter yang diberikan: ${args.join(' ')}
                            
                            Tolong dengarkan voice note ini dan berikan:
                            1. Transkripsi lengkap
                            2. Analisis apakah isi voice note sesuai dengan command yang diminta
                            3. Parameter yang diperlukan dari voice note untuk menjalankan command`;
                    } else {
                        textPrompt = `Ini adalah perintah: "${message}" tapi command tidak ditemukan dalam daftar plugin. 
                            Tolong dengarkan voice note dan berikan saran command yang mungkin sesuai.`;
                    }
                }
                // Cek apakah ini permintaan informasi
                else if (message.toLowerCase().includes('apa') ||
                    message.toLowerCase().includes('bagaimana') ||
                    message.toLowerCase().includes('mengapa') ||
                    message.toLowerCase().includes('siapa')) {
                    textPrompt = `User menanyakan informasi: "${message}". Tolong berikan informasi yang relevan dari audio ini.`;
                }
                // Default analisis
                else {
                    textPrompt = `Tolong dengarkan voice note/audio ini dan berikan: \n1. Transkripsi lengkap \n2. Analisis konteks dan maksud \n3. Respon yang sesuai`;
                }
            } else {
                textPrompt = "Tolong transkripsi dan analisis voice note/audio ini secara lengkap.";
            }

            // Tambah konteks owner jika perlu
            if (isOwner) {
                textPrompt += `\nCatatan: User adalah ${this.ownerInfo.name}, pemilikmu.`;
            }

            try {
                const result = await this.audioModel.generateContent([
                    {
                        inlineData: {
                            mimeType: "audio/mp3",
                            data: base64Audio
                        }
                    },
                    { text: textPrompt }
                ]);

                const responseText = result.response.text();
                logger.info(`Got response from Gemini Audio: ${responseText.substring(0, 50)}...`);

                return {
                    success: true,
                    message: responseText,
                    isAudioProcess: true
                };
            } catch (apiError) {
                // Retry dengan format alternatif jika gagal
                if (apiError.message.includes('invalid argument')) {
                    logger.info(`Retrying with alternative format...`);
                    const retryResult = await this.audioModel.generateContent([
                        {
                            inlineData: {
                                mimeType: "audio/mpeg",
                                data: base64Audio
                            }
                        },
                        { text: textPrompt }
                    ]);

                    return {
                        success: true,
                        message: retryResult.response.text(),
                        isAudioProcess: true
                    };
                }
                throw apiError;
            }

        } catch (error) {
            logger.error(`Error analyzing audio: ${error.message}`);
            return {
                success: false,
                message: "Waduh, gw gagal prosesing voice note ini nih bestie! Coba kirim voice note yang lebih jelas atau yang pendek aja ya? 🙏",
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
            const plugins = await helpMessage();
            const functionDescriptions = [];

            // Format daftar fungsi untuk prompt
            const formattedPlugins = Object.entries(plugins)
                .map(([category, items]) => {
                    const commands = items.map(item => ({
                        command: item.handler,
                        description: item.description,
                        category: category
                    }));
                    return {
                        category,
                        commands
                    };
                });

            // Buat prompt untuk Gemini AI
            const prompt = `Lu adalah Kanata, bot WhatsApp yang asik dan friendly banget. Lu punya fitur-fitur keren yang dikelompokin gini:

${JSON.stringify(formattedPlugins, null, 2)}

Pesan dari : "${message}"

Tugas lu:
1. Analisis pesan dan tentuin:
   - Command apa yang paling cocok dari daftar yang ada
   - Parameter apa yang dibutuhin sesuai command-nya
   - Kalo gaada command yang cocok, balikin confidence rendah

2. Kalo pesan itu:
   - Cuma nanya/ngobrol -> confidence rendah
   - Gaada parameter jelas -> confidence rendah
   - Gajelas maksudnya -> confidence rendah

3. Kalo mau jalanin command:
   - Pastiin user beneran mau pake command itu
   - Cek parameter udah lengkap
   - Kalo ragu, mending confidence rendah

4. Khusus untuk translate:
   - Kalo ada kata kunci seperti "translate", "terjemahkan", "artikan"
   - Format parameter: <kode_bahasa> <teks>
   - Contoh: "translate ke jepang: selamat pagi" -> command: tr, args: "ja selamat pagi"
   - Kode bahasa: en (Inggris), ja (Jepang), ko (Korea), ar (Arab), dll

5. Balikin response dalam format JSON:
{
    "command": "nama_command",
    "args": "parameter yang dibutuhin",
    "confidence": 0.0-1.0,
    "responseMessage": "Pesan buat user pake bahasa gaul"
}

PENTING:
- Confidence harus tinggi (>0.8) kalo mau jalanin command!
- Pake bahasa gaul yang asik
- Tetep sopan & helpful
- Pake emoji yang cocok
- Command yang dipilih HARUS ada di daftar yang dikasih
- HARUS BALIKIN RESPONSE DALAM FORMAT JSON YANG VALID, JANGAN ADA TEKS TAMBAHAN DI LUAR JSON`;

            // Dapatkan respons dari Gemini
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();

            // Parse respons JSON dengan handling error
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
            if (retryCount < MAX_RETRIES && error.message.includes('network')) {
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
            let pluginsData = {};
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
                userId = `private_${noTel}`;
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