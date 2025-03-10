import { updatePoints } from '../../helper/database.js';
import { tebak } from '../../helper/skizotech.js';
import moment from 'moment';
import { maskSentence } from '../../helper/word.js';
import User from '../../database/models/User.js';

export let tebakSession = new Map();

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
const sendLevelUpMessage = async (sock, id, newLevel) => {
    await sock.sendMessage(id, {
        text: `🎉 Selamat! Level kamu naik ke level ${newLevel}!`
    });
};

export const asahotak = async (id, sock) => {
    try {
        const response = await tebak('asahotak');
        const question = response.data.soal;
        const answer = response.data.jawaban;

        await sock.sendMessage(id, { text: question });

        tebakSession.set(id, {
            answer: answer,
            timestamp: moment(), // Tambahkan timestamp
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, { text: `Waktu habis! Jawaban yang benar adalah: ${tebakSession.get(id).answer}` });
                tebakSession.delete(id);
            }, 60000)
        });
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

        await sock.sendMessage(id, { text: question + ` ${maskSentence(answer)} (${answer.length}) kata` });

        tebakSession.set(id, {
            answer: answer,
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, { text: `Waktu habis! Jawaban yang benar adalah: ${tebakSession.get(id).answer}` });
                tebakSession.delete(id);
            }, 60000) // 60 detik
        });
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

        tebakSession.set(id, {
            answer: answer,
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, { text: `Waktu habis! Jawaban yang benar adalah: ${tebakSession.get(id).answer}` });
                tebakSession.delete(id);
            }, 60000) // 60 detik
        });
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

        tebakSession.set(id, {
            answer: answer,
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, { text: `Waktu habis! Jawaban yang benar adalah: ${tebakSession.get(id).answer}` });
                tebakSession.delete(id);
            }, 60000) // 60 detik
        });
    } catch (error) {
        console.log(error)
        await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
    }
};
export const gambar = async (id, sock) => {
    try {
        const response = await tebak('gambar');
        const img = response.data.result.image;
        const answer = response.data.result.answer;
        await sock.sendMessage(id, { image: { url: img.replace(/\.png$/, '.jpg') } })

        tebakSession.set(id, {
            answer: answer,
            timeout: setTimeout(async () => {
                await sock.sendMessage(id, { text: `Waktu habis! Jawaban yang benar adalah: ${tebakSession.get(id).answer}` });
                tebakSession.delete(id);
            }, 60000) // 60 detik
        });
    } catch (error) {
        console.log(error)
        await sock.sendMessage(id, { text: 'Terjadi kesalahan, silakan coba lagi.' });
    }
};

export const checkAnswer = async (id, userAnswer, sock, quotedMessageId, noTel) => {
    const session = tebakSession.get(id);
    const correctAnswer = session.answer.toLowerCase();
    const questionTime = session.timestamp;
    const currentTime = moment();

    const timeElapsed = currentTime.diff(questionTime, 'seconds');

    // Hitung poin dan exp
    const { min: minPoin, max: maxPoin } = calculateExp(timeElapsed);
    const kalkulasiPoin = Math.floor(Math.random() * (maxPoin - minPoin + 1)) + minPoin;
    
    // Exp akan sebanding dengan poin yang didapat (10x lipat)
    const expGained = kalkulasiPoin * 10;

    if (userAnswer.toLowerCase() === correctAnswer) {
        clearTimeout(session.timeout);
        
        try {
            // Update poin
            await updatePoints({ id: noTel, points: kalkulasiPoin });
            
            // Update exp dan cek level up
            const expResult = await User.addExp(noTel, expGained);
            
            let rewardMessage = `🎯 Jawaban kamu benar: ${correctAnswer}\n`;
            rewardMessage += `💰 Poin +${kalkulasiPoin}\n`;
            rewardMessage += `✨ EXP +${expGained}\n`;
            
            // Jika naik level, tambahkan pesan selamat
            if (expResult.levelUp) {
                rewardMessage += `\n🎉 Level Up! Sekarang kamu level ${expResult.newLevel}!\n`;
                rewardMessage += `📊 Progress: ${expResult.currentExp}/${expResult.expNeeded} EXP`;
            }

            await sock.sendMessage(id, {
                text: rewardMessage
            }, { quoted: quotedMessageId });

        } catch (error) {
            console.error('Error updating rewards:', error);
            await sock.sendMessage(id, {
                text: 'Terjadi kesalahan saat memperbarui hadiah.'
            }, { quoted: quotedMessageId });
        }

        tebakSession.delete(id);
    } else {
        // Opsional: Berikan sedikit exp untuk usaha menjawab
        try {
            await User.addExp(noTel, 5); // 5 exp untuk setiap jawaban salah
            await sock.sendMessage(id, {
                text: 'Jawaban salah, tapi kamu dapat 5 EXP untuk usahamu! Coba lagi!',
            }, { quoted: quotedMessageId });
        } catch (error) {
            console.error('Error updating exp for wrong answer:', error);
        }
    }
};


