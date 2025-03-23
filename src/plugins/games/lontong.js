import { caklontong } from "../../lib/tebak/index.js";
export const handler = "lontong"
export const description = "Teka Teki Sulit Cak Lontong";

export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    await caklontong(id, sock);
};
