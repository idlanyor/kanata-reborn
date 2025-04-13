import { updatePoints } from '../../helper/database.js';
import { game } from '../../helper/hikaru.js';
import moment from 'moment';
import { maskSentence } from '../../helper/word.js';
import User from '../../database/models/User.js';

// Tambahkan ini di bagian atas file
global.tebakGame = {};
console.log("Initializing tebakGame:", global.tebakGame);

// Tambahkan fungsi helper untuk debug
export const debugGameSession = (id) => {
    console.log('Current Game Session:', {
        id,
        session: global.tebakGame[id],
        allSessions: global.tebakGame
    });
};

// Helper function untuk menghitung exp berdasarkan waktu
const calculateExp = (timeElapsed) => {
    if (timeElapsed <= 10) return { min: 90, max: 100 };
    else if (timeElapsed <= 30) return { min: 80, max: 90 };
    else if (timeElapsed <= 60) return { min: 70, max: 80 };
    else if (timeElapsed <= 120) return { min: 60, max: 70 };
    else if (timeElapsed <= 180) return { min: 50, max: 60 };
    else if (timeElapsed <= 240) return { min: 40, max: 50 };
    else if (timeElapsed <= 300) return { min: 30, max: 40 };
    else if (timeElapsed <= 360) return { min: 20, max: 30 };
    else if (timeElapsed <= 420) return { min: 10, max: 20 };
    else return { min: 5, max: 10 };
};

// Fungsi untuk mengirim pesan level up
export const sendLevelUpMessage = async (sock, id, newLevel) => {
    await sock.sendMessage(id, {
        text: `🎉 Selamat! Level kamu naik ke level ${newLevel}!`
    });
};

export const asahotak = async (id, sock) => {
    try {
        const response = await game('asahotak');
        const question = response.question;
        const answer = response.answer;

        await sock.sendMessage(id, { text: question });

        // Simpan ke global state
        global.tebakGame[id] = {
            session: true,
            answer: answer,
            timestamp: moment(),
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, {
                    text: `⏰ Waktu habis!\n\n✨ Jawaban yang benar adalah: *${answer}*`
                });
                delete global.tebakGame[id];
            }, 60000)
        };

    } catch (error) {
        console.log(error)
        await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
    }
};

export const caklontong = async (id, sock) => {
    try {
        const response = await tebak('caklontong');
        const question = `Soal : ${response.data.soal} \n Clue : ${response.data.deskripsi}`;
        const answer = response.data.jawaban;

        await sock.sendMessage(id, {
            text: question + ` ${maskSentence(answer)} (${answer.length} kata)`
        });

        global.tebakGame[id] = {
            session: true,
            answer: answer,
            timestamp: moment(),
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, {
                    text: `⏰ Waktu habis!\n\n✨ Jawaban yang benar adalah: *${answer}*`
                });
                delete global.tebakGame[id];
            }, 60000)
        };

    } catch (error) {
        console.log(error)
        await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
    }
};

export const susun = async (id, sock) => {
    try {
        const response = await tebak('susunkata');
        const question = response.data.result.pertanyaan;
        const answer = response.data.result.jawaban;

        await sock.sendMessage(id, { text: question });

        global.tebakGame[id] = {
            session: true,
            answer: answer,
            timestamp: moment(),
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, {
                    text: `⏰ Waktu habis!\n\n✨ Jawaban yang benar adalah: *${answer}*`
                });
                delete global.tebakGame[id];
            }, 60000)
        };
    } catch (error) {
        console.log(error)
        await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
    }
};

export const bendera = async (id, sock) => {
    try {
        const response = await tebak('bendera');
        const question = response.data.result.flag;
        const answer = response.data.result.name;

        await sock.sendMessage(id, { text: question });

        global.tebakGame[id] = {
            session: true,
            answer: answer,
            timestamp: moment(),
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, {
                    text: `⏰ Waktu habis!\n\n✨ Jawaban yang benar adalah: *${answer}*`
                });
                delete global.tebakGame[id];
            }, 60000)
        };
    } catch (error) {
        console.log(error)
        await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
    }
};

export const gambar = async (id, sock) => {
    try {
        const response = await game('tebakgambar');
        const img = response.image;
        const answer = response.answer;
        await sock.sendMessage(id, { image: { url: img } })

        global.tebakGame[id] = {
            session: true,
            answer: answer,
            timestamp: moment(),
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, {
                    text: `⏰ Waktu habis!\n\n✨ Jawaban yang benar adalah: *${answer}*`
                });
                delete global.tebakGame[id];
            }, 60000)
        };
    } catch (error) {
        console.log(error)
        await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
    }
};

export const checkAnswer = async (id, userAnswer, sock, quotedMessageId, noTel) => {
    const session = global.tebakGame[id];
    if (!session) {
        console.log('No active session found for:', id);
        return false;
    }

    console.log('Checking answer:', {
        userAnswer,
        correctAnswer: session.answer,
        session: session
    });

    const answer = session.answer.toLowerCase().trim();
    userAnswer = userAnswer.toLowerCase().trim();

    if (userAnswer === answer) {
        clearTimeout(session.timeout);
        
        try {
            // Hitung waktu yang dibutuhkan untuk menjawab dalam detik
            const timeElapsed = moment().diff(session.timestamp, 'seconds');
            const expRange = calculateExp(timeElapsed);
            const pointsEarned = Math.floor(Math.random() * (expRange.max - expRange.min + 1)) + expRange.min;
            
            await updatePoints({ id: noTel, points: pointsEarned });
            
            await sock.sendMessage(id, { 
                text: `🎉 *BENAR!*\n\n✅ Jawaban: *${answer}*\n💰 Kamu mendapatkan ${pointsEarned} points!`,
                contextInfo: {
                    externalAdReply: {
                        title: '🏆 Jawaban Benar',
                        body: `+${pointsEarned} points`,
                        thumbnailUrl: 'https://files.catbox.moe/2wynab.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                    }
                }
            });

            await sock.sendMessage(id, { 
                react: { 
                    text: '🎮', 
                    key: quotedMessageId.key 
                } 
            });

            delete global.tebakGame[id];
            return true;
        } catch (error) {
            console.error('Error giving reward:', error);
            await sock.sendMessage(id, {
                text: 'Jawaban benar! Tapi ada error saat memberikan hadiah.'
            });
            return false;
        }
    } else {
        await sock.sendMessage(id, {
            text: '❌ Jawaban salah, coba lagi!'
        });
        return false;
    }
};

