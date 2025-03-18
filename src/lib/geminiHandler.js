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
        this.chatModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
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
    getConversation(userId, userName) {
        logger.info(`Getting conversation for user ${userId} (${userName || 'unnamed'})`);
        
        if (!conversationCache.has(userId)) {
            logger.info(`Creating new conversation for ${userId}`);
            
            const userIdentifier = userName || `user_${userId.split('_')[1]?.substring(0, 4) || 'unknown'}`;
            
            try {
                // Format yang benar untuk Gemini 1.5 Pro
                const chat = this.chatModel.startChat({
                    history: [
                        {
                            role: "user",
                            parts: [{ text: `Halo, kamu adalah Kanata, asisten AI yang asik dan friendly. Kamu suka pake bahasa gaul Indonesia yang santai tapi tetep sopan. Kamu pake first person 'gue/gw' dan second person 'lu/kamu'. Kamu sering pake emoji yang relevan. Jawaban kamu to the point tapi tetep helpful. Nama saya adalah ${userIdentifier}.` }]
                        },
                        {
                            role: "model",
                            parts: [{ text: `Sip, gue ngerti banget! Gue Kanata, asisten AI yang bakal ngobrol sama lu pake bahasa gaul yang asik tapi tetep sopan ya. Seneng bisa kenal sama lu, ${userIdentifier}! Gue bakal jawab pertanyaan lu dengan to the point dan helpful, plus pake emoji yang cocok biar tambah seru! 😎 Ada yang bisa gue bantu hari ini?` }]
                        }
                    ]
                });
                
                conversationCache.set(userId, {
                    history: chat,
                    lastUpdate: Date.now(),
                    userName: userName || null
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
        try {
            // Buat prompt sederhana tanpa menggunakan helpMessage()
            const prompt = `
            Kamu adalah Kanata, bot WhatsApp yang asik dan friendly.
            
            Pesan dari temen: "${message}"
            
            Analisis pesan tersebut dan tentukan:
            1. Apakah ini command untuk bot? (tingkat keyakinan 0-1)
            2. Jika ya, command apa dan parameter apa?
            
            Format respons dalam JSON:
            {
                "command": "nama_command",
                "args": "parameter",
                "confidence": 0.0-1.0,
                "responseMessage": "Pesan untuk user"
            }
            
            Pastikan responnya dalam format JSON yang valid.
            `;
            
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
            if (retryCount < 2 && error.message.includes('network')) {
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
    
    // Fungsi chatWithMemory - perbaikan format
    async chatWithMemory(message, userId, context = {}) {
        try {
            logger.info(`Chat with memory - userId: ${userId}, message: ${message.substring(0, 30)}...`);
            
            const userName = context.pushName || null;
            logger.info(`User name from context: ${userName || 'not provided'}`);
            
            try {
                // Dapatkan history chat untuk user ini
                const chatSession = this.getConversation(userId, userName);
                
                // Tambahkan context jika ada
                let fullMessage = message;
                if (context.quoted) {
                    fullMessage = `(Membalas pesan: "${context.quoted}") ${message}`;
                }
                
                logger.info(`Sending message to Gemini: ${fullMessage.substring(0, 30)}...`);
                
                // Format yang benar untuk sendMessage di Gemini 1.5 Pro
                const result = await chatSession.sendMessage([
                    { text: fullMessage }
                ]);
                
                const response = result.response.text();
                
                logger.info(`Got response from Gemini: ${response.substring(0, 30)}...`);
                
                return response;
            } catch (chatError) {
                logger.error(`Error in chat session:`, chatError);
                
                // Fallback: jika error dengan conversation, coba dengan permintaan baru
                logger.info(`Falling back to regular chat`);
                const fallbackPrompt = `
                Kamu adalah Kanata, bot WhatsApp yang asik dan friendly.
                
                Pesan user: "${message}"
                ${context.quoted ? `(Membalas pesan: "${context.quoted}")` : ''}
                
                Bales pake:
                - Bahasa gaul yang asik
                - Emoji yang cocok
                - Jawaban yang helpful
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