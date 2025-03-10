import '../global.js'
import axios from 'axios';
const axiosInstance = axios.create({
    baseURL: globalThis.apiHelper.ryzen.baseUrl,
    headers: {
        'Accept': 'application/json',
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    }
});

export const ryzen = async (url, config = {}) => {
    try {
        return await axiosInstance.get(url, config);
    } catch (error) {
        console.error('Error in ryzendesu request:', error);
        throw error;
    }
};

