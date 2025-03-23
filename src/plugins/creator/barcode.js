import { createCanvas } from 'canvas';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export const handler = "barcode";
export const description = "Barcode & QR Code Generator";

async function generateBarcode(data, type = 'code128') {
    const canvas = createCanvas(400, 200);
    
    JsBarcode(canvas, data, {
        format: type,
        lineColor: "#000",
        width: 2,
        height: 100,
        displayValue: true,
        font: "Arial",
        fontSize: 20,
        margin: 10
    });
    
    return canvas.toBuffer();
}

async function generateQRCode(data, color = '#000000') {
    const opts = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 500,
        color: {
            dark: color,
            light: '#FFFFFF'
        }
    };
    
    return await QRCode.toBuffer(data, opts);
}

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        await m.reply('📊 *Barcode Generator*\n\nFormat:\n*.barcode <teks>* - Barcode standar\n*.barcode qr <teks>* - QR Code\n*.barcode qr <teks> | <warna>* - QR Code berwarna');
        return;
    }
    
    try {
        const parts = psn.split(' ');
        
        if (parts[0].toLowerCase() === 'qr') {
            const qrData = parts.slice(1).join(' ').split('|');
            const text = qrData[0].trim();
            const color = qrData[1]?.trim() || '#000000';
            
            if (!text) {
                await m.reply('❌ Masukkan teks untuk QR Code!');
                return;
            }
            
            await m.react('⏳');
            
            const qrBuffer = await generateQRCode(text, color);
            
            await sock.sendMessage(id, { 
                image: qrBuffer,
                caption: '✨ *QR Code Generator*\n\n' +
                         `📝 Data: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\n` +
                         `🎨 Warna: ${color}`
            }, { quoted: m });
        } else {
            const text = psn;
            
            if (!text) {
                await m.reply('❌ Masukkan data untuk barcode!');
                return;
            }
            
            await m.react('⏳');
            
            const barcodeBuffer = await generateBarcode(text);
            
            await sock.sendMessage(id, { 
                image: barcodeBuffer,
                caption: '✨ *Barcode Generator*\n\n' +
                         `📝 Data: ${text}\n` +
                         `📊 Tipe: Code 128`
            }, { quoted: m });
        }
        
        await m.react('✨');
    } catch (error) {
        console.error('Error generating barcode:', error);
        await m.reply(`❌ Terjadi kesalahan: ${error.message}`);
        await m.react('❌');
    }
};

export const help = {
    name: "barcode",
    description: "Generator Barcode dan QR Code",
    usage: ".barcode <teks> - Barcode standar\n.barcode qr <teks> - QR Code\n.barcode qr <teks> | <warna> - QR Code berwarna",
    example: ".barcode 123456789\n.barcode qr https://example.com\n.barcode qr Halo Dunia | #ff0000"
}; 