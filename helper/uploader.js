import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
const bufferToReadStream = (buffer, path) => {
    // Simpan buffer iki dadi file sementara nganggo path
    fs.writeFileSync(path, buffer);

    // Convert buffer dadi ReadStream nganggo path
    return fs.createReadStream(path);
};

export const uploadGambar = async (buffer) => {
    try {
        const form = new FormData()
        form.append('file', buffer)
        form.append('api_key', globalThis.apiHelper.imgHippo.apikey)
        const headers = {
            ...form.getHeaders()
        };
        const response = await axios.post(globalThis.apiHelper.imgHippo.baseUrl, form, {
            headers
        })
        return response.data.url
    } catch (error) {
        throw error
    }
}

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
