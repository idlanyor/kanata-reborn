export const handler = 'ip';
export const description = 'Cek info lokasi dari IP address';

export default async ({ sock, m, id, psn }) => {
    try {
        // Validasi input
        if (!psn || !/^\d{1,3}(\.\d{1,3}){3}$/.test(psn)) {
            await sock.sendMessage(id, {
                text: `⚠️ *Format salah!*\n\nContoh: *.ip 192.168.1.1*`
            });
            return;
        }

        const res = await fetch(`https://ipwho.is/${psn}`);
        const data = await res.json();

        if (!data.success) {
            await sock.sendMessage(id, {
                text: `❌ Gagal ambil data IP. Mungkin IP-nya halu, bang.`
            });
            return;
        }

        const flag = data.flag?.emoji || '🌍';
        const org = data.connection?.org || '-';
        const isp = data.connection?.isp || '-';
        const tz = data.timezone?.id || '-';

        const info = `
${flag} *IP Address Info*

📍 *Lokasi:* ${data.city}, ${data.region}, ${data.country}
🛰️ *ISP:* ${isp}
🏢 *Org:* ${org}
🌐 *Domain:* ${data.connection?.domain || '-'}
🕒 *Zona Waktu:* ${tz}
🧭 *Koordinat:* ${data.latitude}, ${data.longitude}
🆔 *ASN:* ${data.connection?.asn}
        `.trim();

        // Kirim lokasi
        await sock.sendMessage(id, {
            location: {
                degreesLatitude: data.latitude,
                degreesLongitude: data.longitude,
                name: `${isp}, ${data.city}`,
                address: `${data.country} (${psn})`
            }
        }, { quoted: m });

        // Kirim info lengkap setelah location
        await sock.sendMessage(id, {
            text: info
        });

    } catch (err) {
        await sock.sendMessage(id, {
            text: `❌ Error pas ngambil info IP: ${err.message || err}`
        });
    }
};

