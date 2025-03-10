import { lol } from "../helper/lolhuman.js";

export async function cerpen() {
    let response = await lol('cerpen')
    let { title, creator, cerpen } = response.data.result
    return `*CERITA PENDEK*\n
Judul : *_${title.trim()}_*\n
Pembuat : *${creator.trim()}*\n
${cerpen}
`

}
export async function kisahNabi(namaNabi) {
    try {
        let response = await lol(`kisahnabi/${namaNabi}`)
        let { name, thn_kelahiran, age, place, story } = response.data.result
        return `*KISAH 25 NABI*\n
Nama : *_${name.trim()}_*\n
Tahun Kelahiran : *_${thn_kelahiran.trim()}_*\n
Umur : *_${age.trim()}_*\n
Tempat : *_${place.trim()}_*\n
Cerita/Kisah : *${creator.trim()}*\n
${cerpen}
`
    } catch (error) {
        throw new Error(`Cerita/kisah ${namaNabi} tidak ditemukan`)
    }

}
export async function quotes() {
    let response = await lol('random/quotes')
    let { by, quote } = response.data.result
    return ` *${quote}* - _${by}_`

}
