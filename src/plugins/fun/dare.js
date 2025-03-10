const dares = [
    "Kirim voice note nyanyi lagu favoritmu",
    "Upload foto selfie terbaru ke status WA",
    "Chat crush kamu sekarang",
    "Voice note baca puisi romantis",
    "Kirim pesan ke temanmu 'Aku suka kamu, mau jadi pacarku?'",
    "Ubah foto profil WA jadi foto lawak selama 1 jam",
    "Voice note tirukan suara hewan",
    "Kirim chat ke 3 kontak random dengan kata-kata lucu",
    "Upload video joget ke status WA",
    "Telepon temanmu dan nyanyikan lagu random"
];

export default async ({ sock, m, id }) => {
    try {
        const dare = dares[Math.floor(Math.random() * dares.length)];
        await sock.sendMessage(id, { 
            text: `*😈 DARE*\n\n${dare}\n\n_Berani melakukannya?_` 
        });
    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ Error: ${error.message}` 
        });
    }
};

export const handler = 'dare';
export const tags = ['fun'];
export const command = ['dare'];
export const help = 'Random tantangan dare\nPenggunaan: !dare'; 