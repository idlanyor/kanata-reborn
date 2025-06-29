/**
 * @author : Roy~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : JKT 48 Official Site Scraper
 * @module : ES6 Module
 * Bebas tempel jangan copot we em-nya 🙇
 */
import {  proto, prepareWAMessageMedia } from '@fizzxydev/baileys-pro';

import { detailMember } from "../../lib/scraper/jkt48.js";

export const handler = 'dmjkt'
export const description = 'Detail Member JKT48'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    const dmJkt = await detailMember(psn)
    let roy = `*[DETAIL MEMBER JKT48]* \nNama : ${dmJkt.info['Nama']} \nTanggal Lahir ${dmJkt.info['Tanggal Lahir']} \nGolongan Darah : ${dmJkt.info['Golongan Darah']}\nHoroskop : ${dmJkt.info['Horoskop']}\nTinggi Badan : ${dmJkt.info['Tinggi Badan']} \nNama Panggilan : ${dmJkt.info['Nama Panggilan']} \n`;

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                "messageContextInfo": {
                    "deviceListMetadata": {},
                    "deviceListMetadataVersion": 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: roy
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: '©️ JKT48 Indonesia'
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        subtitle: sender,
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia({ image: { url: `https://jkt48.com${dmJkt.imageUrl}` } }, { upload: sock.waUploadToServer }))
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [

                            {
                                "name": "cta_url",
                                "buttonParamsJson": JSON.stringify({
                                    display_text: dmJkt.socialMedia.Twitter.username,
                                    url: dmJkt.socialMedia.Twitter.link,
                                    merchant_url: dmJkt.socialMedia.Twitter.link,
                                })
                            },
                            {
                                "name": "cta_url",
                                "buttonParamsJson": JSON.stringify({
                                    display_text: `Instagram : ${dmJkt.socialMedia.Instagram.username}`,
                                    url: dmJkt.socialMedia.Instagram.link,
                                    merchant_url: dmJkt.socialMedia.Instagram.link,
                                })
                            },
                            {
                                "name": "cta_url",
                                "buttonParamsJson": JSON.stringify({
                                    display_text: `Tiktok : ${dmJkt.socialMedia.Tiktok.username}`,
                                    url: dmJkt.socialMedia.Tiktok.link,
                                    merchant_url: dmJkt.socialMedia.Tiktok.link,
                                })
                            }
                        ]
                    })
                })
            }
        }
    }, { quoted:m });
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    await sock.relayMessage(id, msg.message, {
        messageId: msg.key.id
    });
    await sock.sendMessage(id, { react: { text: '✅', key: m.key } })
};
