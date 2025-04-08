export const description = "🖼️ *Web Screenshot*";
export const handler = "ssweb";

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        await sock.sendMessage(id, {
            text: "📸 Please provide a URL to capture a screenshot.\n\nExample: *ssweb https://example.com*"
        });
        return;
    }

    const url = psn.trim();
    // Validate URL
    try {
        new URL(url);
    } catch (error) {
        await sock.sendMessage(id, { text: "❌ Invalid URL. Please provide a valid URL." });
        return;
    }

    try {
        await sock.sendMessage(id, { text: '📸 Capturing screenshot, please wait... ⏳' });

        const apiUrl = `https://fastrestapis.fasturl.cloud/tool/screenshot?url=${encodeURIComponent(url)}&width=1280&height=800&delay=0&fullPage=false&darkMode=false&type=png`;

        const response = await fetch(apiUrl, {
            headers: {
                'accept': 'image/png'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const imageBuffer = await response.arrayBuffer();

        // Send screenshot
        await sock.sendMessage(id, { 
            image: Buffer.from(imageBuffer), 
            caption: `🖼️ Screenshot of: ${url}` 
        });

    } catch (error) {
        let errorMessage = '⚠️ Terjadi kesalahan saat mengambil screenshot:\n\n';
        
        if (error.name === 'TimeoutError') {
            errorMessage += 'Waktu loading halaman terlalu lama';
        } else if (error.message.includes('net::')) {
            errorMessage += 'Tidak dapat mengakses website tersebut';
        } else {
            errorMessage += error.message;
        }
        
        await sock.sendMessage(id, { text: errorMessage });
    }
};
