import { youtubedl, youtubedlv2 } from "@bochilteam/scraper-youtube";

(async () => {
    const data = await youtubedl('https://youtu.be/iik25wqIuFo', 'id')
    console.log(data) // JSON
})()