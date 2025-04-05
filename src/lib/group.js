// import { Welcome } from "./canvafy.js";
import Group from '../database/models/Group.js';

export async function groupUpdate(ev, sock) {
    // console.log('Groups update event:', ev);
    // for (const group of ev) {
    //     console.log(`Group updated: ${group.id}`);
    //     switch (true) {
    //         case group.subject !== undefined:
    //             console.log(`New subject: ${group.subject}`);
    //             break;
    //         case group.announce !== undefined:
    //             await sock.sendMessage(group.id, { text: `Pengumuman: Grup ini sekarang ${group.announce ? 'tertutup' : 'terbuka'} untuk peserta mengirim pesan.` });
    //             console.log(`Group is now ${group.announce ? 'closed' : 'open'} for participants to send messages`);
    //             break;
    //         case group.restrict !== undefined:
    //             await sock.sendMessage(group.id, { text: `Pengaturan grup sekarang ${group.restrict ? 'dibatasi' : 'terbuka'}` });
    //             console.log(`Group settings are now ${group.restrict ? 'restricted' : 'open'}`);
    //             break;
    //         case group.joinApprovalMode !== undefined:
    //             await sock.sendMessage(group.id, { text: `Group join approval mode is now ${group.joinApprovalMode ? 'enabled' : 'disabled'}` });
    //             console.log(`Group join approval mode is now ${group.joinApprovalMode ? 'enabled' : 'disabled'}`);
    //             break;
    //         case group.desc !== undefined:
    //             console.log(`New description: ${group.desc}`);
    //             await sock.sendMessage(group.id, { text: `Deskripsi grup telah diperbarui: ${group.desc}` });
    //             break;
    //         case group.participants !== undefined:
    //             console.log(`Participants updated: ${group.participants}`);
    //             await sock.sendMessage(group.id, { text: `Daftar peserta grup telah diperbarui.` });
    //             break;
    //         case group.memberAddMode !== undefined:
    //             await sock.sendMessage(group.id, { text: `Mode penambahan anggota grup sekarang ${group.memberAddMode ? 'diaktifkan' : 'dinonaktifkan'}` });
    //             console.log(`Group member add mode is now ${group.memberAddMode ? 'enabled' : 'disabled'}`);
    //             break;
    //         case group.owner !== undefined:
    //             console.log(`New owner: ${group.owner}`);
    //             await sock.sendMessage(group.id, { text: `Pemilik grup telah diperbarui: @${group.owner.split('@')[0]}`, mentions: [group.owner] });
    //             break;
    //         case group.icon !== undefined:
    //             console.log(`New group icon: ${group.icon}`);
    //             await sock.sendMessage(group.id, { text: `Ikon grup telah diperbarui.` });
    //             break;
    //         case group.suspended !== undefined:
    //             console.log(`Group suspended status: ${group.suspended}`);
    //             await sock.sendMessage(group.id, { text: `Status grup sekarang ${group.suspended ? 'ditangguhkan' : 'aktif'}` });
    //             break;
    //         case group.inviteCode !== undefined:
    //             console.log(`New invite code: ${group.inviteCode}`);
    //             await sock.sendMessage(group.id, { text: `Kode undangan grup telah diperbarui: ${group.inviteCode}` });
    //             break;
    //         case group.ephemeral !== undefined:
    //             console.log(`Ephemeral settings updated: ${group.ephemeral}`);
    //             await sock.sendMessage(group.id, { text: `Pengaturan pesan sementara grup telah diperbarui.` });
    //             break;
    //     }

    // }
}
export async function groupParticipants(ev, sock) {
    console.log('Group participants update event:', ev);
    const { id, participants, action } = ev;
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;
    console.log(groupMetadata);

    // Dapatkan pengaturan grup
    const settings = await Group.getSettings(id);

    const sendMessage = async (participant, messageContent) => {
        const messageOptions = {
            ...messageContent,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 256,
                externalAdReply: {
                    showAdAttribution: true,
                    title: 'Kanata-V3',
                    body: groupName,
                    mediaType: 1,
                    thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                    renderLargerThumbnail: true
                },
            }
        };
        await sock.sendMessage(id, messageOptions);
        console.log(`Sent ${action} message to: ${participant}`);
    };

    for (const participant of participants) {
        const userId = participant.split('@')[0];

        switch (action) {
            case 'add':
                if (settings.welcome) {
                    const welcomeMsg = {
                        text: `╭─────────────────╮
│    *WELCOME MEMBER*
╰─────────────────╯

${settings.welcome_message.replace('@user', `@${userId}`).replace('@group', groupName)}

─────────────────
_Powered by Kanata-V3_`,
                        mentions: [participant]
                    };
                    await sendMessage(participant, welcomeMsg);
                }
                break;

            case 'remove':
                if (settings.goodbye) {
                    const goodbyeMsg = {
                        text: `╭─────────────────╮
│    *GOODBYE* 👋
╰─────────────────╯

😢 Selamat tinggal @${userId}
Semoga kita berjumpa lagi!

👥 *Anggota tersisa:* ${groupMetadata.participants.length}

${settings.goodbye_message.replace('@user', `@${userId}`).replace('@group', groupName)}

─────────────────
_Powered by Kanata-V3_`,
                        mentions: [participant]
                    };
                    await sendMessage(participant, goodbyeMsg);
                }
                break;

            case 'promote':
                const promoteMsg = {
                    text: `╭─────────────────╮
│    *NEW ADMIN* 👑
╰─────────────────╯

🎉 Selamat @${userId}!
Anda telah dipromosikan menjadi admin grup.

📢 *Grup:* ${groupName}
👥 *Total Admin:* ${groupMetadata.participants.filter(p => p.admin).length}

─────────────────
_Powered by Kanata-V3_`,
                    mentions: [participant]
                };
                await sendMessage(participant, promoteMsg);
                break;

            case 'demote':
                const demoteMsg = {
                    text: `╭─────────────────╮
│    *ADMIN DEMOTED* ⚠️
╰─────────────────╯

@${userId} telah diturunkan dari posisi admin.

📢 *Grup:* ${groupName}
👥 *Total Admin:* ${groupMetadata.participants.filter(p => p.admin).length}

─────────────────
_Powered by Kanata-V3_`,
                    mentions: [participant]
                };
                await sendMessage(participant, demoteMsg);
                break;
        }
    }
}

async function promote(jid, participants, sock) {
    return await sock.groupParticipantsUpdate(jid, [participants], 'promote')
}
async function demote(jid, participants, sock) {
    return await sock.groupParticipantsUpdate(jid, [participants], 'demote')
}

export const grupAction = {
    promote, demote
}


