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
const MEMORY_CLEANUP_INTERVAL = 20 * 60 * 1000; // 20 menit

// Informasi tentang pemilik bot
const BOT_OWNER = {
    name: "Roy",
    fullName: "Roynaldi",
    number: "62895395590009"
};

// Daftar fitur bot - fallback jika helpMessage() gagal
const DEFAULT_COMMANDS = [
    { command: 'menu', description: 'Menampilkan daftar fitur bot' },
    { command: 'owner', description: 'Informasi pemilik bot' },
    { command: 'translate', description: 'Menerjemahkan teks' },
    { command: 'sticker', description: 'Membuat sticker dari gambar' }
];

class GeminiHandler {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        this.visionModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        this.chatModel = this.genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
            }
        });
        this.ownerInfo = BOT_OWNER;
        
        // Simpan daftar perintah/fitur
        this.commands = DEFAULT_COMMANDS;
        this.lastCommandUpdate = 0;
        
        // Update commands pada awal inisialisasi
        this.updateCommands();
        
        // Cleanup cache secara teratur
        setInterval(() => this.cleanupConversations(), MEMORY_CLEANUP_INTERVAL);
        
        // Update commands setiap 5 menit
        setInterval(() => this.updateCommands(), 5 * 60 * 1000);
        
        logger.info('GeminiHandler initialized with memory management');
    }
    
    // Fungsi untuk update daftar commands/fitur
    async updateCommands() {
        try {
            const now = Date.now();
            // Hanya update jika sudah lebih dari 5 menit sejak update terakhir
            if (now - this.lastCommandUpdate < 5 * 60 * 1000) {
                return;
            }
            
            const help = await helpMessage();
            if (help && Array.isArray(help.items) && help.items.length > 0) {
                this.commands = help.items.map(item => ({
                    command: item.command,
                    description: item.description || 'Tidak ada deskripsi'
                }));
                this.lastCommandUpdate = now;
                logger.info(`Commands updated: ${this.commands.length} commands available`);
            }
        } catch (error) {
            logger.error('Failed to update commands:', error);
            // Tetap gunakan commands default jika gagal
        }
    }
    
    // Fungsi untuk mendapatkan daftar commands yang tersedia
    getCommandList() {
        return this.commands;
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

Kamu memiliki daftar fitur/perintah berikut yang bisa kamu rekomendasikan ke user:
${this.getCommandList().map(cmd => `/${cmd.command} - ${cmd.description}`).join('\n')}

Jika user menanyakan menu atau fitur bot, SELALU tampilkan daftar fitur di atas dengan format yang rapi. Kamu selalu mengingat semua percakapan dengan user dan menjawab sesuai konteks.

Nama saya adalah ${userIdentity.name}.`;
                
                // Tambahkan info khusus jika user adalah pemilik
                if (userIdentity.isOwner) {
                    initialPrompt += ` PENTING: Kamu HARUS SELALU INGAT bahwa saya adalah developer dan pemilikmu (${this.ownerInfo.fullName}/${this.ownerInfo.name}) dengan nomor ${this.ownerInfo.number}. Jika saya bertanya "siapa saya?" atau pertanyaan serupa tentang identitas saya, kamu HARUS menjawab bahwa saya adalah ${this.ownerInfo.fullName}/${this.ownerInfo.name}, pemilik dan developermu. Kamu sangat senang, antusias, dan respect ketika berbicara dengan saya karena saya yang menciptakanmu.`;
                }
                
                // Format respons bot awal yang berbeda untuk owner dan user biasa
                let initialResponse;
                
                if (userIdentity.isOwner) {
                    initialResponse = `*Wuih creator gw!* 😍 

Salam creator ${this.ownerInfo.name}! Seneng banget bisa ngobrol langsung sama lu yang udah bikin gw. Gimana kabar lu? Ada yang bisa gw bantu hari ini? Tinggal bilang aja, gw bakal usahain yang terbaik buat lu! 🔥

Btw, makasih ya udah bikin gw, semoga gw bisa jadi bot yang berguna buat lu dan user lain! 🙏`;
                } else {
                    initialResponse = `Hai ${userIdentity.name}! 😎

Sip, gw Kanata, asisten AI yang siap bantuin lu! Gw bakal jawab pertanyaan lu dengan gaya santai tapi tetep helpful.

Ada yang bisa gw bantu hari ini? Kalo mau tau fitur gw, cukup ketik *menu* ya!`;
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
            const userId = `private_${noTel}`;
            const userName = m.pushName || null;
            const isOwner = this.isOwner(userId);
            
            if (isOwner) {
                logger.info(`Processing image from BOT OWNER (${this.ownerInfo.name}): ${message?.substring(0, 30) || "no message"}...`);
            } else {
                logger.info(`Processing image with message: ${message?.substring(0, 30) || "no message"}...`);
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
                prompt += `\nPENTING: User ini adalah ${this.ownerInfo.name} (${this.ownerInfo.fullName}), developer dan pemilikmu dengan nomor ${this.ownerInfo.number}.
                Kamu sangat senang dan respect ketika berbicara dengan pemilikmu.`;
                
                // Tambahkan instruksi spesifik jika bertanya tentang identitas
                if (isIdentityQuestion) {
                    prompt += `\nINGAT: User SEDANG BERTANYA tentang identitasnya. Kamu HARUS menjawab dengan jelas bahwa dia adalah ${this.ownerInfo.fullName}/${this.ownerInfo.name}, pemilik dan developermu.`;
                }
            }
            
            // Generate konten dengan Gemini Vision
            const result = await this.visionModel.generateContent([prompt, imagePart]);
            const response = result.response;
            const responseText = response.text();
            
            // Update percakapan memory jika user bertanya tentang identitas
            if (isOwner && isIdentityQuestion && conversationCache.has(userId)) {
                const memoryPrompt = `[User bertanya tentang identitasnya melalui gambar. Ingat bahwa user adalah ${this.ownerInfo.name}, pemilikmu.]`;
                this.getConversation(userId, userName).sendMessage([{ text: memoryPrompt }]);
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
            const isOwner = this.isOwner(userId);
            const userIdentifier = isOwner ? this.ownerInfo.name : (userName || `user_${userId.split('_')[1]?.substring(0, 4) || 'unknown'}`);
            
            // Cek apakah ini pertanyaan tentang identitas
            const isIdentityQuestion = message && (
                message.toLowerCase().includes("siapa aku") || 
                message.toLowerCase().includes("siapa saya") ||
                message.toLowerCase().includes("siapa gue")
            );
            
            const plugins = await helpMessage();
            let prompt = `Lu adalah Kanata, bot WhatsApp yang asik dan friendly banget. Lu punya fitur-fitur keren berikut:

${JSON.stringify(plugins, null, 2)}

Pesan dari user ${userIdentifier}: "${message}"

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
            const isOwner = this.isOwner(userId);
            const userName = context.pushName || null;
            
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
                let fullMessage = message;
                if (context.quoted) {
                    fullMessage = `(Membalas pesan: "${context.quoted}") ${message}`;
                }
                
                // Tambahkan reminder tentang owner jika perlu
                if (isOwner && isIdentityQuestion) {
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