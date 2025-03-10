import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            const skills = await RPG.getAllSkills();
            let text = '*✨ SKILLS*\n\n';
            
            skills.forEach(s => {
                text += `*${s.name}*\n`;
                text += `📊 Level Min: ${s.min_level}\n`;
                text += `💫 Mana Cost: ${s.mana_cost}\n`;
                text += `⏱️ Cooldown: ${s.cooldown_seconds}s\n`;
                text += `💰 Price: ${s.price} gold\n\n`;
            });
            
            text += 'Commands:\n';
            text += '!skill learn <nama_skill>\n';
            text += '!skill use <nama_skill> [@user]\n';
            
            await sock.sendMessage(id, { text });
            return;
        }

        await RPG.initPlayer(noTel);
        const [cmd, skillName, target] = psn.split(' ');

        if (cmd === 'learn') {
            const skill = await RPG.learnSkill(noTel, skillName);
            await sock.sendMessage(id, { 
                text: `✅ Berhasil mempelajari skill ${skill.name}!`
            });
        } else if (cmd === 'use') {
            const targetId = target ? target.replace('@', '') + '@s.whatsapp.net' : null;
            const result = await RPG.useSkill(noTel, skillName, targetId);
            
            let text = `*✨ ${result.skillName}*\n\n`;
            if (result.effect.damage) {
                text += `⚔️ Damage: ${result.effect.damage}`;
            }
            if (result.effect.heal) {
                text += `💚 Heal: +${result.effect.heal} HP`;
            }
            if (result.effect.defense) {
                text += `🛡️ Defense: +${result.effect.defense}`;
            }
            
            await sock.sendMessage(id, { text });
        }
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'skill'; 