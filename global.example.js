// variabel dasar
globalThis.owner = "Roynaldi";
globalThis.ownerNumber = ["62895395590009", "62"]
globalThis.botNumber = ""
globalThis.botMode = "self"
globalThis.botName = "Kanata"
globalThis.sessionName = 'kanata-bot'
globalThis.groupJid = '0@g.us'
globalThis.communityId = '0@g.us'
globalThis.newsLetterJid = '0@newsletter'
globalThis.newsLetterUrl = 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m'
globalThis.kanataThumb = 'https://files.catbox.moe/2wynab.jpg'


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
