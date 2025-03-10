import '../global.js'
import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: globalThis.apiHelper.betabotz.baseUrl,
    params: {
        apikey: globalThis.apiHelper.betabotz.apikey
    }
})

export const beta = async (url, config) => {
    try {
        return await axiosInstance.get(url, config);
    } catch (error) {
        console.error('Error in beta request:', error);
        throw error;
    }
}
export const betaDownload = async (url, config) => {
    try {
        return await axiosInstance.get('download/' + url, config);
    } catch (error) {
        console.error('Error in beta download request:', error);
        throw error;
    }
}

