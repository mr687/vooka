const request = require('request')

const key = 'b9b9b4d7b8828a5e99f1b192b942f615'
const url = 'https://api.yumika.id/radio/'

const req = (q, p = 1) => {
  if (!q) return
  return new Promise((resolve) => {
    request(
      `${url}?a=${q}&hal=${p}&key=${key}`,
      {json:true},
      (e, r, b) => {
        if (e) return resolve(null)
        if (b) return resolve(b)
        return resolve(null)
      })
  })
}

const actions = {
  // save: async (message, args) => {

  // },
  play: async (message, args) => {
    const q = args.join(' ')
    return await message.client.lib.music.playRadio(message, q)
  },
  // del: async (message, args) => {
  
  // },
  search: async (message, args) => {
    const q = args.join(' ')
    await message.react('⏳')
    const res = await req(q)
    if (!res) return
    const stations = res.filter(p => p.bitrate.toLowerCase().includes('k'))
    if (!stations.length){
      return await message.client.utils.discord.sendEmbedMessage(message, {description: 'Not found!'})
    }
    let fields = ['Result: 🥂']
    stations.slice(0,5).forEach((s, si) => {
      let text = `${si+1}) Name: ${s.nama}`
      if (s.cat1) text += `\n   Cats: ${s.cat1}`
      if (s.cat2) text += `, ${s.cat2}`
      if (s.cat3) text += `, ${s.cat3}`
      if (s.stream && s.stream.length > 1) {
        text += `\n   Urls: [${s.stream.slice(0,3).join(' | ')}]`
      }
      fields.push(text)
    })
    return await message.client.utils.discord
      .sendFormatMessage(message, 'javascript', fields.join('\n\n'))
  },
}

module.exports = {
  name: 'radio',
  description: 'Play radio station(s)',
  args: true,
  async execute(message, args) {
    const act = args.shift()
    if (actions[act]) return await actions[act](message, args)
  }
}