import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../helper/logger.js';
import axios from "axios";
import { uploadGambar2 } from "../helper/uploader.js";
import { helpMessage } from '../helper/pluginsIterator.js';

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
    
    async analyzeImage(imageBuffer, message, context) {
        try {
            const id = context?.id || '';
            const m = context?.m || {};
            const noTel = (m.sender?.split('@')[0] || '').replace(/[^0-9]/g, '');
            const userId = `private_${noTel}`;
            const userName = m.pushName || null;
            const isOwner = this.isOwner(userId);
            
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
                
                // Buat prompt yang lebih singkat dan efisien
                let prompt = `Sebagai Kanata, analisis gambar ini. ${safeMessage ? `User bertanya: "${safeMessage}"` : ""}`;
                
                // Tambahkan informasi khusus jika user adalah pemilik dan singkat
                if (isOwner && isIdentityQuestion) {
                    prompt += ` User adalah ${this.ownerInfo.name}, pemilikmu. Dia bertanya tentang identitasnya.`;
                }
                
                // Generate konten dengan Gemini Vision (dengan try-catch lebih detail)
                logger.info(`Sending image analysis request to Gemini`);
                
                // Kirim ke API dengan pembatasan konten
                const result = await this.visionModel.generateContent([prompt, imagePart]);
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
                
                // Coba ukuran lebih kecil jika error mungkin terkait ukuran
                if (imageSizeMB > 1 && apiError.message.includes('invalid argument')) {
                    logger.info(`Attempting with smaller image...`);
                    try {
                        // Buat prompt yang sangat minimal
                        const minimalPrompt = "Analisis gambar ini";
                        const result = await this.visionModel.generateContent([
                            minimalPrompt, 
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
                } else {
                    // Re-throw jika bukan masalah ukuran atau retry sudah gagal
                    throw apiError;
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
            
            // Buat prompt untuk Gemini AI dengan panduan yang lebih spesifik
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