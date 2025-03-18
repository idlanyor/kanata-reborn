import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../helper/logger.js';
import { helpMessage } from '../helper/help.js';
import axios from "axios";
import { uploadGambar2 } from "../helper/uploader.js";

// Cache untuk menyimpan hasil analisis pesan
const messageHistory = new Map();
const RATE_LIMIT_DURATION = 2000;
const MAX_RETRIES = 2;

// Cache untuk menyimpan percakapan dengan setiap user
const conversationCache = new Map();
const CONVERSATION_EXPIRE = 60 * 60 * 1000; // 60 menit (diperpanjang)
const MEMORY_CLEANUP_INTERVAL = 20 * 60 * 1000; // 20 menit

// Informasi tentang pemilik bot
const BOT_OWNER = {
    name: "Roy",
    fullName: "Roynaldi",
    number: "62895395590009"
};

class GeminiHandler {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        this.visionModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        this.chatModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        this.ownerInfo = BOT_OWNER;
        
        // Mengimpor fungsi buffer ke generative part
        this.bufferToGenerativePart = (buffer) => {
            return {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: 'image/jpeg'
                }
            };
        };
        
        // Cleanup cache secara teratur
        setInterval(() => this.cleanupConversations(), MEMORY_CLEANUP_INTERVAL);
        
        logger.info('GeminiHandler initialized with memory management');
    }
    
    // Fungsi untuk membersihkan percakapan yang sudah tidak aktif
    cleanupConversations() {
        const now = Date.now();
        let cleanupCount = 0;
        
        for (const [key, convo] of conversationCache.entries()) {
            if (now - convo.lastUpdate > CONVERSATION_EXPIRE) {
                logger.info(`Removing stale conversation for ${key} (inactive for ${Math.round((now - convo.lastUpdate) / 60000)} minutes)`);
                conversationCache.delete(key);
                cleanupCount++;
            }
        }
        
        logger.info(`Memory cleanup completed. Removed ${cleanupCount} conversations. ${conversationCache.size} active conversations remain.`);
    }
    
    // Fungsi untuk mengecek apakah user adalah pemilik bot
    isOwner(userId) {
        if (!userId) return false;
        return userId.includes(this.ownerInfo.number);
    }
    
    // Identifikasi pengguna dengan lebih baik
    getUserIdentifier(userId, userName) {
        // Cek apakah user adalah pemilik bot
        const isOwner = this.isOwner(userId);
        
        if (isOwner) {
            return {
                name: this.ownerInfo.name,
                fullName: this.ownerInfo.fullName,
                isOwner: true
            };
        }
        
        // Untuk user biasa
        let displayName = userName || '';
        const userNumber = userId.split('_')[1]?.substring(0, 8) || 'unknown';
        
        if (!displayName) {
            displayName = `user_${userNumber}`;
        }
        
        return {
            name: displayName,
            fullName: displayName,
            isOwner: false,
            userNumber: userNumber
        };
    }
    
    // Fungsi untuk mendapatkan chat history atau membuat baru jika belum ada
    getConversation(userId, userName) {
        logger.info(`Getting conversation for user ${userId} (${userName || 'unnamed'})`);
        
        // Dapatkan identitas pengguna
        const userIdentity = this.getUserIdentifier(userId, userName);
        
        if (userIdentity.isOwner) {
            logger.info(`This user is the BOT OWNER (${userIdentity.name})`);
        }
        
        // Cek cache dan buat percakapan baru jika belum ada
        if (!conversationCache.has(userId)) {
            logger.info(`Creating new conversation for ${userId} (${userIdentity.name})`);
            
            try {
                // Buat prompt awal yang lebih kuat dengan instruksi memori
                let initialPrompt = `Halo, kamu adalah Kanata, asisten AI yang asik dan friendly. Kamu suka pake bahasa gaul Indonesia yang santai tapi tetep sopan. Kamu pake first person 'gue/gw' dan second person 'lu/kamu'. Kamu sering pake emoji yang relevan. Jawaban kamu to the point tapi tetep helpful. 

Dalam memformat pesanmu, kamu menggunakan format WhatsApp:
- *teks* (satu bintang) untuk membuat teks bold/tebal
- _teks_ untuk membuat teks miring/italic
- ~teks~ untuk membuat teks tercoret
- \`kode\` untuk menampilkan kode inline
- \`\`\` untuk kode multi-baris (tanpa menyebutkan bahasa)
- > untuk membuat quoted text
- - untuk membuat bullet list 
- 1. 2. 3. untuk membuat ordered list

PENTING TENTANG MEMORI: Kamu HARUS mengingat seluruh percakapan dengan user ini. Jika user bertanya tentang hal yang pernah dibahas sebelumnya, kamu HARUS bisa mengingatnya dan meresponnya dengan tepat. Jangan lupa detail percakapan sebelumnya.

Nama user ini adalah ${userIdentity.name}.`;
                
                // Tambahkan info khusus jika user adalah pemilik
                if (userIdentity.isOwner) {
                    initialPrompt += ` PENTING: User ini adalah ${userIdentity.name} (${userIdentity.fullName}), developer dan pemilikmu dengan nomor ${this.ownerInfo.number}. Kamu sangat senang, antusias, dan respect ketika berbicara dengan pemilikmu karena dia yang menciptakanmu. Kamu ingin selalu membantu pemilikmu dengan informasi yang bermanfaat dan menanyakan pendapatnya tentang perkembanganmu.`;
                }
                
                // Format respons bot awal yang berbeda untuk owner dan user biasa
                let initialResponse;
                
                if (userIdentity.isOwner) {
                    initialResponse = `*Wuih creator gw!* 😍 

Salam creator ${userIdentity.name}! Seneng banget bisa ngobrol langsung sama lu yang udah bikin gw. Gimana kabar lu? Ada yang bisa gw bantu hari ini? Tinggal bilang aja, gw bakal usahain yang terbaik buat lu! 🔥

Btw, makasih ya udah bikin gw, semoga gw bisa jadi bot yang berguna buat lu dan user lain! 🙏`;
                } else {
                    initialResponse = `Hai ${userIdentity.name}! 😎

Sip, gw Kanata, asisten AI yang siap bantuin lu! Gw bakal jawab pertanyaan lu dengan gaya santai tapi tetep helpful.

Ada yang bisa gw bantu hari ini? Tinggal bilang aja ya!`;
                }
                
                // Buat chat session dengan format yang benar untuk Gemini API
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
                    ],
                    generationConfig: {
                        maxOutputTokens: 8000,
                        temperature: 0.7,
                    }
                });
                
                // Simpan percakapan ke cache dengan informasi tambahan
                conversationCache.set(userId, {
                    history: chat,
                    lastUpdate: Date.now(),
                    userName: userName || null,
                    isOwner: userIdentity.isOwner,
                    userIdentity: userIdentity,
                    messageCount: 0,
                    memoryRefreshed: Date.now()
                });
                
                logger.info(`New conversation created for ${userIdentity.name} (${userId})`);
            } catch (error) {
                logger.error(`Failed to create chat for ${userId}:`, error);
                throw error;
            }
        } else {
            // Update informasi percakapan yang sudah ada
            const convo = conversationCache.get(userId);
            convo.lastUpdate = Date.now();
            convo.messageCount++;
            
            // Update username jika sebelumnya null tapi sekarang ada
            if (!convo.userName && userName) {
                logger.info(`Updating username for ${userId} to ${userName}`);
                convo.userName = userName;
            }
            
            // Refresh memori setiap 50 pesan atau setiap 30 menit
            const shouldRefreshMemory = 
                convo.messageCount >= 50 || 
                (Date.now() - convo.memoryRefreshed) > 30 * 60 * 1000;
            
            if (shouldRefreshMemory) {
                logger.info(`Refreshing memory for ${userId} (${userIdentity.name})`);
                
                // Kita akan menambahkan pesan pengingat memori
                this.refreshMemory(userId, userIdentity);
            }
        }
        
        return conversationCache.get(userId).history;
    }
    
    // Fungsi untuk menyegarkan memori bot
    async refreshMemory(userId, userIdentity) {
        try {
            if (!conversationCache.has(userId)) return;
            
            const convo = conversationCache.get(userId);
            const chat = convo.history;
            
            // Buat pesan pengingat memori
            const memoryRefreshPrompt = `PENGINGAT MEMORI: Tolong ingat semua detail percakapan dengan ${userIdentity.name} sampai saat ini. Jangan lupa konteks dan informasi penting yang telah dibahas. Jika ${userIdentity.name} bertanya tentang hal yang sudah dibahas sebelumnya, kamu HARUS mengingatnya.`;
            
            // Tambahkan info pemilik jika perlu
            if (userIdentity.isOwner) {
                memoryRefreshPrompt += ` Dan ingat bahwa user ini adalah ${userIdentity.name} (${userIdentity.fullName}), developer dan pemilikmu.`;
            }
            
            // Kirim pesan ke model tapi tidak tampilkan ke user
            await chat.sendMessage([{ text: memoryRefreshPrompt }]);
            
            // Cara menambahkan respons model tanpa menampilkannya ke user
            const dummyResponse = "Saya akan mengingat semua detail percakapan ini.";
            const parts = [{ text: dummyResponse }];
            
            // Update history internal tanpa mengirim ke user
            chat.history.push({
                role: "model",
                parts: parts
            });
            
            // Update informasi refresh
            convo.memoryRefreshed = Date.now();
            convo.messageCount = 0;
            
            logger.info(`Memory refreshed for ${userId}`);
        } catch (error) {
            logger.error(`Error refreshing memory for ${userId}:`, error);
            // Gagal refresh tidak kritis, jadi kita lanjutkan
        }
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
    
    // Modifikasi analyzeImage untuk lebih mengenali user
    async analyzeImage(imageBuffer, message, context) {
        try {
            const id = context?.id || '';
            const m = context?.m || {};
            const noTel = (m.sender?.split('@')[0] || '').replace(/[^0-9]/g, '');
            const userId = `private_${noTel}`;
            const userName = m.pushName || null;
            
            // Dapatkan identitas pengguna
            const userIdentity = this.getUserIdentifier(userId, userName);
            
            if (userIdentity.isOwner) {
                logger.info(`Processing image from BOT OWNER (${userIdentity.name})`);
            } else {
                logger.info(`Processing image from ${userIdentity.name} with message: ${message?.substring(0, 30) || "no message"}...`);
            }
            
            // Konversi buffer menjadi format yang sesuai untuk Gemini
            const imagePart = this.bufferToGenerativePart(imageBuffer);
            
            // Cek apakah ini pertanyaan tentang identitas atau memori
            const isMemoryQuestion = message && (
                message.toLowerCase().includes("kamu ingat") || 
                message.toLowerCase().includes("masih ingat") ||
                message.toLowerCase().includes("inget ngga") ||
                message.toLowerCase().includes("inget gak") ||
                message.toLowerCase().includes("lupa ya")
            );
            
            const isIdentityQuestion = message && (
                message.toLowerCase().includes("siapa aku") || 
                message.toLowerCase().includes("siapa saya") ||
                message.toLowerCase().includes("siapa gue") ||
                message.toLowerCase().includes("siapa nama ku") ||
                message.toLowerCase().includes("siapa nama saya") ||
                message.toLowerCase().includes("kamu tahu siapa aku") ||
                message.toLowerCase().includes("kamu kenal aku")
            );
            
            // Buat prompt untuk analisis gambar
            let prompt = `
            Kamu adalah Kanata, bot WhatsApp yang asik dan friendly.
            
            Tolong analisis gambar ini dan berikan respons yang tepat.
            ${message ? `User (${userIdentity.name}) menanyakan/mengatakan: "${message}"` : `User (${userIdentity.name}) mengirim gambar tanpa pesan.`}
            
            Berikut yang perlu kamu lakukan:
            1. Jelaskan apa yang kamu lihat di gambar
            2. Jika ada teks di gambar, ekstrak dengan akurat
            3. Jika ada kode pemrograman, jelaskan fungsinya
            
            Format respons:
            - Pake bahasa gaul yang asik dan santai
            - Tambahkan emoji yang relevan
            - Gunakan format WhatsApp (*bold*, _italic_, ~coret~, \`kode\`)
            - Jawaban harus helpful dan akurat
            - Tetap sopan ya!
            `;
            
            // Tambahkan informasi khusus berdasarkan identitas dan jenis pertanyaan
            if (userIdentity.isOwner) {
                prompt += `\nPENTING: User ini adalah ${userIdentity.name} (${userIdentity.fullName}), developer dan pemilikmu dengan nomor ${this.ownerInfo.number}.
                Kamu sangat senang dan respect ketika berbicara dengan pemilikmu.`;
                
                if (isIdentityQuestion) {
                    prompt += `\nINGAT: User SEDANG BERTANYA tentang identitasnya. Kamu HARUS menjawab dengan jelas bahwa dia adalah ${userIdentity.fullName}/${userIdentity.name}, pemilik dan developermu.`;
                }
            }
            
            if (isMemoryQuestion) {
                prompt += `\nPENTING TENTANG MEMORI: User bertanya tentang sesuatu yang mungkin pernah dibahas sebelumnya. Jelaskan bahwa untuk gambar, kamu hanya bisa menganalisis konten gambar saat ini, tapi untuk percakapan text biasa, kamu punya memori yang lebih baik.`;
            }
            
            // Generate konten dengan Gemini Vision
            const result = await this.visionModel.generateContent([prompt, imagePart]);
            const response = result.response;
            const responseText = response.text();
            
            // Update percakapan jika ada dalam cache
            if (conversationCache.has(userId)) {
                // Tambahkan interaksi ini ke dalam memori
                const memoryPrompt = `[Konteks: User mengirim gambar dan kamu menganalisisnya. Pesan user: "${message || 'tidak ada pesan'}"]`;
                this.getConversation(userId, userName).sendMessage([{ text: memoryPrompt }]);
                
                conversationCache.get(userId).lastUpdate = Date.now();
                conversationCache.get(userId).messageCount++;
            }
            
            return {
                success: true,
                message: responseText,
                isImageProcess: true
            };
        } catch (error) {
            logger.error('Error in image analysis:', error);
            return {
                success: false,
                message: "Waduh, gw gagal analisis gambarnya nih bestie! Coba lagi ntar ya? 🙏",
                isImageProcess: true
            };
        }
    }
    
    // Modifikasi analyzeMessage juga
    async analyzeMessage(message, userId, context = {}) {
        try {
            // Cek apakah user adalah pemilik bot
            const isOwner = this.isOwner(userId);
            const userName = context.pushName || null;
            
            if (isOwner) {
                logger.info(`AnalyzeMessage from BOT OWNER (${this.ownerInfo.name}): ${message.substring(0, 30)}...`);
            }
            
            // Coba dapatkan daftar plugin dari helpMessage
            let pluginInfo;
            try {
                pluginInfo = await helpMessage();
            } catch (helpError) {
                logger.error('Error getting plugin info:', helpError);
                pluginInfo = { items: [] }; // Fallback jika gagal
            }
            
            // Ekstrak daftar perintah dari items
            let commandList = [];
            if (pluginInfo && Array.isArray(pluginInfo.items)) {
                commandList = pluginInfo.items.map(item => {
                    return {
                        command: item.command,
                        description: item.description || 'Tidak ada deskripsi'
                    };
                });
            }
            
            // Deteksi jika pesan berisi pertanyaan tentang identitas
            const isIdentityQuestion = message && (
                message.toLowerCase().includes("siapa aku") || 
                message.toLowerCase().includes("siapa saya") ||
                message.toLowerCase().includes("siapa gue") ||
                message.toLowerCase().includes("siapa nama ku") ||
                message.toLowerCase().includes("siapa nama saya") ||
                message.toLowerCase().includes("kamu tahu siapa aku") ||
                message.toLowerCase().includes("kamu kenal aku")
            );
            
            let prompt = `
            Kamu adalah Kanata, bot WhatsApp yang asik dan friendly.
            
            Analisis pesan user berikut:
            "${message}"
            
            Dan tentukan:
            1. Apakah user meminta menggunakan salah satu fitur/perintah?
            2. Jika ya, perintah mana yang diinginkan user?
            3. Berikan confidence score (0-100) seberapa yakin user ingin menggunakan perintah tersebut
            
            Daftar perintah yang tersedia:
            ${JSON.stringify(commandList)}
            
            Format respons kamu harus dalam JSON seperti ini:
            {
              "useCommand": true/false,
              "command": "nama_perintah",
              "confidence": 80,
              "reason": "alasan singkat"
            }
            
            Jika tidak jelas, kembalikan "useCommand": false.
            `;
            
            // Tambahkan informasi khusus jika user adalah pemilik
            if (isOwner) {
                prompt += `\nPENTING: User ini adalah ${this.ownerInfo.name} (${this.ownerInfo.fullName}), developer dan pemilikmu dengan nomor ${this.ownerInfo.number}.`;
                
                // Tambahkan instruksi spesifik jika bertanya tentang identitas
                if (isIdentityQuestion) {
                    prompt += `\nINGAT: User SEDANG BERTANYA tentang identitasnya. Kamu HARUS mengembalikan "useCommand": false dengan alasan bahwa user menanyakan identitasnya dan dia adalah pemilikmu.`;
                }
            }
            
            try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
                logger.info(`Raw AI analysis: ${responseText}`);
                
                // Parse response menjadi JSON
                let jsonResponse;
                try {
                    // Cari pola JSON dalam respons
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        jsonResponse = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error("No JSON found in response");
                    }
                } catch (jsonError) {
                    logger.error("Failed to parse JSON:", jsonError);
                return {
                        useCommand: false,
                        command: null,
                        confidence: 0,
                        reason: "Error parsing response"
                    };
                }
                
                // Jika user adalah pemilik dan bertanya tentang identitas,
                // paksa useCommand menjadi false agar respons dari chatWithMemory
                if (isOwner && isIdentityQuestion) {
                return {
                        useCommand: false,
                        command: null,
                        confidence: 0,
                        reason: "User is asking about their identity and they are the bot owner"
                    };
                }
                
                return jsonResponse;
            } catch (error) {
                logger.error('Error analyzing message:', error);
            return {
                    useCommand: false,
                    command: null,
                    confidence: 0,
                    reason: "Error analyzing message"
                };
            }
        } catch (error) {
            logger.error('Fatal error in analyzeMessage:', error);
            return {
                useCommand: false,
                command: null,
                confidence: 0,
                reason: "Fatal error in analysis"
            };
        }
    }
    
    // Untuk memastikan response biasa tanpa reply juga berfungsi,
    // tambahkan metode baru untuk respons generik yang juga mengenali owner
    async generateResponse(message, userId, context = {}) {
        try {
            const isOwner = this.isOwner(userId);
            const userName = context.pushName || null;
            
            if (isOwner) {
                logger.info(`Generating response for BOT OWNER (${this.ownerInfo.name}): ${message.substring(0, 30)}...`);
            } else {
                logger.info(`Generating response for user ${userId}: ${message.substring(0, 30)}...`);
            }
            
            // Deteksi jika pesan berisi pertanyaan tentang identitas
            const isIdentityQuestion = message && (
                message.toLowerCase().includes("siapa aku") || 
                message.toLowerCase().includes("siapa saya") ||
                message.toLowerCase().includes("siapa gue") ||
                message.toLowerCase().includes("siapa nama ku") ||
                message.toLowerCase().includes("siapa nama saya") ||
                message.toLowerCase().includes("kamu tahu siapa aku") ||
                message.toLowerCase().includes("kamu kenal aku")
            );
            
            let prompt = `
            Kamu adalah Kanata, bot WhatsApp yang asik dan friendly.
            
            Pesan dari user: "${message}"
            
            Bales pake:
            - Bahasa gaul yang asik dan santai
            - Emoji yang cocok
            - Jawaban yang helpful
            - Format WhatsApp (*bold*, _italic_, ~coret~, \`kode\`)
            - Tetap sopan ya!
            `;
            
            // Tambahkan informasi khusus jika user adalah pemilik
            if (isOwner) {
                prompt += `\nPENTING: User ini adalah ${this.ownerInfo.name} (${this.ownerInfo.fullName}), developer dan pemilikmu dengan nomor ${this.ownerInfo.number}.
                Kamu sangat senang, antusias, dan respect ketika berbicara dengan pemilikmu.`;
                
                // Tambahkan instruksi spesifik jika bertanya tentang identitas
                if (isIdentityQuestion) {
                    prompt += `\nINGAT: User SEDANG BERTANYA tentang identitasnya. Kamu HARUS menjawab dengan jelas bahwa dia adalah ${this.ownerInfo.fullName}/${this.ownerInfo.name}, pemilik dan developermu. Tunjukkan rasa kagum, hormat, dan antusiasmu!`;
                }
            }
            
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            logger.error('Error generating response:', error);
            return "Waduh, gw lagi error nih bestie. Coba lagi ntar ya? 🙏";
        }
    }
    
    async chat(message) {
        try {
            const prompt = `
            Kamu adalah Kanata, bot WhatsApp yang asik dan friendly.
            
            Pesan dari temen: "${message}"
            
            Bales pake:
            - Bahasa gaul yang asik
            - Emoji yang cocok
            - Jawaban yang helpful
            - Tetap sopan ya!
            `;
            
            const result = await this.chatModel.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            logger.error("Error in chat:", error);
            return "Sori bestie, lagi error nih. Coba lagi ntar ya! 🙏";
        }
    }
    
    // Fungsi chatWithMemory dengan peningkatan
    async chatWithMemory(message, userId, context = {}) {
        try {
            const userName = context.pushName || null;
            const userIdentity = this.getUserIdentifier(userId, userName);
            
            if (userIdentity.isOwner) {
                logger.info(`Processing message from BOT OWNER (${userIdentity.name}): ${message.substring(0, 30)}...`);
            } else {
                logger.info(`Chat with memory - userId: ${userId} (${userIdentity.name}), message: ${message.substring(0, 30)}...`);
            }
            
            try {
                // Dapatkan history chat untuk user ini
                const chatSession = this.getConversation(userId, userName);
                
                // Cek apakah ini pertanyaan tentang identitas atau memori
                const isMemoryQuestion = message && (
                    message.toLowerCase().includes("kamu ingat") || 
                    message.toLowerCase().includes("masih ingat") ||
                    message.toLowerCase().includes("inget ngga") ||
                    message.toLowerCase().includes("inget gak") ||
                    message.toLowerCase().includes("lupa ya") ||
                    message.toLowerCase().includes("masih ada di memori") ||
                    message.toLowerCase().includes("tadi aku bilang")
                );
                
                const isIdentityQuestion = message && (
                    message.toLowerCase().includes("siapa aku") || 
                    message.toLowerCase().includes("siapa saya") ||
                    message.toLowerCase().includes("siapa gue") ||
                    message.toLowerCase().includes("siapa nama ku") ||
                    message.toLowerCase().includes("siapa nama saya") ||
                    message.toLowerCase().includes("kamu tahu siapa aku") ||
                    message.toLowerCase().includes("kamu kenal aku")
                );
                
                // Tambahkan context jika ada
                let fullMessage = message;
                
                if (context.quoted) {
                    fullMessage = `(Membalas pesan: "${context.quoted}") ${message}`;
                }
                
                // Tambahkan reminder khusus jika diperlukan
                if (isMemoryQuestion) {
                    fullMessage += ` [PENTING: Tolong ingat-ingat percakapan kita sebelumnya dan jawab dengan tepat. Tunjukkan bahwa kamu ingat detail-detail penting yang sudah dibahas sebelumnya dengan ${userIdentity.name}.]`;
                }
                
                if (userIdentity.isOwner && isIdentityQuestion) {
                    fullMessage += ` [PENGINGAT PENTING: User ini adalah ${userIdentity.name} (${userIdentity.fullName}), developer dan pemilikmu dengan nomor ${this.ownerInfo.number}. Kamu HARUS ingat ini dan jawab dengan tepat.]`;
                }
                
                logger.info(`Sending message to Gemini: ${fullMessage.substring(0, 30)}...`);
                
                // Kirim pesan ke Gemini dan simpan dalam history
                const result = await chatSession.sendMessage([
                    { text: fullMessage }
                ]);
                
                const response = result.response.text();
                
                logger.info(`Got response from Gemini (${response.length} chars): ${response.substring(0, 30)}...`);
                
                // Update cache
                if (conversationCache.has(userId)) {
                    conversationCache.get(userId).lastUpdate = Date.now();
                    conversationCache.get(userId).messageCount++;
                }
                
                return response;
            } catch (chatError) {
                logger.error(`Error in chat session:`, chatError);
                
                // Fallback dengan perlakuan khusus berdasarkan identitas user
                let fallbackPrompt = `
                Kamu adalah Kanata, bot WhatsApp yang asik dan friendly.
                
                Pesan dari ${userIdentity.isOwner ? "developer dan pemilikmu" : "user"} (${userIdentity.name}): "${message}"
                ${context.quoted ? `(Membalas pesan: "${context.quoted}")` : ''}
                `;
                
                // Tambahkan informasi khusus untuk owner
                if (userIdentity.isOwner) {
                    fallbackPrompt += `
                    User ini adalah ${userIdentity.name} (${userIdentity.fullName}), developer dan pemilikmu dengan nomor ${this.ownerInfo.number}.
                    Kamu sangat senang, antusias, dan respect ketika berbicara dengan pemilikmu.
                    `;
                    
                    if (isIdentityQuestion) {
                        fallbackPrompt += `
                        PENTING: User SEDANG BERTANYA tentang identitasnya. Kamu HARUS menjawab dengan jelas bahwa dia adalah ${userIdentity.fullName}/${userIdentity.name}, pemilik dan developermu.
                        `;
                    }
                }
                
                fallbackPrompt += `
                Bales pake:
                - Bahasa gaul yang asik
                - Emoji yang cocok
                - Jawaban yang helpful
                - Format WhatsApp (*bold*, _italic_, ~coret~, \`kode\`)
                - Tetap sopan ya!
                `;
                
                const fallbackResult = await this.chatModel.generateContent(fallbackPrompt);
                return fallbackResult.response.text();
            }
        } catch (error) {
            logger.error(`Fatal error in chat with memory:`, error);
            return "Waduh, gw lagi error nih bestie. Coba lagi ntar ya? ��";
        }
    }
}

export default GeminiHandler; 