import puppeteer from "puppeteer"
const baseurl = 'https://grabnwatch.com/poophd.cc'

const uri = 'https://poophd.pm/e/9skdkmed8nwd'


const download = async()=>{
    const browser = await puppeteer.launch({headless:true})
    const pp = await browser.newPage()
}