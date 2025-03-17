import axios from "axios";
import { spotifyDownload } from "../scraper/spotify.js";

export const spotifySearch = async (name) => {
    try {
        const { data } = await axios.get('https://fastrestapis.fasturl.cloud/music/spotify', {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            params: {
                name
            }
        })
        return data.result
    } catch (error) {
        throw error
    }
}

export const spotifySong = async (q) => {
    try {
        // https://api.siputzx.my.id/api/s/spotify?query=serana
        const result = await spotifySearch(q)
        // return
        const { data } = await spotifyDownload(result[0].url)
        console.log(data)
        // console.log(data);
        return {
            thumbnail: data?.coverImage || 'https://files.catbox.moe/2wynab.jpg',
            title: data?.title || 'GTW Judulnya',
            author: data?.artist || 'YNTKTS',
            audio: data?.downloadUrl
        }

    } catch (error) {
        throw error
    }
}
export const spotifyUrl = async (url) => {
    try {

        const { data } = await spotifyDownload(url)
        // console.log(data);
        return {
            thumbnail: data?.coverImage || 'https://files.catbox.moe/2wynab.jpg',
            title: data?.title || 'GTW Judulnya',
            author: data?.artist || 'YNTKTS',
            audio: data?.downloadUrl
        }

    } catch (error) {
        throw error
    }
}

// export const spotifyCanvas = ({ artist, album, img, timeStart, timeEnd, title }) => {
//     return canvafy.Spotify()
//         .setAlbum(album)
//         .setAuthor(artist)
//         .setImage(img)
//         .setTitle(title)
//         .setTimestamp(timeStart, timeEnd)
//         .setSpotifyLogo(true)
//         .setBlur(5)
// }

// (async () => { console.log(await spotifySong('jkt48 sanjou')) })()