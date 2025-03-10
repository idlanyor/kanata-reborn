import axios from 'axios';
import FormData from 'form-data';

export async function removeBg(blob, color) {
    let bgColor;
    if (color === "merah") {
        bgColor = "#DB1614"
    } else if (color === "biru") {
        bgColor = "#0D6EFD"
    } else {
        bgColor = ""
    }
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('bg_color', bgColor);
    formData.append('image_file', blob);

    try {
        const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': globalThis.apiKey.removeBG
            },
            responseType: 'arraybuffer',
        });

        return response.data;
    } catch (error) {
        throw new Error(`${error.response.status}: ${error.response.statusText}`);
    }
}

// export async function removebg(sock, m, chatUpdate) {
//     if (chatUpdate.messages[0].message?.imageMessage?.caption == 'rem' && chatUpdate.messages[0].message?.imageMessage) {

//         const mediaData = await getMedia(m)
//         if (!mediaData) {
//             console.log('Media data not found');
//             return;
//         }


//         try {
//             let response = await removeBg(mediaData)
//             await sock.sendMessage(m.key.remoteJid, {
//                 document: response,
//                 mimetype: 'image/png',
//                 fileName: `KanataGhoib-${Math.random(3 * 5)}.png`
//             });
//         } catch (error) {
//             console.log('Error removing background:', error);
//         }
//     }
// }