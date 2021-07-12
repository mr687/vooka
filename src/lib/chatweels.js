const cheerio = require('cheerio')
const rp = require('request-promise')
const UserAgent = require('user-agents')
const userAgent = new UserAgent({ deviceCategory: "desktop" })

const req = rp.defaults({
  headers: { "User-Agent": userAgent.random().toString() },
})

async function start() {
  const url = 'https://chatbot.admiralbulldog.live/playsounds'
  const html = await req(url)
  const $ = cheerio.load(html)

  const tables = $('table.ui.collapsing.single.line.compact.table')
}
start()