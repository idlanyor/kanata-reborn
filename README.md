<div align="center">
<h1>🤖 Kanata V3</h1>
<p><i>A powerful WhatsApp bot with modular plugin architecture</i></p>

[![GitHub repo size](https://img.shields.io/github/repo-size/idlanyor/kanata-v2)](https://github.com/idlanyor/kanata-v2)
[![GitHub stars](https://img.shields.io/github/stars/idlanyor/kanata-v2?style=social)](https://github.com/idlanyor/kanata-v2)
[![GitHub license](https://img.shields.io/github/license/idlanyor/kanata-v2)](https://github.com/idlanyor/kanata-v2)
[![Node.js Version](https://img.shields.io/badge/Node.js-14+-43853D?logo=node.js)](https://nodejs.org/)
[![Baileys](https://img.shields.io/badge/Baileys-Latest-blue)](https://github.com/whiskeysockets/baileys)

![Kanata](https://s6.imgcdn.dev/YYoFZh.jpg)

</div>

## ✨ Features

- 🔌 Modular plugin architecture
- 🤖 AI-powered responses using multiple models
- 🖼️ Image manipulation and generation
- 📝 PDF manipulation and conversion
- 🎮 Fun games and interactive commands
- 🔒 Advanced group management
- 📊 Detailed analytics and logging

## 📋 Requirements

- Node.js 14 or higher
- npm or yarn
- A WhatsApp account
- Various API keys (see configuration)

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/idlanyor/kanata-v2.git
cd kanata-v2
```

2. **Install dependencies**
```bash
npm install
# or using yarn
yarn install
```

3. **Configure the bot**
   - Rename `global.example.js` to `global.js`
   - Fill in your API keys and configuration

4. **Start the bot**
```bash
npm start
# or using yarn
yarn start
```

## ⚙️ Configuration

Copy `globalThis.example.js` to `globalThis.js` and configure your settings:

```javascript
// Basic configuration
globalThis.owner = "YOUR_NAME";
globalThis.ownerNumber = ["YOUR_NUMBER","SECOND_NUMBER"]
globalThis.botNumber = ""
globalThis.botName = "Kanata"
globalThis.sessionName = 'kanata-bot'
globalThis.groupJid = '0@g.us'
globalThis.communityId = '0@g.us'
globalThis.newsLetterJid = '0@newsletter'
globalThis.newsLetterUrl = 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
globalThis.kanataThumb = 'https://s6.imgcdn.dev/YYoFZh.jpg'


// Basic functions
globalThis.isOwner = (notel) => {
    return globalThis.ownerNumber.includes(notel)
}

globalThis.isBot = async (notel) => {
    return notel === botNumber
}

globalThis.isGroup = async (jid) => {
    return jid.endsWith('@g.us')
}

// API keys
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

// Paired API keys with baseurl
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

## 🔌 API Integration

Kanata integrates with multiple powerful APIs to provide enhanced functionality:

### AI Services
- 🧠 Google Generative AI - Advanced language processing
- ⚡ Groq - Fast AI inference
- 🤖 Llama - Open-source AI model
- 🚀 Hikaru AI LLM

### Image & Media
- 🖼️ RemoveBG - Background removal
- 📑 ILovePDF - PDF manipulation
- 🎨 Hikaru - AI Media conversion

### Additional Services
- 🚀 Hikaru FastURL
- ⚡ Ryzen Api
- 🛠️ BetaBotz
- 🔧 SkizoTech

## 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/idlanyor">
        <img src="https://github.com/idlanyor.png" width="100px;" alt="Roynaldi"/><br />
        <sub><b>Roynaldi</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/puanmahalini">
        <img src="https://github.com/puanmahalini.png" width="100px;" alt="Puan Mahalini"/><br />
        <sub><b>Puan Mahalini</b></sub>
      </a>
    </td>
  </tr>
</table>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/idlanyor">Roy</a>
</div>
