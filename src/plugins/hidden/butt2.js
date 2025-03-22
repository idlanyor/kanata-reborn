export const handler = 'tesbut'
export const description = 'y'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
  await sock.sendMessage(m.chat, {
    text: "Hello World !;",
    footer: "© Kanata",
    buttons: [
      {
        buttonId: '.tes',
        buttonText: {
          displayText: 'TESTING BOT'
        },
        type: 1,
      },
      {
        buttonId: ' ',
        buttonText: {
          displayText: 'PRIVATE SCRIPT'
        },
        type: 1,
      },
      {
        buttonId: 'action',
        buttonText: {
          displayText: 'ini pesan interactiveMeta'
        },
        type: 4,
        nativeFlowInfo: {
          name: 'single_select',
          paramsJson: JSON.stringify({
            title: 'message',
            sections: [
              {
                title: 'Kanata - V3',
                highlight_label: '😜',
                rows: [
                  {
                    header: 'HEADER',
                    title: 'TITLE',
                    description: 'DESCRIPTION',
                    id: 'YOUR ID',
                  },
                  {
                    header: 'HEADER',
                    title: 'TITLE',
                    description: 'DESCRIPTION',
                    id: 'YOUR ID',
                  },
                ],
              },
            ],
          }),
        },
      },
    ],
    headerType: 1,
    viewOnce: true
  }, { quoted:m });
};
