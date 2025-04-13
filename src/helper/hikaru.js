import '../global.js'
import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: globalThis.hikaru
})

export const hikaru = async (url, config) => {
    try {
        return await axiosInstance.get(url, config);
    } catch (error) {
        console.error('Error in hikaru request:', error);
        throw error;
    }
}
export const game = async (q, config) => {
    try {
        return (await axiosInstance.get('/game/' + q, config)).data.result;
    } catch (error) {
        console.error('Error in game request:', error);
        throw error;
    }
}

// (async () => {
//     const result = await game('tebakgambar');
//     console.log(result);
// })();