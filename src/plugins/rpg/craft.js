import RPG from '../../database/models/RPG.js';

export const description = "Craft item menggunakan material yang kamu miliki";
export const handler = "craft"
export default async ({ sock, m, id, psn, sender, noTel }) => {
    try {
        if (!psn) {
            const recipes = await RPG.getAllRecipes();
            let text = '*🛠️ CRAFTING SYSTEM*\n\n';
            
            for (const recipe of recipes) {
                text += `*${recipe.item_name}*\n`;
                text += `📊 Level Required: ${recipe.level_required}\n`;
                text += `📦 Materials: ${Object.entries(JSON.parse(recipe.materials))
                    .map(([item, qty]) => `${item} x${qty}`).join(', ')}\n\n`;
            }
            
            text += 'Untuk craft: !craft <nama_item>';
            await sock.sendMessage(id, { text });
            return;
        }

        const result = await RPG.craftItem(noTel, psn);
        await sock.sendMessage(id, { 
            text: `✅ Berhasil craft ${result.item}!\n\nMaterial yang digunakan:\n${
                Object.entries(result.materials)
                    .map(([item, qty]) => `- ${item} x${qty}`)
                    .join('\n')
            }` 
        });
    } catch (error) {
        await sock.sendMessage(id, { text: `❌ Error: ${error.message}` });
    }
}; 