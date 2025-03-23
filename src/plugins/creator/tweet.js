import { createCanvas, loadImage, registerFont } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

registerFont(join(__dirname, '../../assets/fonts/Poppins-Bold.ttf'), { family: 'Poppins Bold' });
registerFont(join(__dirname, '../../assets/fonts/Poppins-Regular.ttf'), { family: 'Poppins' });

export const handler = "tweet";
export const description = "Twitter/X Post Generator";

async function createTweet(username, handle, tweet, verified = false, likes = 0, retweets = 0, avatarUrl) {
    // Ukuran standar tweet
    const canvas = createCanvas(1200, 600);
    const ctx = canvas.getContext('2d');
    
    // Background putih atau dark mode (mode gelap)
    ctx.fillStyle = '#15202b'; // Dark mode
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Avatar
    const avatarSize = 120;
    const avatarX = 40;
    const avatarY = 40;
    
    try {
        // Load avatar dari URL atau gunakan default
        const avatar = await loadImage(avatarUrl || 'https://i.ibb.co/G9qRvXH/default-avatar.png');
        
        // Buat avatar circular
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Gambar avatar
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
    } catch (error) {
        console.error('Error loading avatar:', error);
        // Fallback untuk avatar
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.fillStyle = '#f1f1f1';
        ctx.fill();
        
        ctx.font = '60px Poppins Bold';
        ctx.fillStyle = '#1da1f2';
        ctx.fillText(username.charAt(0).toUpperCase(), avatarX + avatarSize/2, avatarY + avatarSize/2);
    }
    
    // Username
    ctx.fillStyle = '#ffffff';
    ctx.font = '60px Poppins Bold';
    ctx.textAlign = 'left';
    ctx.fillText(username, avatarX + avatarSize + 20, avatarY + avatarSize/2);
    
    // Handle
    ctx.fillStyle = '#8899a6';
    ctx.font = '36px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText(handle, avatarX + avatarSize + 20, avatarY + avatarSize/2 + 40);
    
    // Tweet
    ctx.fillStyle = '#ffffff';
    ctx.font = '36px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText(tweet, avatarX + avatarSize + 20, avatarY + avatarSize/2 + 80);
    
    // Verified
    if (verified) {
        const verifiedImage = await loadImage(join(__dirname, '../../assets/images/verified.png'));
        ctx.drawImage(verifiedImage, avatarX + avatarSize + 20, avatarY + avatarSize/2 + 120, 20, 20);
    }
    
    // Likes
    ctx.fillStyle = '#8899a6';
    ctx.font = '36px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText(`${likes} Likes`, avatarX + avatarSize + 20, avatarY + avatarSize/2 + 160);
    
    // Retweets
    ctx.fillStyle = '#8899a6';
    ctx.font = '36px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText(`${retweets} Retweets`, avatarX + avatarSize + 20, avatarY + avatarSize/2 + 200);
    
    return canvas.toBuffer('image/png');
}

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await m.reply('Format: .tweet username | handle | tweet');
        return;
    }
    
    try {
        const [username, handle, tweet] = psn.split('|').map(item => item.trim());
        
        if (!username || !handle || !tweet) {
            await m.reply('❌ Semua field harus diisi!\nContoh: .tweet JohnDoe | @JohnDoe | Ini adalah tweet');
            return;
        }
        
        await m.react('⏳');
        
        // Coba dapatkan avatar dari profile picture
        let avatarUrl;
        try {
            avatarUrl = await sock.profilePictureUrl(m.sender, 'image');
        } catch (error) {
            console.log('Failed to get avatar:', error);
            avatarUrl = 'https://i.ibb.co/G9qRvXH/default-avatar.png'; // Default avatar
        }
        
        const tweetBuffer = await createTweet(username, handle, tweet, false, 0, 0, avatarUrl);
        
        await sock.sendMessage(id, {
            image: tweetBuffer,
            caption: '✨ Tweet Generator\n\n' +
                    `👤 *Username:* ${username}\n` +
                    `�� *Handle:* ${handle}\n` +
                    `📝 *Tweet:* "${tweet}"`
        }, { quoted: m });
        
        await m.react('✨');
    } catch (error) {
        console.error('Error:', error);
        await m.reply('❌ Terjadi kesalahan saat membuat tweet');
        await m.react('❌');
    }
};

export const help = {
    name: "tweet",
    description: "Buat tweet keren dengan avatar dan informasi",
    usage: ".tweet username | handle | tweet",
    example: ".tweet JohnDoe | @JohnDoe | Ini adalah tweet"
}; 