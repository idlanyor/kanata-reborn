import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        // Jika tidak ada parameter, tampilkan daftar skill
        if (!psn) {
            const skills = await RPG.getSkills();
            const userSkills = await RPG.getUserSkills(noTel);
            
            let text = '*📚 DAFTAR SKILL*\n\n';
            
            skills.forEach((skill, index) => {
                const owned = userSkills.some(s => s.id === skill.id);
                text += `${index + 1}. ${skill.name} ${owned ? '✅' : ''}\n`;
                text += `├ Level: ${skill.reqLevel}\n`;
                text += `├ Mana: ${skill.manaCost}\n`;
                text += `├ Effect: ${skill.effect}\n`;
                text += `└ Harga: ${skill.price} gold\n\n`;
            });
            
            text += '\n*Penggunaan:*\n';
            text += '.skill beli <nomor> - Beli skill\n';
            text += '.skill pakai <nomor> - Gunakan skill';
            
            await sock.sendMessage(id, { text });
            return;
        }

        const [cmd, num] = psn.split(' ');
        
        if (!num || isNaN(num)) {
            throw new Error('Nomor skill tidak valid!');
        }

        if (cmd === 'beli') {
            const result = await RPG.buySkill(noTel, parseInt(num));
            await sock.sendMessage(id, { 
                text: `✅ Berhasil membeli skill: ${result.skillName}` 
            });
        } 
        else if (cmd === 'pakai') {
            const result = await RPG.useSkill(noTel, parseInt(num));
            await sock.sendMessage(id, { 
                text: `✨ Menggunakan skill: ${result.skillName}\n${result.effect}` 
            });
        }
        else {
            throw new Error('Perintah tidak valid! Gunakan beli/pakai');
        }

    } catch (error) {
        console.error('Skill error:', error);
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const handler = ['skill', 'skills'];
export const description = `
*💫 Skill System*

Penggunaan:
- !skill - Lihat daftar skill
- !skill beli <nama_skill> - Beli skill baru
- !skill pakai <nama_skill> - Gunakan skill

Note: Beberapa skill membutuhkan target (reply pesan target)
`.trim(); 