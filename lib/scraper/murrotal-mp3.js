import * as cheerio from "cheerio";
import axios from "axios";
import { surahNames } from "../helper/surahname.js";

const baseURL = 'https://islamdownload.net/'

export const getMp3Murotal = async () => {
    try {
        const { data } = await axios.get(baseURL + '124158-murottal-misyari-rasyid-mishary-rashid.html',
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                }
            });

        const $ = cheerio.load(data);
        const result = [];

        $('tr').each((i, row) => {
            const fileElement = $(row).find('a');
            const sizeElement = $(row).find('td div[align="right"]');

            if (fileElement.length && sizeElement.length) {
                const fileName = fileElement.text().trim();
                const surahNumber = fileName.split("_")[0];
                const surahName = surahNames[surahNumber]?.name || "Unknown";

                result.push({
                    name: `${surahNumber} - ${surahName}`,
                    file: fileName,
                    url: fileElement.attr('href'),
                    size: sizeElement.text().trim()
                });
            }
        });

        if (result.length === 0) {
            return {
                status: false,
                message: "No Murrotal MP3 files found",
                data: null,
                error: "No content available"
            };
        }

        return {
            status: true,
            message: "Success fetching Murrotal MP3 list",
            data: {
                total: result.length,
                reciter: "Misyari Rasyid",
                files: result
            },
            error: null
        };
    } catch (error) {
        return {
            status: false,
            message: "Failed to fetch Murrotal MP3 list",
            data: null,
            error: error.message
        };
    }
};

// (async () => console.log(await getMp3Murotal()))()