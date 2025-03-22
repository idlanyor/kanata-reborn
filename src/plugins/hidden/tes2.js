export const handler = 'tess'
export const description = 'testing'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
  sock.sendMessage(id, {
    text: "Hello sigma",
    footer: 'Hallo',
    buttons: [
      {
        buttonId: '.ping',
        buttonText: {
          displayText: 'response'
        },
        type: 1,
      },
      {
        buttonId: '.owner',
        buttonText: {
          displayText: 'creator'
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
                title: 'Kont',
                highlight_label: '!',
                rows: [
                  {
                    header: 'all feature',
                    title: '',
                    description: 'Display to menu',
                    id: 'menu',
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
  }, { quoted: {
            key: {
                remoteJid: 'status@broadcast',
                participant: "13135550002@s.whatsapp.net",
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363293401077915@newsletter',
                    newsletterName: 'Roy',
                    caption: 'Kanata V3'
                }
            }
        } });
}
