import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import fs from 'fs';
import path from 'path';

const apilove = new ILovePDFApi(globalThis.pdf.public, globalThis.pdf.secret);

// const imageToPdf = async (imageBuffer) => {
//     const imgpdf = apilove.newTask('imagepdf');
//     if (!imgpdf) {
//         throw new Error('Failed to create a new task');
//     }
//     try {
//         await imgpdf.start();
//         await imgpdf.addFile(imageBuffer);
//         await imgpdf.process();
//         const downloadBuffer = await imgpdf.download(); // assuming download returns a buffer
//         const filePath = path.join(__dirname, 'output.pdf');
//         fs.writeFileSync(filePath, downloadBuffer);
//         return filePath;
//     } catch (error) {
//         console.error('Error during PDF conversion:', error);
//         throw error;
//     }
// };
const imageToPdf = async (imageBuffer) => {
    const imgpdf = apilove.newTask('imagepdf');
    if (!imgpdf) {
        throw new Error('Failed to create a new task');
    }
    try {
        await imgpdf.start();
        await imgpdf.addFile(imageBuffer);
        await imgpdf.process();
        const downloadBuffer = await imgpdf.download(); // assuming download returns a buffer
        const filePath = path.join(import.meta.dirname, 'output.pdf');
        fs.writeFileSync(filePath, downloadBuffer);
        return filePath;
    } catch (error) {
        console.error('Error during PDF conversion:', error);
        throw error;
    }
};

(async () => {
    try {
        const imageBuffer = fs.readFileSync(path.join(import.meta.dirname, 'image.jpeg')); // Read the image file into a buffer
        const pdfFilePath = await imageToPdf(imageBuffer);
        console.log('PDF saved to:', pdfFilePath);
    } catch (error) {
        console.error('Error:', error);
    }
})();
