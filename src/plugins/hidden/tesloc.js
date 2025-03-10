import { getBuffer } from "../../helper/mediaMsg.js";
export const handler = 'poll'
export const description = ''
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    await sock.sendMessage(id, {
        caption:'Lorem',
        location: {
            degreesLatitude: -7.2263672241412324,
            degreesLongitude: 109.36419066123185,
            name: 'Lorem Ipsum',
            address: 'Kanata V3',
            // jpegThumbnail: 'https://telegra.ph/file/a6f3ef42e42efcf542950.jpg',
            url: 'https://roidev.my.id',
        },
        // thumbnail: 'https://telegra.ph/file/a6f3ef42e42efcf542950.jpg',
        buttons: [
            {
                buttonId: 'owner',
                buttonText: {
                    displayText: 'Owner Contact'
                },
                type: 1,
            }
        ],
        headerType: 1,
        viewOnce: true
    })
};
