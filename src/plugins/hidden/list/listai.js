import pkg from '@fizzxydev/baileys-pro';
const { generateWAMessageFromContent, proto } = pkg;
export const handler = "listai"
export const description = "📜 *List Artificial Intelligence* 📜";

export default async ({ sock, id, m, noTel, sender }) => {
    try {
        let sections = [{
            title: '🤖 *Artificial Intelligence*',
            rows: [
                {
                    title: '🤖 GPT3.5 - Skizotech',
                    id: `ai`
                },
                {
                    title: '⚡ GPT Turbo V3 - Skizotech',
                    id: `ai2`
                },
                {
                    title: '🌐 Gemini - Google',
                    id: `gemini`
                },
                {
                    title: '🚀 Mixtral - Official',
                    id: `mixtral`
                },
                {
                    title: '🦙 Llama3 Meta - Groq',
                    id: `llama`
                },
                {
                    title: '🌲 Mistral - Groq',
                    id: `mistral`
                },
                {
                    title: '💎 Gemma - Groq',
                    id: `gemma`
                },
                {
                    title: '🧠 Claude 3 - Anthropic',
                    id: `claude`
                },
                {
                    title: '🔮 Claude Opus - Anthropic',
                    id: `opus`
                }
            ]
        }];

        let listMessage = {
            title: '✨ *Daftar AI Kanata* ✨',
            sections
        };

        let messageContent = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    "messageContextInfo": {
                        "deviceListMetadata": {},
                        "deviceListMetadataVersion": 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: "🔍 *Pilih AI favoritmu dari daftar di bawah ini!*"
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `©Kanata V3 || Roy`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: `🧠 *AI Menu*`
                        }),
                        gifPlayback: true,
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [{
                                "name": "single_select",
                                "buttonParamsJson": JSON.stringify(listMessage)
                            }]
                        })
                    })
                }
            }
        }, {
            quoted: {
                key: {
                    remoteJid: '0@s.whatsapp.net',
                    participant: '0@s.whatsapp.net'
                },
                message: {
                    newsletterAdminInviteMessage: {
                        newsletterJid: '120363302865191524@newsletter',
                        newsletterName: 'Kanata Bot',
                        caption: `${sender} : List AI`
                    }
                }
            }
        });

        await sock.relayMessage(id, messageContent.message, {
            messageId: messageContent.key.id
        });

        // Kirim reaksi sukses
        await sock.sendMessage(id, { 
            react: { 
                text: '🤖', 
                key: m.key 
            } 
        });
        
    } catch (error) {
        console.error('Error in listai:', error);
        
        await sock.sendMessage(id, {
            text: `❌ *Terjadi kesalahan:*\n${error.message}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ List AI Error',
                    body: 'An error occurred while fetching AI list',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                }
            }
        });
        
        // Kirim reaksi error
        await sock.sendMessage(id, { 
            react: { 
                text: '❌', 
                key: m.key 
            } 
        });
    }
};

export const help = {
    name: 'listai',
    description: 'Menampilkan daftar AI yang tersedia',
    usage: '.listai'
};
