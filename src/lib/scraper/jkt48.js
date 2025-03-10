/**
 * @author : idlanyor~VC~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : JKT 48 Official Site Scraper
 * @module : ES6 Module
 * Bebas tempel jangan copot we em-nya 🙇
 */
import * as cheerio from 'cheerio'
import axios from 'axios'
const baseurl = 'https://jkt48.com/'
const jeketi = axios.create({
    baseURL: baseurl,
})

export const memberJkt = async () => {
    try {
        const { data } = await jeketi.get('member/list', {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml",
            },
            params: {
                lang: 'id'
            }
        })
        const skrep = cheerio.load(data)
        const members = []
        skrep('div.entry-contents__main-area .entry-member').each((index, element) => {
            const memberIdMatch = skrep(element).find('a').attr('href')?.match(/\/id\/(\d+)\?/)
            if (!memberIdMatch) return

            const memberId = memberIdMatch[1]
            const name = skrep(element)
                .find('.entry-member__name a')
                .text().replace(/([a-z])([A-Z])/g, '$1 $2')
            const imageUrl = skrep(element).find('img').attr('src')

            if (memberId && name && imageUrl) {
                members.push({ memberId, name, imageUrl })
            }
        })

        if (members.length === 0) {
            return {
                status: false,
                message: "No JKT48 members found",
                data: null,
                error: "No content available"
            }
        }

        return {
            status: true,
            message: "Success fetching JKT48 members list",
            data: {
                total: members.length,
                members: members
            },
            error: null
        }
    } catch (error) {
        return {
            status: false,
            message: "Failed to fetch JKT48 members list",
            data: null,
            error: error.message
        }
    }
}

export const detailMember = async (memberId) => {
    try {
        const { data } = await jeketi.get(`member/detail/id/${memberId}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml",
            },
            params: {
                lang: 'id'
            }
        })
        const skrep = cheerio.load(data)
        const info = {}
        const socialMedia = {}
        const imageUrl = skrep('div.entry-contents__main-area img').attr('src')

        if (!imageUrl) {
            return {
                status: false,
                message: "Member not found or invalid member ID",
                data: null,
                error: "Member not found"
            }
        }

        skrep('.entry-mypage__history').each((index, element) => {
            const platform = skrep(element).find('h3').text().trim()
            const link = skrep(element).find('a').attr('href')
            const username = skrep(element).find('a').text().trim()

            if (platform && link && username) {
                socialMedia[platform] = {
                    username: username,
                    link: link
                }
            }
        })

        skrep('.entry-mypage__item').each((index, element) => {
            const subject = skrep(element).find('.entry-mypage__item--subject').text().trim()
            const content = skrep(element).find('.entry-mypage__item--content').text().trim()
            if (subject && content) {
                info[subject] = content
            }
        })

        return {
            status: true,
            message: "Success fetching member details",
            data: {
                memberId,
                imageUrl,
                info,
                socialMedia
            },
            error: null
        }
    } catch (error) {
        return {
            status: false,
            message: "Failed to fetch member details",
            data: null,
            error: error.message
        }
    }
}

// (async () => { console.log(await detailMember(252)) })()