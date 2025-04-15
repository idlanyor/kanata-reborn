import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            // Tampilkan daftar resep yang tersedia
            const recipes = await RPG.getRecipes();
            let text = '*🔨 CRAFTING RECIPES*\n\n';
            
            recipes.forEach(recipe => {
                text += `📝 ${recipe.name}\n`;
                text += `📊 Level Required: ${recipe.level_required}\n`;
                
                const materials = JSON.parse(recipe.materials);
                text += '📦 Materials:\n';
                Object.entries(materials).forEach(([item, qty]) => {
                    text += `- ${item} x${qty}\n`;
                });
                text += '\n';
            });
            
            text += '\nKetik !craft <nama_item> untuk membuat item';
            await sock.sendMessage(id, { text });
            return;
        }

        const result = await RPG.craftItem(noTel, psn);
        
        let text = `✨ Berhasil membuat ${result.item}!\n\n`;
        text += '📦 Materials used:\n';
        Object.entries(result.materials).forEach(([item, qty]) => {
            text += `- ${item} x${qty}\n`;
        });
        
        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
};

export const tags = ['rpg'];
export const command = ['craft'];
export const help = 'Craft item dari material yang tersedia\nPenggunaan: !craft <nama_item>'; 