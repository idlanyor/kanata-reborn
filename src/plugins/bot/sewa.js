import Bot from '../../database/models/Bot.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            // Tampilkan daftar harga
            const plans = await Bot.getRentalPlans();
            let text = '*💰 SEWA BOT*\n\n';
            
            plans.forEach(plan => {
                text += `*${plan.plan_name}*\n`;
                text += `⏱️ Durasi: ${plan.duration_days} hari\n`;
                text += `💵 Harga: Rp ${plan.price.toLocaleString()}\n`;
                text += `✨ Fitur: ${JSON.parse(plan.features).join(', ')}\n\n`;
            });
            
            text += 'Untuk menyewa: !sewa <nama_paket>\n';
            text += 'Contoh: !sewa Basic';
            
            await sock.sendMessage(id, { text });
            return;
        }

        // Proses permintaan sewa
        const planType = psn.trim();
        const rental = await Bot.createRental(id, noTel, planType);
        
        let text = '*🎉 PERMINTAAN SEWA BERHASIL*\n\n';
        text += `Paket: ${planType}\n`;
        text += `Harga: Rp ${rental.plan.price.toLocaleString()}\n`;
        text += `Durasi: ${rental.plan.duration_days} hari\n`;
        text += `Expired: ${rental.endDate}\n\n`;
        text += 'Silakan lakukan pembayaran ke:\n';
        text += 'DANA: 0895395590009\n';
        text += 'LinkAja: 0895395590009\n';
        text += 'GOPAY: 0895395590009\n\n';
        text += 'Setelah membayar, kirim bukti pembayaran\n';
        text += 'ke owner: @Roy';

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ Error: ${error.message}`
        });
    }
};

export const handler = 'sewa';
export const tags = ['main'];
export const command = ['sewa'];
export const help = 'Sewa bot untuk grup'; 