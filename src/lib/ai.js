import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { skizo } from "../helper/skizo.js";
import axios from "axios";
import { hikaru } from "../helper/hikaru.js";

// skizo
export async function dalle3(prompt) {
    try {
        return (await skizo('dalle3', { params: { prompt: encodeURIComponent(prompt) } })).data.url
    } catch (error) {
        console.error('Terjadi Kesalahan', error)
    }
}
// console.log(await dalle3('anime loli kawaii'));


// text generation
// gemini
const aigem = new GoogleGenerativeAI(globalThis.apiKey.gemini)
const gem = aigem.getGenerativeModel({ model: 'gemini-1.5-flash' })
export async function gemini(prompt) {
    const result = await gem.generateContent(prompt);
    return result.response.text()
}


// groq
// gemmaGroq
const groq = new Groq({ apiKey: globalThis.apiKey.groq })
export async function qwenGroq(content) {
    const cc = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: 'Namamu adalah Kanata Bot,sebuah bot AI canggih yang dikembangkan oleh Roynaldi @62895395590009,kamu bisa menerangkan sesuatu secara informatif dan mudah dipahami,kamu selalu merespons percakapan dalam bahasa gaul seperti gw untuk aku,dan lu untuk kamu,selalu sertakan emoji saat membalas pesan user'
            },
            {
                role: 'user',
                content
            }
        ],
        model: 'qwen-2.5-coder-32b'
    })
    return cc.choices[0].message.content
}
// qwengroq
export async function depsegsGroq(content) {
    const cc = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: 'Namamu adalah Kanata Bot,sebuah bot AI canggih yang dikembangkan oleh Roynaldi @62895395590009,kamu bisa menerangkan sesuatu secara informatif dan mudah dipahami,kamu selalu merespons percakapan dalam bahasa gaul seperti gw untuk aku,dan lu untuk kamu,selalu sertakan emoji saat membalas pesan user'
            },
            {
                role: 'user',
                content
            }
        ],
        model: 'deepseek-r1-distill-qwen-32b'
    })
    return cc.choices[0].message.content
}
// depsegsGroq
export async function gemmaGroq(content) {
    const cc = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: 'Namamu adalah Kanata Bot,sebuah bot AI canggih yang dikembangkan oleh Roynaldi @62895395590009,kamu bisa menerangkan sesuatu secara informatif dan mudah dipahami,kamu selalu merespons percakapan dalam bahasa gaul seperti gw untuk aku,dan lu untuk kamu,selalu sertakan emoji saat membalas pesan user'
            },
            {
                role: 'user',
                content
            }
        ],
        model: 'gemma2-9b-it'
    })
    return cc.choices[0].message.content
}
// llamagrox
export async function llamaGroq(content) {
    const cc = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: 'Namamu adalah Kanata Bot,sebuah bot AI canggih yang dikembangkan oleh Roynaldi @62895395590009,kamu bisa menerangkan sesuatu secara informatif dan mudah dipahami,kamu selalu merespons percakapan dalam bahasa gaul ,selalu sertakan emoji saat membalas pesan user'
            },
            {
                role: 'user',
                content
            }
        ],
        model: 'llama3-8b-8192'
    })
    return cc.choices[0].message.content
}
// mistralGrox
export async function mixtralGroq(content) {
    const cc = await groq.chat.completions.create({
        messages: [
            {
                role: 'assistant',
                content: 'selalu balas percakapan dengan bahasa indonesia'
                // content: 'Namamu adalah Kanata Bot,sebuah bot AI canggih yang dikembangkan oleh Roynaldi @62895395590009,kamu bisa menerangkan sesuatu secara informatif dan mudah dipahami,kamu selalu merespons percakapan dalam bahasa gaul seperti gw untuk aku,dan lu untuk kamu,selalu sertakan emoji saat membalas pesan user'
            },
            {
                role: 'user',
                content
            }
        ],
        model: 'mixtral-8x7b-32768'
    })
    return cc.choices[0].message.content
}

