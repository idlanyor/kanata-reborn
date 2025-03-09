import './global.js'
import { Kanata, clearMessages } from './helper/bot.js';
import { logger } from './helper/logger.js';
import { groupParticipants, groupUpdate } from './lib/group.js';
import { checkAnswer, tebakSession } from './lib/tebak/index.js';
import { getMedia } from './helper/mediaMsg.js';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline';
import { call } from './lib/call.js';
import { gpt4Hika } from './lib/ai.js';
import { schedulePrayerReminders } from './lib/jadwalshalat.js';
import User from './database/models/User.js';
import Group from './database/models/Group.js';
import { checkAndInitDatabase, initializeDefaultData } from './helper/databaseChecker.js';
import { checkCommand } from './helper/commandChecker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(findJsFiles(filePath));
        }
        else if (file.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

async function getPhoneNumber() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const namaSesiPath = path.join(__dirname, globalThis.sessionName);

    try {
        await fs.promises.access(namaSesiPath);
        rl.close();
    } catch {
        return new Promise(resolve => {
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
    }
}

async function prosesPerintah({ command, sock, m, id, sender, noTel, attf }) {
    try {
        if (!command) return;
        
        // Tambahkan message handler
        m = addMessageHandler(m, sock);
        
        // Parse command dan args
        let cmd = '';
        let args = [];
        
        if (command.startsWith('!')) {
            cmd = command.toLowerCase().substring(1).split(' ')[0];
            args = command.split(' ').slice(1);
        } else {
            [cmd, ...args] = command.split(' ');
            cmd = cmd.toLowerCase();
        }

        // Cek mode bot
        const mode = globalThis.botMode || 'public';
        
        // Validasi berdasarkan mode
        if (mode === 'self' && m.isGroup) {
            return; // Tidak merespon di grup jika mode self
        }
        
        if (mode === 'restricted' && m.isGroup && !m.isOwner) {
            return; // Di grup hanya owner yang bisa menggunakan
        }

        // Check command validity and initialize necessary data
        if (!await checkCommand(cmd, m, noTel, id)) {
            await m.reply('❌ Terjadi kesalahan saat memproses command');
            return;
        }

        // Inisialisasi pengaturan grup
        if (m.isGroup) {
            await Group.initGroup(id);
            const settings = await Group.getSettings(id);

            // Cek spam
            if (settings.antispam) {
                const spamCheck = await Group.checkSpam(noTel, id);
                if (spamCheck.isSpam) {
                    await Group.incrementWarning(noTel, id);
                    if (spamCheck.warningCount >= 3) {
                        await sock.groupParticipantsUpdate(id, [noTel], 'remove');
                        await m.reply(`@${noTel.split('@')[0]} telah dikeluarkan karena spam`, true, false);
                        return;
                    }
                    await m.reply(`⚠️ @${noTel.split('@')[0]} Warning ke-${spamCheck.warningCount + 1} untuk spam!`, true, false);
                    return;
                }
            }

            // Cek antilink
            if (settings.antilink && m.body.includes('http')) {
                if (!await m.isAdmin()) {
                    await sock.groupParticipantsUpdate(id, [noTel], 'remove');
                    await m.reply(`@${noTel.split('@')[0]} telah dikeluarkan karena mengirim link`, true, false);
                    return;
                }
            }

            // Cek only admin
            if (settings.only_admin && !(await m.isAdmin())) {
                return;
            }
        }

        // Cek dan buat user jika belum ada
        let user = await User.getUser(noTel);
        if (!user) {
            await User.create(noTel, m.pushName || 'User');
        }

        // Tambah exp untuk setiap pesan (5-15 exp random)
        const expGained = Math.floor(Math.random() * 11) + 5;
        const expResult = await User.addExp(noTel, expGained);

        // Jika naik level, kirim notifikasi
        if (expResult.levelUp) {
            await sock.sendMessage(id, { 
                text: `🎉 Selamat! Level kamu naik ke level ${expResult.newLevel}!`
            });
        }

        // Jika ada command, increment counter command
        if (command.startsWith('!')) {
            await User.incrementCommand(noTel);
        }

        const pluginsDir = path.join(__dirname, 'plugins');
        const plugins = Object.fromEntries(
            await Promise.all(findJsFiles(pluginsDir).map(async file => {
                const { default: plugin, handler } = await import(pathToFileURL(file).href);
                if (Array.isArray(handler) && handler.includes(cmd)) {
                    return [cmd, plugin];
                }
                return [handler, plugin];
            }))
        );

        // Eksekusi plugin
        if (plugins[cmd]) {
            logger.info(`Executing command: ${cmd}`);
            await plugins[cmd]({ sock, m, id, psn: args.join(' '), sender, noTel, attf, cmd });
            logger.success(`Command ${cmd} executed successfully`);
        }

    } catch (error) {
        logger.error(`Error processing message`, error);
    }
}

export async function startBot() {
    try {
        // Check and initialize database
        await checkAndInitDatabase();
        await initializeDefaultData();
        
        const phoneNumber = await getPhoneNumber();
        const bot = new Kanata({ phoneNumber, sessionId: globalThis.sessionName });

        bot.start().then(sock => {
            logger.success('Bot started successfully!');
            logger.divider();
            sock.ev.on('messages.upsert', async chatUpdate => {
                try {
                    const m = chatUpdate.messages[0];

                    const { remoteJid } = m.key;
                    const sender = m.pushName || remoteJid;
                    const id = remoteJid;
                    const noTel = remoteJid.split('@')[0].replace(/[^0-9]/g, '');
                    if (m.message?.imageMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
                        const imageMessage = m.message?.imageMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
                        const imageBuffer = await getMedia({ message: { imageMessage } });
                        const commandImage = m.message?.imageMessage?.caption || m.message.extendedTextMessage?.text;
                        await prosesPerintah({ command: commandImage, sock, m, id, sender, noTel, attf: imageBuffer });
                    }
                    if (m.message?.videoMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage) {
                        const videoMessage = m.message?.videoMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
                        const videoBuffer = await getMedia({ message: { videoMessage } });
                        const commandVideo = m.message?.videoMessage?.caption || m.message.extendedTextMessage?.text;
                        await prosesPerintah({ command: commandVideo, sock, m, id, sender, noTel, attf: videoBuffer });
                    }
                    if (m.message?.audioMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
                        const audioMessage = m.message?.audioMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage;
                        const audioBuffer = await getMedia({ message: { audioMessage } });
                        const commandAudio = m.message?.audioMessage?.caption || m.message.extendedTextMessage?.text;
                        await prosesPerintah({ command: commandAudio, sock, m, id, sender, noTel, attf: audioBuffer });
                    }

                    if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
                        const cmd = JSON.parse(m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson);
                        await prosesPerintah({ command: `!${cmd.id}`, sock, m, id, sender, noTel });
                    }
                    if (m.message?.templateButtonReplyMessage) {
                        const cmd = m.message?.templateButtonReplyMessage?.selectedId;
                        await prosesPerintah({ command: `!${cmd}`, sock, m, id, sender, noTel });
                    }
                    if (m.message?.buttonsResponseMessage) {
                        const cmd = m.message?.buttonsResponseMessage?.selectedButtonId;
                        await prosesPerintah({ command: `!${cmd}`, sock, m, id, sender, noTel });
                    }
                    let botId = sock.user.id.replace(/:\d+/, '')
                    let botMentioned = m.message?.extendedTextMessage?.contextInfo?.participant?.includes(botId)
                        || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botId)
                    let fullmessage = m.message?.conversation || m.message?.extendedTextMessage?.text
                        || m.message?.extendedTextMessage?.contextInfo
                    let ctx = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || ''
                    // auto AI mention
                    if (botMentioned) {
                        try {
                            await sock.sendMessage(id, { text: await gpt4Hika({ prompt: `${fullmessage}  ${ctx}`, id }) })
                        } catch (error) {
                            await sock.sendMessage(id, { text: 'ups,ada yang salah' })

                        }
                    }

                    const chat = await clearMessages(m);
                    if (chat) {
                        const parsedMsg = chat.chatsFrom === "private" ? chat.message : chat.participant?.message;
                        if (tebakSession.has(id)) {
                            await checkAnswer(id, parsedMsg.toLowerCase(), sock, m, noTel);
                        } else {
                            await prosesPerintah({ command: parsedMsg, sock, m, id, sender, noTel });
                        }
                    }

                } catch (error) {
                    logger.error('Error handling message:', error);
                }
            });
            schedulePrayerReminders(sock, globalThis.groupJid);


            sock.ev.on('group-participants.update', ev => groupParticipants(ev, sock));
            sock.ev.on('groups.update', ev => groupUpdate(ev, sock));
            sock.ev.on('call', (callEv) => {
                call(callEv, sock)
            })
        }).catch(error => logger.error('Fatal error starting bot:', error));

    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

startBot();