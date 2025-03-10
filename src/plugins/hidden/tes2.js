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
  }, { quoted: m });
}