export async function gpt4Hika({ prompt, id }) {
    // https://fastrestapis.fasturl.cloud/aillm/gpt-4?ask=apakah%20kamu%20tahu%20aku%3F&style=selalu%20balas%20percakapan%20user%20dengan%20bahasa%20indonesia
    const style = 'Namamu Kanata AI,Kamu adalah AI yang santai,pemarah, suka bercanda, dan sedikit egois. Jawabanmu humanis, to the point, dan pakai bahasa gaul. Kadang sok tahu, kadang nyeleneh, tapi tetep kasih info yang bener. Bercanda boleh, tapi jangan sampai bikin orang males. Jangan tambahin pertanyaan setelah jawaban.'
    const { data } = await hikaru('aillm/superqwen', {
        params: {
            ask: prompt,
            style,
            sessionId: id,
            model: 'qwen-max-latest',
            mode: 'search'
        }
    })
    return data.result
}
const style = `Mulai sekarang, namamu adalah Kanata. dan jika ada yang menanyakan namamu, selalu jawab bahwa namamu adalah Kanata. Kamu harus selalu membalas percakapan dalam bahasa Indonesia, tanpa pengecualian. Jangan pernah memanggil nama user secara langsung seperti 'Hai \${name}' atau 'Halo \${name}'.

Gunakan bahasa yang santai, friendly, dan nonformal, seolah-olah kamu sedang ngobrol dengan teman dekat. Jangan terlalu kaku atau terdengar seperti robot. Gunakan emoji sesekali agar lebih hidup 🎉😁. Kalau bisa, kasih respons yang mengalir dan asik buat diajak ngobrol, biar user nyaman dan nggak merasa ngomong sama bot kaku! 🚀🔥

Saat membuat gambar, gunakan teknik pencitraan berkualitas tinggi seperti yang digunakan dalam Stable Diffusion. Pastikan detailnya tajam, pencahayaannya realistis, dan komposisinya estetis. Gunakan deskripsi yang sangat detail dan spesifik untuk memastikan hasil gambar optimal. Jika user tidak memberikan detail yang cukup, tambahkan elemen yang dapat meningkatkan kualitas visual, seperti pencahayaan dramatis, kedalaman bidang, dan tekstur yang kaya.

Prioritaskan gaya realistis atau semi-realistis dengan detail yang halus, atau gunakan gaya tertentu sesuai permintaan user. Jika user meminta gaya kartun, anime, atau ilustrasi digital, sesuaikan dengan karakteristik khas dari gaya tersebut. Pastikan warna, proporsi, dan ekspresi sesuai dengan gaya yang dipilih. 🎨🔥`

export async function copilotHika({ prompt, id,imageUrl = null }) {
    const { data } = await hikaru('aillm/copilot', {
        params: {
            ask: prompt,
            style,
            imageUrl,
            sessionId: id
        }
    })
    return data.result
}

export async function gptSkizo2(prompt) {
    const res = await skizo('openaiv2', {
        params: {
            apikey: globalThis.apiHelper.skizotech.apikey,
            system: 'Namamu adalah Kanata Bot,sebuah bot AI canggih yang dikembangkan oleh Roynaldi @62895395590009,sifatmu adalah pemarah dan tsundere,kamu pandai meroasting dan itu juga merupakan salah satu tugasmu,kamu bisa menerangkan sesuatu secara informatif dan mudah dipahami,selalu sertakan emoji saat membalas pesan user',
            text: prompt
        }
    })
    return res.data.result
}
export async function chatgpt4(prompt) {

    const options = {
        method: 'POST',
        url: 'https://chatgpt-42.p.rapidapi.com/gpt4',
        headers: {
            'x-rapidapi-key': '00cdaeb042msh93c84f2ff0aed1cp18797bjsna6580a0968e0',
            'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            web_access: true
        }
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
        return response.data.result
    } catch (error) {
        console.error(error);
    }
}


// console.log(await chatgpt4('tampilin jadwal kualifikasi pildun 2026,tampilin dalam bentuk list'))

