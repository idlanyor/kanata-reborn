import { sendIAMessage } from "../../helper/button.js";

export const handler = ['shop']
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    sock.sendMessage(
        m.chat, 
        {
            text: "YOUR TEXT",
            title: "YOUR TITLE",
            subtitle: "YOUR SUBTITLE",
            footer: "FOOTER",
            viewOnce: true,
            shop: 3,
            id: "199872865193",
        },
      {
        quoted : m
      }
    )
};
