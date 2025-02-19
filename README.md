<div align="center">
<h1>Kanata V3</h1>
<h2 style="color:#1496DC">by Roy</h2>

![GitHub repo size](https://img.shields.io/github/repo-size/idlanyor/kanata-v2)
![GitHub stars](https://img.shields.io/github/stars/idlanyor/kanata-v2?style=social)
![GitHub license](https://img.shields.io/github/license/idlanyor/kanata-v2)

![Kanata](https://s6.imgcdn.dev/YYoFZh.jpg)

</div>


This is a project that demonstrates how to use plugin modular stucture to make a Bot Whatsapp using Baileys

## Requirements

In order to run this project, you will need to have Node.js and NPM installed on your system.

## Installation

To install the required dependencies, run the following command in your terminal:

```bash
npm install
```

## Usage

To use this project, you will need to set up a Various API key. You can do this by renaming a file called `globalThis.example.js` to `globalThis.js` in the root directory of the project and adding the following code to it:

```javascript
// variabel dasar
globalThis.owner = "Roynaldi";
globalThis.ownerNumber = ["62895395590009","62"]
globalThis.botNumber = ""
globalThis.botName = "Kanata"
globalThis.sessionName = 'kanata-bot'
globalThis.groupJid = '0@g.us'
globalThis.communityId = '0@g.us'
globalThis.newsLetterJid = '0@newsletter'
globalThis.newsLetterUrl = 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
globalThis.kanataThumb = 'https://s6.imgcdn.dev/YYoFZh.jpg'


// fungsi dasar
globalThis.isOwner = (notel) => {
    return globalThis.ownerNumber.includes(notel)
}

globalThis.isBot = async (notel) => {
    return notel === botNumber
}

globalThis.isGroup = async (jid) => {
    return jid.endsWith('@g.us')
}

// variabel apikey
globalThis.apiKey = {
    gemini: '',
    removeBG: '',
    llama: '',
    groq: '',
    pdf: {
        secret: '',
        public: ''
    }
}
globalThis.hikaru = 'https://fastrestapis.fasturl.cloud/'

// variabel paired apikey with baseurl
globalThis.apiHelper = {
    medanpedia: {
        baseurl: 'https://api.medanpedia.co.id/',
        apiId: '',
        apiKey: ''
    },
    lolhuman: {

        apikey: '',

        baseUrl: 'https://api.lolhuman.xyz/api/'

    },
    neoxr: {

        apikey: '',

        baseUrl: 'https://api.neoxr.eu/api/'

    },
    ryzen: {

        apikey: '',

        baseUrl: 'https://api.ryzendesu.vip/api/'

    },
    fastapi: {

        apikey: '',

        baseUrl: 'https://fastrestapis.fasturl.cloud/'

    },

    betabotz: {

        apikey: '',

        baseUrl: 'https://api.betabotz.eu.org/api/'

    },

    skizotech: {

        apikey: '',

        baseUrl: 'https://skizoasia.xyz/api/'

    },
    nyxs: {
        apikey: '',
        baseUrl: 'https://api.nyxs.pw/'
    }

}

```

Replace all value wit your own.

After that, you can start the project by running the following command in your terminal:

```bash
npm start
```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Api Used

- [Google Generative AI](https://github.com/GoogleCloudPlatform/generative-ai)
- [Groq](https://groq.com/)
- Hikaru FastURL
- Ryzen Api
- [RemoveBG](https://www.remove.bg/id/api)
- [ILovePDF](https://www.iloveapi.com/)
- [BetaBotz](https://api.betabotz.eu.org/)
- [SkizoTech](https://skizo.tech/)
- [LolHuman](https://api.lolhuman.xyz/)

## Contributors
- [Roynaldi](https://github.com/idlanyor)
- [Puan Mahalini](https://github.com/puanmahalini)
