import { Kanata, clearMessages } from '../helper/bot.js';
import { logger } from '../helper/logger.js';
import { groupParticipants, groupUpdate } from '../lib/group.js';
import { checkAnswer, tebakSession } from '../lib/tebak/index.js';
import { getMedia } from '../helper/mediaMsg.js';
import { call } from '../lib/call.js';
import { gpt4Hika } from '../lib/ai.js';
import { schedulePrayerReminders } from '../lib/jadwalshalat.js';
import User from '../database/models/User.js';
import Group from '../database/models/Group.js';
import { loadPluginCommands } from '../utils/pluginLoader.js';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';
import { addMessageHandler } from '../helper/message.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let bot = null;
let isStarting = false;

// Helper functions
async function getPhoneNumber() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    
    try {
        // Selalu minta nomor telepon untuk pairing code
        const phoneNumber = await new Promise(resolve => {
            const validatePhoneNumber = (input) => {
                const phoneRegex = /^62\d{9,15}$/;
                return phoneRegex.test(input);
            };
            const askForPhoneNumber = () => {
                logger.showBanner();
                rl.question(chalk.yellowBright("Enter phone number (with country code, e.g., 628xxxxx): "), input => {
                    if (validatePhoneNumber(input)) {
                        logger.success("Valid phone number entered!");
                        rl.close();
                        resolve(input);
                    } else {
                        logger.error("Invalid phone number! Must start with '62' and contain only numbers (minimum 10 digits).");
                        askForPhoneNumber();
                    }
                });
            };
            askForPhoneNumber();
        });

        return phoneNumber;
    } catch (error) {
        logger.error('Error getting phone number:', error);
        rl.close();
        throw error;
    }
}

export async function startBot() {
    if (isStarting) {
        logger.warn('Bot is already starting...');
        return;
    }

    if (bot) {
        logger.warn('Bot is already running');
        return;
    }

    isStarting = true;

    try {
        const phoneNumber = fs.existsSync(`./${globalThis.sessionName}`) ? null : await getPhoneNumber();
        
        logger.info(`Starting bot with phone number: ${phoneNumber}`);
        
        bot = new Kanata({
            phoneNumber,
            sessionId: globalThis.sessionName,
            useStore: true
        });

        const sock = await bot.start();
        logger.success('Bot started successfully!');
        logger.divider();

        setupEventHandlers(sock);
        
        if (globalThis.groupJid) {
            schedulePrayerReminders(sock, globalThis.groupJid);
        }

        isStarting = false;
        return sock;
    } catch (error) {
        isStarting = false;
        bot = null;
        logger.error('Failed to start bot:', error);
        throw error;
    }
}

function setupEventHandlers(sock) {
    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            let m = chatUpdate.messages[0];
            m = addMessageHandler(m, sock);
            const sender = m.pushName;
            const id = m.chat;
            const noTel = (id.endsWith('@g.us')) ? m.sender.split('@')[0].replace(/[^0-9]/g, '') : m.chat.split('@')[0].replace(/[^0-9]/g, '');

            await handleMessage({ m, sock, sender, id, noTel });
        } catch (error) {
            logger.error('Error handling message:', error);
        }
    });

    sock.ev.on('group-participants.update', ev => groupParticipants(ev, sock));
    sock.ev.on('groups.update', ev => groupUpdate(ev, sock));
    sock.ev.on('call', callEv => call(callEv, sock));
}

async function handleMessage({ m, sock, sender, id, noTel }) {
    // Handle media messages
    const mediaTypes = {
        image: m.message?.imageMessage || m.quoted?.imageMessage,
        video: m.message?.videoMessage || m.quoted?.videoMessage,
        audio: m.message?.audioMessage || m.quoted?.audioMessage
    };

    for (const [type, buffer] of Object.entries(mediaTypes)) {
        if (buffer) {
            const mediaBuffer = await getMedia({ message: { [`${type}Message`]: buffer } });
            const caption = buffer.caption || m.body;
            await prosesPerintah({ 
                command: caption, 
                sock, 
                m, 
                id, 
                sender, 
                noTel, 
                attf: mediaBuffer, 
                mime: buffer.mimetype 
            });
        }
    }

    // Handle interactive messages
    if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
        const cmd = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
        await prosesPerintah({ command: `!${cmd.id}`, sock, m, id, sender, noTel });
    }

    // Handle button responses
    if (m.message?.templateButtonReplyMessage) {
        await prosesPerintah({ 
            command: `!${m.message.templateButtonReplyMessage.selectedId}`, 
            sock, m, id, sender, noTel 
        });
    }

    if (m.message?.buttonsResponseMessage) {
        await prosesPerintah({ 
            command: `!${m.message.buttonsResponseMessage.selectedButtonId}`, 
            sock, m, id, sender, noTel 
        });
    }

    // Handle AI mentions
    let botId = sock.user.id.replace(/:\d+/, '');
    let botMentioned = m.message?.extendedTextMessage?.contextInfo?.participant?.includes(botId)
        || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botId);

    if (botMentioned) {
        try {
            const settings = await Group.getSettings(id);
            if (settings.autoai === 1) {
                const fullmessage = m.body;
                const ctx = m.quoted?.text || '';
                await sock.sendMessage(id, { 
                    text: await gpt4Hika({ prompt: `${fullmessage} ${ctx}`, id }) 
                }, { quoted: m });
            }
        } catch (error) {
            await sock.sendMessage(id, { text: 'ups,ada yang salah' }, { quoted: m });
        }
    }

    // Handle regular messages
    const chat = await clearMessages(m);
    if (chat) {
        const parsedMsg = chat.chatsFrom === "private" ? chat.message : chat.participant?.message;
        if (tebakSession.has(id)) {
            await checkAnswer(id, parsedMsg.toLowerCase(), sock, m, noTel);
        } else {
            await prosesPerintah({ command: parsedMsg, sock, m, id, sender, noTel });
        }
    }
}

