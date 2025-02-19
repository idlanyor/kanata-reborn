/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Threads Downloader
 * @module : ES6 Module
 * Bebas tempel jangan copot we em-nya 🙇
 */

import axios from "axios";
import * as cheerio from 'cheerio'

export const threads = async (link) => {
    const id = link.match(/\/post\/([^?\/]+)/)
    const response = await axios.get(`https://threadster.app/download/${id[1]}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
        }
    })
    const skrep = cheerio.load(response.data)
    const title = skrep('body section.download_result_section div.container div.download__item__caption__text').text()
    const author = skrep('body section.download_result_section div.download__item__profile_pic div span').text()
    const downloadUrl = skrep('body section.download_result_section div.download_item_info table tbody tr td a.download__item__info__actions__button').attr('href')
    return { title, author, downloadUrl }
}

// (async () => {
//     try {
//         const result = await threads('https://www.threads.net/@budikuang/post/DFDaS9UyhbJ?xmt=AQGzTcf8Jg0MTzaOE7JWGSYs5EyzaAcIrlfk9-z635Texw');
//         console.log(result);
//     } catch (error) {
//         console.error("Error:", error.message);
//     }
// })();
