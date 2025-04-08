import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
const bufferToReadStream = (buffer, path) => {
    // Simpan buffer iki dadi file sementara nganggo path
    fs.writeFileSync(path, buffer);

    // Convert buffer dadi ReadStream nganggo path
    return fs.createReadStream(path);
};
export const uploadFile = async (buffer, filename) => {
    try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, {
            filename: filename || 'file' + path.extname(filename || '.bin')
        });

        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};
/**
 * Fungsi buat upload gambar ke catbox.moe
 * @param {Buffer} buffer - Buffer data gambar yang mau di-upload
 * @returns {Promise<string>} - URL file yang di-upload
 */
export const uploadGambar = async (buffer) => {
    try {
        // Bikin instance FormData baru
        const form = new FormData();
        // Tambahin field 'reqtype' dengan nilai 'fileupload'
        form.append('reqtype', 'fileupload');
        // Tambahin field 'fileToUpload' dengan buffer data gambar
        form.append('fileToUpload', buffer, {
            filename: 'upload.jpg' // Nama file yang di-upload
        });

        // Kirim request POST ke API catbox.moe
        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        // Balikin URL file yang di-upload
        return response.data;
    } catch (error) {
        // Lempar error kalo ada masalah waktu upload
        throw error;
    }
};

export const uploadGambar2 = async (buffer) => {
    try {
        const readStream = bufferToReadStream(buffer, `/tmp/kanata_temp${Math.floor(Math.random() * 1000)}.jpg`);
        const form = new FormData()
        form.append('file', readStream)
        const headers = {
            ...form.getHeaders()
        };
        const { data } = await axios.post('https://fastrestapis.fasturl.cloud/downup/uploader-v2', form, {
            headers
        })
        return data.result
    } catch (error) {
        throw error
    }
}

// (async () => {
//     try {
//         await fs.promises.access('./kanata.jpg');

//         const result = await uploadGambar2(fs.createReadStream('./kanata.jpg'));
//         console.log(result);
//     } catch (error) {
//         console.error('Error uploading file:', error)
//     }
// })()
