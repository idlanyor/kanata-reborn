import { hikaru } from "../../helper/hikaru.js";
import loadAssets from "../../helper/loadAssets.js";
import pkg from '@fizzxydev/baileys-pro';
const { proto, generateWAMessageFromContent } = pkg;

export const handler = "praise";
export const description = "Github Praise";

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        return sock.sendMessage(id, {
            text: "⚠️ Masukkan username GitHub kamu untuk mendapatkan pujian!",
            contextInfo: {
                externalAdReply: {
                    title: '乂 GitHub Praise 乂',
                    body: 'Please provide a GitHub username',
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    }

    try {
        const { data } = await hikaru("aiexperience/github/praising", {
            params: {
                username: psn,
                profile: true,
                language: "id"
            }
        });

        const profile = data.result.profile;
        const message = generateWAMessageFromContent(id, proto.Message.fromObject({
            extendedTextMessage: {
                text: `╭─「 *GITHUB PROFILE* 」
├ 👤 *Name:* ${profile.name || "Not Set"}
├ 📜 *Bio:* ${profile.bio || "Not Set"}
├ 🏢 *Company:* ${profile.company || "Not Set"}
├ 👥 *Followers:* ${profile.followers || "0"}
├ 👤 *Following:* ${profile.following || "0"}
├ 📂 *Public Repos:* ${profile.public_repos || "0"}
│
├ *Praise Message:*
├ ${data.result.praising}
╰──────────────────

_Powered by Kanata-V3_`,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9999999,
                    externalAdReply: {
                        title: `乂 ${profile.name || psn}'s GitHub 乂`,
                        body: `GitHub Profile Information`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: profile.avatar_url || 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: `https://github.com/${psn}`
                    }
                }
            }
        }), { userJid: id, quoted:m });

        await sock.relayMessage(id, message.message, { messageId: message.key.id });

        // Kirim reaksi sukses
        await sock.sendMessage(id, {
            react: {
                text: '🎉',
                key: m.key
            }
        });

    } catch (error) {
        await sock.sendMessage(id, {
            text: "❌ Username tidak ditemukan. Coba periksa kembali ya!",
            contextInfo: {
                externalAdReply: {
                    title: '❌ GitHub Error',
                    body: 'Username not found',
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
