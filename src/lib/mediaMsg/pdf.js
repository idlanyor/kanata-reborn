import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import { getMedia } from "../../helper/mediaMsg.js";
const pdfClient = new ILovePDFApi(globalThis.pdf.public, globalThis.pdf.secret)

export const imageToPdf = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        try {
            if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
                throw new Error('Invalid file buffer provided');
            }

            let imgToPdf = pdfClient.newTask('imagepdf');

            if (!imgToPdf) {
                throw new Error('Failed to create a new task');
            }

            imgToPdf.start()
                .then(() => {
                    return imgToPdf.addFile(fileBuffer);
                })
                .then(() => {
                    return imgToPdf.process();
                })
                .then(() => {
                    return imgToPdf.download();
                })
                .then((result) => {
                    if (!result) {
                        throw new Error('Failed to download the PDF');
                    }
                    resolve(result);
                })
                .catch((error) => {
                    console.error('Error in imageToPdf function:', error);
                    reject(new Error('Failed to convert image to PDF: ' + error.message));
                });
        } catch (error) {
            console.error('Error in imageToPdf function:', error);
            reject(new Error('Failed to convert image to PDF: ' + error.message));
        }
    });
};

export const pdfToImage = async (fileBuffer) => {
    try {
        let pdfToImg = pdfClient.newTask('pdfimage');
        await pdfToImg.addFile(fileBuffer);
        await pdfToImg.process();
        return await pdfToImg.download();
    } catch (error) {
        throw new Error('Failed to convert PDF to image: ' + error.message);
    }
}




export async function gambarPdf(sock, m, chatUpdate) {
    try {
        const imageMessage = chatUpdate.messages[0].message?.imageMessage;
        if (imageMessage?.caption === 'topdf') {
            const mediaData = await getMedia(m);
            if (!mediaData) {
                console.error('Media data not found');
                await sock.sendMessage(m.key.remoteJid, { text: 'Media data not found' });
                return;
            }

            try {
                // const resizedImage = await sharp(mediaData)
                //     .resize(800, 800, { // Change the dimensions as needed
                //         fit: sharp.fit.inside,
                //         withoutEnlargement: true
                //     })
                //     .toBuffer();
                let document = await imageToPdf(mediaData);
                await sock.sendMessage(m.key.remoteJid, { document: document });
            } catch (error) {
                await sock.sendMessage(m.key.remoteJid, { text: 'Error converting to PDF: ' + error.message });
                console.error('Error converting to PDF:', error);
            }
        }
    } catch (error) {
        console.error('Error in gambarPdf function:', error);
        await sock.sendMessage(m.key.remoteJid, { text: 'An error occurred: ' + error.message });
    }
}