async function prosesPerintah({ command, sock, m, id, sender, noTel, attf }) {
    if (!command) return;
    let [cmd, ...args] = command.split(' ');
    cmd = cmd.toLowerCase();

    if (command.startsWith('!') || command.startsWith('.')) {
        cmd = command.substring(1).split(' ')[0].toLowerCase();
        args = command.split(' ').slice(1);
    }

    const chatType = id.endsWith('@g.us') ? 'Group' : 'Private';
    const time = new Date().toLocaleTimeString();
    
    logger.divider();
    logger.info(chalk.cyan(`📩 New Message Received`));
    logger.info(chalk.yellow(`⏰ Time     : ${time}`));
    logger.info(chalk.green(`👤 From     : ${m.pushName}`));
    logger.info(chalk.blue(`💭 Chat Type : ${chatType}`));
    logger.info(chalk.magenta(`💬 Message  : ${command}`));
    logger.divider();

    try {
        // Inisialisasi pengaturan grup jika pesan dari grup
        if (id.endsWith('@g.us')) {
            await Group.initGroup(id);
            const settings = await Group.getSettings(id);

            // Cek fitur grup
            await checkGroupFeatures(settings, { sock, m, id, noTel });

            // Cek only admin
            if (settings.only_admin) {
                const groupAdmins = await getGroupAdmins({ sock, id });
                if (!groupAdmins.includes(noTel)) {
                    return;
                }
            }
        }

        // Cek dan buat user jika belum ada
        let user = await User.getUser(noTel);
        if (!user) {
            await User.create(noTel, m.pushName || 'User');
        }

        // Tambah exp untuk setiap pesan
        const expGained = Math.floor(Math.random() * 11) + 5;
        await User.addExp(noTel, expGained);

        // Load dan eksekusi plugin commands
        const pluginsDir = path.join(__dirname, '../plugins');
        const plugins = await loadPluginCommands(pluginsDir);

        if (plugins[cmd]) {
            logger.info(`Executing command: ${cmd}`);
            await plugins[cmd]({ sock, m, id, psn: args.join(' '), sender, noTel, attf, cmd });
            logger.success(`Command ${cmd} executed successfully`);
        }

    } catch (error) {
        logger.error(`Error processing message`, error);
    }
}

async function checkGroupFeatures(settings, { sock, m, id, noTel }) {
    const features = {
        antispam: async () => {
            try {
                const { default: antispam } = await import('../plugins/hidden/events/antispam.js');
                return await antispam({ sock, m, id, psn: m.body, sender: noTel + '@s.whatsapp.net' });
            } catch (error) {
                logger.error('Error in antispam:', error);
            }
        },
        antipromosi: async () => {
            try {
                const { default: antipromosi } = await import('../plugins/hidden/events/antipromosi.js');
                return await antipromosi({ sock, m, id, psn: m.body, sender: noTel + '@s.whatsapp.net' });
            } catch (error) {
                logger.error('Error in antipromosi:', error);
            }
        },
        antilink: async () => {
            try {
                const { default: antilink } = await import('../plugins/hidden/events/antilink.js');
                return await antilink({ sock, m, id, psn: m.body, sender: noTel + '@s.whatsapp.net' });
            } catch (error) {
                logger.error('Error in antilink:', error);
            }
        },
        antitoxic: async () => {
            try {
                const { default: antitoxic } = await import('../plugins/hidden/events/antitoxic.js');
                return await antitoxic({ sock, m, id, psn: m.body, sender: noTel + '@s.whatsapp.net' });
            } catch (error) {
                logger.error('Error in antitoxic:', error);
            }
        },
        antivirtex: async () => {
            try {
                const { default: antivirtex } = await import('../plugins/hidden/events/antivirtex.js');
                return await antivirtex({ sock, m, id, psn: m.body, sender: noTel + '@s.whatsapp.net' });
            } catch (error) {
                logger.error('Error in antivirtex:', error);
            }
        },
        autoai: async () => {
            try {
                const { default: autoai } = await import('../plugins/bot/autoai.js');
                return await autoai({ sock, m, id, psn: m.body });
            } catch (error) {
                logger.error('Error in autoai:', error);
            }
        }
    };

    for (const [feature, handler] of Object.entries(features)) {
        if (settings[feature] && await handler()) {
            return true;
        }
    }
    return false;
}

export { prosesPerintah }; 