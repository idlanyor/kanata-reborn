// import canvafy from "canvafy";

const getPpUrl = async (sock, id) => {
    const ppUrl = globalThis.defaultProfilePic
    try {
        return await sock.profilePictureUrl(id, "image")
    } catch {
        return ppUrl
    }
}
// export async function Welcome(sock, sender, namaGrup, pushName) {
//     return await fetch(`https://api.siputzx.my.id/api/canvas/welcomev1?username=${sender || pushName}&guildName=${namaGrup}&memberCount=999&guildIcon=${globalThis.kanataThumb}&avatar=${await getPpUrl(sock, pushName)}&background=${globalThis.kanataCover}`)
// }

export async function Welcome(sock, sender, namaGrup, pushName) {
    return 0;
    // return await new canvafy.WelcomeLeave()
    //     .setAvatar(await getPpUrl(sock, pushName))
    //     .setBackground("image", "https://telegra.ph/file/cad7038fe82e47f79c609.jpg")
    //     .setAvatarBorder("#db1514")
    //     .setTitle(`Welcome User !`)
    //     .setDescription(`Selamat datang di Grup ${namaGrup}`)
    //     .setOverlayOpacity(0.5)
    //     .build()
}