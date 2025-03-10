
export const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
    + 'VERSION:3.0\n'
    + 'FN:Roy\n' // full name
    + 'ORG:KanataBot;\n' // the organization of the contact
    + `TEL;type=CELL;type=VOICE;waid=${globalThis.ownerNumber}:+${globalThis.ownerNumber}\n` // WhatsApp ID + phone number
    + 'END:VCARD'
