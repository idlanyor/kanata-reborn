import { vcard } from "../../lib/owner/ownerContact.js"
export const description = "Owner Contact";
export const handler = "owner"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    await sock.sendMessage(
        id,
        {
            contacts: {
                displayName: 'Roy',
                contacts: [{ vcard }]
            }
        }
    )
}