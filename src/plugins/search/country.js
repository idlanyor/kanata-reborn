export const handler = 'country';
export const description = 'Cek informasi negara berdasarkan nama';

export default async ({ sock, m, id, psn }) => {
    try {
        if (!psn) {
            return await sock.sendMessage(id, {
                text: `📌 *Contoh:* .negara indonesia`
            });
        }

        const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(psn)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!Array.isArray(data) || data.status === 404) {
            return await sock.sendMessage(id, {
                text: `❌ Negara *${psn}* gak ditemukan bos! Coba cek spelling-nya.`
            });
        }

        const negara = data[0];
        const mataUang = Object.values(negara.currencies)[0];
        const bahasa = Object.values(negara.languages).join(', ');
        const demonyms = negara.demonyms?.eng?.m || '-';
        const flag = negara.flags?.png;

        const teks = `
🌍 *${negara.name.common}* (${negara.cca2})

🏛️ Resmi: ${negara.name.official}
🎌 Nama Lokal: ${negara.name.nativeName?.ind?.official || '-'}
💬 Bahasa: ${bahasa}
💰 Mata Uang: ${mataUang.name} (${mataUang.symbol})
👥 Populasi: ${negara.population.toLocaleString('id-ID')}
📍 Wilayah: ${negara.region}, ${negara.subregion}
🏙️ Ibukota: ${negara.capital?.[0] || '-'}
🌐 Domain: ${negara.tld.join(', ')}
📞 Kode Telp: ${negara.idd.root}${negara.idd.suffixes.join(',')}
🚘 Sisi Jalan: ${negara.car.side}
🏳️ Demonym: ${demonyms}
🕒 Zona Waktu: ${negara.timezones.join(', ')}
📌 Maps: ${negara.maps.googleMaps}
        `.trim();

        await sock.sendMessage(id, {
            image: { url: flag },
            caption: teks
        });

    } catch (err) {
        await sock.sendMessage(id, {
            text: `❌ Gagal ambil data negara: ${err.message || err}`
        });
    }
};
