export async function call(ev,sock) {
    const notifiedJids = new Set();
    // Function to sanitize JID
    const sanitizeJid = (jid) => {
        if (jid.includes(':')) {
            return jid.split(':')[0] + '@s.whatsapp.net';
        }
        return jid;
    };
    for (const callEvent of ev) {
        console.log(`Received call from: ${callEvent.from}`);
        console.log(`Status: ${callEvent.status}`);

        // Check if the event is a reject and the message has not been sent yet
        if (callEvent.status === 'reject') {
            const jidToBlock = sanitizeJid(callEvent.from);
            if (!notifiedJids.has(jidToBlock)) {
                try {
                    // Send message
                    let text = '*Pesan ini dikirim oleh Bot*\n';
                    text += 'Owner sedang tidak bisa menerima panggilan, silahkan tinggalkan pesan anda di sini';
                    text += '\n\n _Kanata Bot v0.1.2_';
                    await sock.sendMessage(jidToBlock, { text });

                    // Mark the JID as notified
                    notifiedJids.add(jidToBlock);
                    console.log(`Sent message to: ${jidToBlock}`);
                } catch (error) {
                    console.error(`Failed to send message to: ${jidToBlock}`, error);
                }
            }
        }
    }
}