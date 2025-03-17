import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../helper/logger.js';
import { helpMessage } from '../helper/pluginsIterator.js';

// Cache untuk menyimpan hasil analisis pesan
const messageHistory = new Map();
const RATE_LIMIT_DURATION = 2000;
const MAX_RETRIES = 2;

class GeminiHandler {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
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
}

export default GeminiHandler; 