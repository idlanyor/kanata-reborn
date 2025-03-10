export const description = "Switch Owner Bot";
export const handler = "switch"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    console.log(isOwner(noTel))
    if (!globalThis.isOwner(noTel)) {
        await sock.sendMessage(id, { text: 'Kamu bukan owner bot' })
        return
    }
    await sock.sendMessage(id, { text: 'Bot berhasil ditukar' })
};
