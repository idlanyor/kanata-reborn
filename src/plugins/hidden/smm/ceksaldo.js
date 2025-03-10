export const handler = 'ceksaldo'
export const description = 'Cek Saldo SMM'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    console.log(globalThis.isOwner(noTel))
};
