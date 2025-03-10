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


