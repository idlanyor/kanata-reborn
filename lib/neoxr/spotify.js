import axios from "axios";

export const spotifySearch = async (name) => {
    try {
        const { data } = await axios.get('https://fastrestapis.fasturl.link/music/spotify', {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            params: {
                name
            }
        })
        return data.result[0].url;
    } catch (error) {
        return error
    }
}

export const spotifySong = async (q) => {
    try {
        // https://api.siputzx.my.id/api/s/spotify?query=serana
        const url = await spotifySearch(q)
        console.log(url);
        // return
        const { data } = await axios.get('https://api.roidev.my.id/api/spotify', {
            params: {
                url
            },

        })
        return {
            thumbnail: data.data.coverImage || 'https://s6.imgcdn.dev/YYoFZh.jpg',
            title: data.data.title || 'GTW Judulnya',
            author: data.data.artist || 'YNTKTS',
            audio: data.data.downloadUrl
        }

    } catch (error) {
        return error
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