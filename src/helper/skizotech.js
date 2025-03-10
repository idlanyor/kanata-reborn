import { skizo } from './skizo.js';


export const tebak = async (url, config = {}) => {
    try {
        return await skizo('game/' + url, config);
        // console.log('game')
        // return await axiosInstance.get('game/' + url, config);
    } catch (error) {
        console.error('Error in tebak request:', error);
        throw error; // Rethrow the error for handling in calling functions
    }
};
export const lol = async (url, config = {}) => {
    try {
        return await axiosInstance.get(url, config);
    } catch (error) {
        console.error('Error in tebak request:', error);
        throw error;
    }
};
export const lolPost = async (url, config = {}) => {
    try {
        return await axiosInstance.post(url, config);
    } catch (error) {
        console.error('Error in tebak request:', error);
        throw error;
    }
};
