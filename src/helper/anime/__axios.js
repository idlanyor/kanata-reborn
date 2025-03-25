import '../../global.js'
import axios from "axios";

const __axios = axios.create({
    baseURL: globalThis.ryzen.backendURL
})

export const ryzenNime = async (url, conf) => {
    return await __axios.get(url, conf)
}