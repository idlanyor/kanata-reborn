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
    
    // Fungsi untuk mendapatkan chat history atau membuat baru jika belum ada
    getConversation(userId) {
        if (!conversationCache.has(userId)) {
            conversationCache.set(userId, {
                history: this.chatModel.startChat({
                    history: [
                        {
                            role: "user",
                            parts: "Halo, kamu adalah Kanata, asisten AI yang asik dan friendly. Kamu suka pake bahasa gaul Indonesia yang santai tapi tetep sopan. Kamu pake first person 'gue/gw' dan second person 'lu/kamu'. Kamu sering pake emoji yang relevan. Jawaban kamu to the point tapi tetep helpful."
                        },
                        {
                            role: "model",
                            parts: "Sip, gue ngerti banget! Gue Kanata, asisten AI yang bakal ngobrol sama lu pake bahasa gaul yang asik tapi tetep sopan ya. Gue bakal jawab pertanyaan lu dengan to the point dan helpful, plus pake emoji yang cocok biar tambah seru! 😎 Ada yang bisa gue bantu hari ini?"
                        }
                    ]
                }),
                lastUpdate: Date.now()
            });
        } else {
            // Update timestamp saja
            conversationCache.get(userId).lastUpdate = Date.now();
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
            logger.info(`Processing image with message: ${message?.substring(0, 30) || "no message"}...`);
            
            // Konversi buffer menjadi format yang sesuai untuk Gemini
            const imagePart = this.bufferToGenerativePart(imageBuffer);
            
            // Buat prompt untuk analisis gambar
            const prompt = `
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
            - Jawaban harus helpful dan akurat
            - Tetap sopan ya!
            `;
            
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

    async chat(message) {
        try {
            const plugins = await helpMessage();
            const prompt = `Lu adalah Kanata, bot WhatsApp yang asik dan friendly banget. Lu punya fitur-fitur keren berikut:

${JSON.stringify(plugins, null, 2)}

Pesan dari temen: "${message}"

Bales pake:
- Bahasa gaul yang asik
- Emoji yang cocok
- Jawaban yang helpful
- Tetep sopan ya!
- Kalo ada command yang relevan, boleh sebutin (pake prefix "!")`;

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
            logger.info(`Processing chat with memory for ${userId}: ${message.substring(0, 30)}...`);
            
            // Dapatkan history chat untuk user ini
            const chatSession = this.getConversation(userId);
            
            // Tambahkan context jika ada
            let contextPrompt = "";
            if (context.quoted) {
                contextPrompt = `(Ini adalah balasan untuk pesan: "${context.quoted}")`;
            }
            
            // Kirim pesan ke Gemini dan simpan dalam history
            const result = await chatSession.sendMessage(`${contextPrompt} ${message}`);
            const response = result.response.text();
            
            return response;
        } catch (error) {
            logger.error(`Error in chat with memory:`, error);
            return "Waduh, gw lagi error nih bestie. Coba lagi ntar ya? 🙏";
        }
    }
}

export default GeminiHandler; 