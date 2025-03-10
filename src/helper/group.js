import { sanitizeBotId } from "./bot.js"

export const getGroupMetadata = async ({ sock, id }) => {
    let metadata = await sock.groupMetadata(id)
    return {
        id: metadata.id,
        subject: metadata.subject,
        subjectOwner: metadata.subjectOwner,
        subjectTime: metadata.subjectTime,
        size: metadata.size,
        creation: metadata.creation,
        owner: metadata.owner,
        desc: metadata.desc,
        descId: metadata.descId,
        linkedParent: metadata.linkedParent,
        restrict: metadata.restrict,
        announce: metadata.announce,
        isCommunity: metadata.isCommunity,
        isCommunityAnnounce: metadata.isCommunityAnnounce,
        joinApprovalMode: metadata.joinApprovalMode,
        memberAddMode: metadata.memberAddMode,
        participants: metadata.participants,
        ephemeralDuration: metadata.ephemeralDuration
    }

}
export const isBotAdmin = async ({ sock, id }) => {
    let metadata = await getGroupMetadata(sock, id)
    return metadata.participants.find(v => v.id == sanitizeBotId(sock.user.id)).admin
}
export const isAdmin = async ({ sock, id, sender }) => {
    let metadata = await getGroupMetadata(sock, id)
    return metadata.participants.find(v => v.id == sender).admin
}
export const isSuperAdmin = async ({ sock, id, sender }) => {
    let metadata = await getGroupMetadata(sock, id)
    return metadata.participants.find(v => v.id == sender).admin == 'superadmin'
}
export const isOwnerGrup = async ({ sock, id, sender }) => {
    let metadata = await getGroupMetadata(sock, id)
    return metadata.owner == sender
}
export const isGroup = async ({ sock, id }) => {
    let metadata = await getGroupMetadata(sock, id)
    return metadata.id.endsWith('@g.us')
}
