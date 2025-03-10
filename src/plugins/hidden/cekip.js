export const handler = 'cekip'
export const description = 'Cek IP Host'
import os from 'os';

const getDetailedNetworkInfo = () => {
    const networkInterfaces = os.networkInterfaces();
    const result = [];

    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        for (const address of addresses) {
            result.push({
                interface: interfaceName,
                family: address.family,
                address: address.address,
                mac: address.mac,
                netmask: address.netmask,
                internal: address.internal,
            });
        }
    }

    return result;
};
const getNetworkIPs = () => {
    const networkInterfaces = os.networkInterfaces();
    const result = [];

    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        for (const address of addresses) {
            if (address.family === 'IPv4' && !address.internal) {
                result.push({ name: interfaceName, address: address.address });
            }
        }
    }

    return result;
};



export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    console.log(id)
    const networkInfo = getDetailedNetworkInfo();
    networkInfo.forEach(async (info) => {
        await sock.sendMessage(id, {
            text: `========================================
Interface : ${info.interface}
Family    : ${info.family}
IP Address: ${info.address}
MAC Address: ${info.mac}
Netmask   : ${info.netmask}
Internal  : ${info.internal ? 'Yes' : 'No'}
========================================` })
    });
    const ips = getNetworkIPs();
    ips.forEach(async (ip) => {
        await sock.sendMessage(id, { text: `Interface: ${ip.name}, IP Address: ${ip.address}` });
    });
};
