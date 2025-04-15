import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        const stats = await RPG.getStats(noTel);
        const userSkills = await RPG.getUserSkills(noTel);
        const activePet = await RPG.getActivePet(noTel);

        let text = '*📊 RPG PROFILE*\n\n';
        
        // Basic Info
        text += `👤 Level: ${stats.level}\n`;
        text += `✨ EXP: ${stats.exp}/${stats.level * 1000}\n`;
        text += `💰 Gold: ${stats.gold}\n\n`;
        
        // Stats
        text += '*📈 STATS*\n';
        text += `❤️ HP: ${stats.health}/${stats.max_health}\n`;
        text += `💫 Mana: ${stats.mana}/${stats.max_mana}\n`;
        text += `⚡ Stamina: ${stats.stamina}/${stats.max_stamina}\n`;
        text += `🍖 Hunger: ${stats.hunger}/100\n`;
        text += `🥤 Thirst: ${stats.thirst}/100\n`;
        text += `💪 Energy: ${stats.energy}/100\n\n`;
        
        // Combat Stats
        text += '*⚔️ COMBAT STATS*\n';
        text += `⚔️ Attack: ${stats.attack}\n`;
        text += `🛡️ Defense: ${stats.defense}\n`;
        if (stats.temp_defense) {
            text += `🛡️ Temp Defense: +${stats.temp_defense}\n`;
        }
        
        // Skills
        if (userSkills && userSkills.length > 0) {
            text += '\n*💫 SKILLS*\n';
            userSkills.forEach(skill => {
                text += `- ${skill.name}\n`;
            });
        }
        
        // Active Pet
        if (activePet) {
            text += '\n*🐾 ACTIVE PET*\n';
            text += `Name: ${activePet.name}\n`;
            text += `Level: ${activePet.level}\n`;
            text += `Happiness: ${activePet.happiness}/100\n`;
        }
        
        // PvP Stats
        if (stats.pvp_wins || stats.pvp_losses) {
            text += '\n*⚔️ PVP STATS*\n';
            text += `Wins: ${stats.pvp_wins || 0}\n`;
            text += `Losses: ${stats.pvp_losses || 0}\n`;
        }

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const handler = ['profile', 'profil', 'rpg'];
export const description = 'Lihat status dan statistik karakter RPG kamu'; 