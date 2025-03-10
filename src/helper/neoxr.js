import '../global.js'
import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: globalThis.apiHelper.neoxr.baseUrl,
    params: {
        apikey: globalThis.apiHelper.neoxr.apikey
    }
})

export const neo = async (url, config) => {
    try {
        return await axiosInstance.get(url, config);
    } catch (error) {
        console.error('Error in neo request:', error);
        throw error;
    }
}
export const neoDownload = async (url, config) => {
    try {
        return await axiosInstance.get('download/' + url, config);
    } catch (error) {
        console.error('Error in neo download request:', error);
        throw error;
    }
}

