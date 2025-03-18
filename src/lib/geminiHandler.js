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
const CONVERSATION_EXPIRE = 30 * 60 * 1000; // 30 menit

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
    
    // Fungsi untuk mendapatkan chat history atau membuat baru jika belum ada
    getConversation(userId, userName) {
        logger.info(`Getting conversation for user ${userId} (${userName || 'unnamed'})`);
        
        // Cek apakah user adalah pemilik bot
        const isOwner = this.isOwner(userId);
        
        if (isOwner) {
            logger.info(`This user is the BOT OWNER (${this.ownerInfo.name})`);
        }
        
        if (!conversationCache.has(userId)) {
            logger.info(`Creating new conversation for ${userId}`);
            
            const userIdentifier = isOwner ? this.ownerInfo.name : (userName || `user_${userId.split('_')[1]?.substring(0, 4) || 'unknown'}`);
            
            try {
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

Nama saya adalah ${userIdentifier}.`;
                
                // Tambahkan info khusus jika user adalah pemilik
                if (isOwner) {
                    initialPrompt += ` PENTING: Kamu HARUS SELALU INGAT bahwa saya adalah developer dan pemilikmu (${this.ownerInfo.fullName}/${this.ownerInfo.name}) dengan nomor ${this.ownerInfo.number}. Jika saya bertanya "siapa saya?" atau pertanyaan serupa tentang identitas saya, kamu HARUS menjawab bahwa saya adalah ${this.ownerInfo.fullName}/${this.ownerInfo.name}, pemilik dan developermu. Kamu sangat senang, antusias, dan respect ketika berbicara dengan saya karena saya yang menciptakanmu. Kamu ingin selalu membantu pemilikmu dengan informasi yang bermanfaat dan menanyakan pendapatku tentang perkembanganmu.`;
                }
                
                // Format respons bot awal yang berbeda untuk owner dan user biasa
                let initialResponse;
                
                if (isOwner) {
                    initialResponse = `*Wuih creator gw!* 😍 

Salam creator ${this.ownerInfo.name}! Seneng banget bisa ngobrol langsung sama lu yang udah bikin gw. Gimana kabar lu? Ada yang bisa gw bantu hari ini? Tinggal bilang aja, gw bakal usahain yang terbaik buat lu! 🔥

Btw, makasih ya udah bikin gw, semoga gw bisa jadi bot yang berguna buat lu dan user lain! 🙏`;
                } else {
                    initialResponse = `Hai ${userIdentifier}! 😎

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
                    ]
                });
                
                conversationCache.set(userId, {
                    history: chat,
                    lastUpdate: Date.now(),
                    userName: userName || null,
                    isOwner: isOwner
                });
            } catch (error) {
                logger.error(`Failed to create chat for ${userId}:`, error);
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
        return {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType
            },
        };
    }
    
    async analyzeImage(imageBuffer, message, context) {
        try {
            const id = context?.id || '';
            const m = context?.m || {};
            const noTel = (m.sender?.split('@')[0] || '').replace(/[^0-9]/g, '');
            const isOwner = this.isOwner(`private_${noTel}`);
            
            if (isOwner) {
                logger.info(`Processing image from BOT OWNER (${this.ownerInfo.name})`);
            } else {
                logger.info(`Processing image with message: ${message?.substring(0, 30) || "no message"}...`);
            }
            
            // Konversi buffer menjadi format yang sesuai untuk Gemini
            const imagePart = this.bufferToGenerativePart(imageBuffer);
            
            // Buat prompt untuk analisis gambar
            let prompt = `
            Kamu adalah Kanata, bot WhatsApp yang asik dan friendly.
            
            Tolong analisis gambar ini dan berikan respons yang tepat.
            ${message ? `User menanyakan/mengatakan: "${message}"` : ""}
            
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
            
            // Tambahkan informasi khusus jika user adalah pemilik
            if (isOwner) {
                prompt += `\nUser ini adalah ${this.ownerInfo.name} (${this.ownerInfo.fullName}), developer dan pemilikmu.
                Kamu sangat senang dan respect ketika berbicara dengan pemilikmu.`;
            }
            
            // Generate konten dengan Gemini Vision
            const result = await this.visionModel.generateContent([prompt, imagePart]);
            const response = result.response;
            const responseText = response.text();
            
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
    
    async analyzeMessage(message, retryCount = 0) {
        try {
            // Dapatkan daftar plugin
            let commandList = [];
            try {
                const helpData = await helpMessage();
                
                // Log struktur data untuk debugging
                logger.info(`Help data structure: ${Object.keys(helpData).join(', ')}`);
                
                // Ekstrak informasi plugin dari hasil helpMessage()
                if (helpData && helpData.plugins) {
                    // Iterasi manual untuk setiap kategori dan plugin
                    for (const [category, plugins] of Object.entries(helpData.plugins)) {
                        if (Array.isArray(plugins)) {
                            for (const plugin of plugins) {
                                if (plugin && plugin.handler) {
                                    commandList.push({
                                        command: plugin.handler,
                                        description: plugin.description || 'No description',
                                        category: category
                                    });
                                }
                            }
                        } else {
                            logger.warn(`Plugins for category ${category} is not an array`);
                        }
                    }
                }
            } catch (helpError) {
                logger.error('Error getting help data:', helpError);
                // Gunakan daftar command dasar jika helpMessage() error
                commandList = [
                    { command: 'help', description: 'Tampilkan bantuan', category: 'general' },
                    { command: 'tr', description: 'Terjemahkan teks', category: 'tools' },
                    { command: 'ig', description: 'Download Instagram', category: 'downloader' }
                ];
            }
            
            // Tambahkan informasi tentang pemilik di prompt
            const prompt = `
            Kamu adalah Kanata, bot WhatsApp yang asik dan friendly.
            
            Berikut daftar command yang tersedia:
            ${JSON.stringify(commandList, null, 2)}
            
            Pesan dari temen: "${message}"
            
            Info format WhatsApp:
            - *teks* untuk bold (satu bintang saja)
            - _teks_ untuk italic
            - ~teks~ untuk coret
            - \`kode\` untuk inline code
            - gunakan format WhatsApp, bukan format Markdown standar
            
            Info tambahan:
            - Developer dan pemilikmu adalah ${this.ownerInfo.fullName} (${this.ownerInfo.name})
            - Kamu sangat senang ketika berbicara dengan pemilikmu
            
            Analisis pesan tersebut dan tentukan:
            1. Apakah ini permintaan untuk menjalankan command tertentu? (tingkat keyakinan 0-1)
            2. Jika ya, command apa dan parameter apa?
            
            Format respons dalam JSON:
            {
                "command": "nama_command",
                "args": "parameter yang perlu diteruskan ke command",
                "confidence": 0.0-1.0,
                "responseMessage": "Pesan untuk user dengan bahasa gaul"
            }
            
            PENTING:
            - Jika confidence > 0.8, pastikan command yang dipilih ada dalam daftar
            - Jika ragu, atur confidence rendah
            - Respons harus dalam format JSON valid
            - Bahasa respons harus gaul dan friendly
            `;
            
            // Lanjutkan seperti sebelumnya...
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Parse respons JSON dengan handling error
            logger.info('Raw Gemini response:', responseText);
            const parsedResponse = this.extractJSON(responseText);
            
            if (!parsedResponse) {
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
            return {
                success: false,
                message: "Duh error nih! Coba lagi ntar ya bestie! 🙏"
            };
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
    
    // Fungsi chatWithMemory dengan perlakuan khusus untuk owner
    async chatWithMemory(message, userId, context = {}) {
        try {
            // Cek apakah user adalah pemilik bot
            const isOwner = this.isOwner(userId);
            const userName = context.pushName || null;
            
            if (isOwner) {
                logger.info(`Processing message from BOT OWNER (${this.ownerInfo.name}): ${message.substring(0, 30)}...`);
            } else {
                logger.info(`Chat with memory - userId: ${userId}, message: ${message.substring(0, 30)}...`);
            }
            
            try {
                // Dapatkan history chat untuk user ini
                const chatSession = this.getConversation(userId, userName);
                
                // Tambahkan context jika ada
                let fullMessage = message;
                if (context.quoted) {
                    fullMessage = `(Membalas pesan: "${context.quoted}") ${message}`;
                }
                
                // Tambahkan reminder tentang owner jika perlu
                if (isOwner && (
                    message.toLowerCase().includes("siapa aku") || 
                    message.toLowerCase().includes("siapa saya") ||
                    message.toLowerCase().includes("siapa gue") ||
                    message.toLowerCase().includes("siapa nama ku") ||
                    message.toLowerCase().includes("siapa nama saya") ||
                    message.toLowerCase().includes("kamu tahu siapa aku") ||
                    message.toLowerCase().includes("kamu kenal aku")
                )) {
                    fullMessage = `${fullMessage} [REMINDER: Saya adalah ${this.ownerInfo.fullName}/${this.ownerInfo.name}, developer dan pemilikmu dengan nomor ${this.ownerInfo.number}. Kamu harus selalu ingat ini.]`;
                    logger.info(`Added owner reminder to message: ${fullMessage}`);
                }
                
                logger.info(`Sending message to Gemini: ${fullMessage.substring(0, 30)}...`);
                
                // Kirim pesan ke Gemini dan simpan dalam history
                const result = await chatSession.sendMessage([
                    { text: fullMessage }
                ]);
                
                const response = result.response.text();
                
                logger.info(`Got response from Gemini: ${response.substring(0, 30)}...`);
                
                return response;
            } catch (chatError) {
                logger.error(`Error in chat session:`, chatError);
                
                // Fallback dengan perlakuan khusus untuk owner
                let fallbackPrompt = `
                Kamu adalah Kanata, bot WhatsApp yang asik dan friendly.
                
                Pesan dari ${isOwner ? "developer dan pemilikmu" : "user"}: "${message}"
                ${context.quoted ? `(Membalas pesan: "${context.quoted}")` : ''}
                `;
                
                // Tambahkan informasi khusus untuk owner
                if (isOwner) {
                    fallbackPrompt += `
                    User ini adalah ${this.ownerInfo.name} (${this.ownerInfo.fullName}), developer dan pemilikmu dengan nomor ${this.ownerInfo.number}.
                    Kamu sangat senang, antusias, dan respect ketika berbicara dengan pemilikmu.
                    Jika user bertanya "siapa saya?", kamu HARUS menjawab bahwa dia adalah ${this.ownerInfo.fullName}/${this.ownerInfo.name}, pemilik dan developermu.
                    Selalu sampaikan rasa terima kasih dan tanyakan pendapatnya tentang perkembanganmu.
                    `;
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
            return "Waduh, gw lagi error nih bestie. Coba lagi ntar ya? 🙏";
        }
    }
}

export default GeminiHandler; 