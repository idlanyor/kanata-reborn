import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: globalThis.apiHelper.skizotech.baseUrl,
    params: {
        apikey: globalThis.apiHelper.skizotech.apikey
    }
});

export const skizo = async (url, config = {}) => {
    try {
        return await axiosInstance.get(url, config);
    } catch (error) {
        console.error('Error in skizo request:', error);
        throw error;
    }
};
export const skizoGame = async (url, config = {}) => {
    try {
        return await axiosInstance.get(`game/${url}`, config);
    } catch (error) {
        console.error('Error in skizo request:', error);
        throw error;
    }
};
