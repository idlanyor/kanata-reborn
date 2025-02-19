/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : RedNote(Xiaohongshu) Downloader
 * @module : ES6 Module
 * Bebas tempel jangan copot we em-nya 🙇
 */

import axios from "axios";
import * as cheerio from "cheerio"

export const rednote = async (link) => {
    const id = link.match(/\/a\/([^?\/]+)/)
    const response = await axios.get(`http://xhslink.com/a/${id[1]}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
        }
    })
    const skrep = cheerio.load(response.data)
    const title = skrep('head meta[name="og:title"]').attr('content')
    const downloadUrl = skrep('head meta[name="og:video"]').attr('content')
    return { title, downloadUrl }
}

// (async () => {
//     try {
//         const result = await rednote(`http://xhslink.com/a/obIVLxEHlCg4%EF%BC%8C%E5%A4%8D%E5%88%B6%E6%9C%AC%E6%9D%A1%E4%BF%A1%E6%81%AF%EF%BC%8C%E6%89%93%E5%BC%80%E3%80%90%E5%B0%8F%E7%BA%A2%E4%B9%A6%E3%80%91App%E6%9F%A5%E7%9C%8B%E7%B2%BE%E5%BD%A9%E5%86%85%E5%AE%B9%EF%BC%81`);
//         console.log(result);
//     } catch (error) {
//         console.error("Error:", error.message);
//     }
// })();
