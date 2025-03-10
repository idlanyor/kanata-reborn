import { sendIAMessage } from "../../helper/button.js";

export const handler = ['test']
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    const btns = [
        {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: 'title',
                sections: [
                    {
                        title: 'title',
                        highlight_label: 'label',
                        rows: [
                            {
                                header: 'header',
                                title: 'title',
                                description: 'description',
                                id: null,
                            },
                            {
                                header: 'header',
                                title: 'zzzz',
                                description: 'description',
                                id: null,
                            },
                        ],
                    },
                ],
            }),
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: 'quick reply',
                id: null,
            }),
        },
        {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: 'url',
                url: 'https://www.google.com',
                merchant_url: 'https://www.google.com',
            }),
        },
        {
            name: 'cta_call',
            buttonParamsJson: JSON.stringify({
                display_text: 'call',
                id: '628999',
            }),
        },
        {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
                display_text: 'copy',
                id: '123456789',
                copy_code: 'message',
            }),
        },
        {
            name: 'cta_reminder',
            buttonParamsJson: JSON.stringify({
                display_text: 'reminder',
                id: 'message',
            }),
        },
        {
            name: 'cta_cancel_reminder',
            buttonParamsJson: JSON.stringify({
                display_text: 'cancel reminder',
                id: 'message',
            }),
        },
        {
            name: 'address_message',
            buttonParamsJson: JSON.stringify({
                display_text: 'address message',
                id: 'indonesia',
            }),
        },
        {
            name: 'send_location',
            buttonParamsJson: '',
        },
    ];
    await sendIAMessage(id, btns, m, {
        header: '',
        content: 'content',
        footer: 'footer',
        /* image: q.thumb2,
          mediaType: "image" */
    }, sock);
};
