import axios from 'axios'
const baseurlSearch = 'https://api-pddikti.kemdiktisaintek.go.id/pencarian/mhs/'
const baseurlDetail = 'https://api-pddikti.kemdiktisaintek.go.id/detail/mhs/'

const search = async (q) => {
    const { data } = await axios.get(baseurlSearch + q, {
        headers: {
            'x-api-key': '3ed297db-db1c-4266-8bf4-a89f21c01317'
        }
    })
    // console.log(decoded)
    return data
}
const detail = async (id) => {
    const { data } = await axios.get(baseurlDetail + id, {
        headers: {
            'x-api-key': '3ed297db-db1c-4266-8bf4-a89f21c01317'
        }
    })
    // console.log(decoded)
    return data
}



(async () => {
    // console.log(await search("Roynaldi"))
    // const data = await search("SSI202203088").then(async (res) => await detail(res[0].id))
    // console.log(data)
    // console.log(await detail("b_Ww7jKEVqqfyaIbnccQbror8rZZ0oLAI7DgBoUOGMGGYmJ2VCvHTiC0WHb4XT7BbqD-fw=="))
})()