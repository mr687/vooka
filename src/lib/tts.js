const url = require('url')

const host = 'https://translate.google.com/'
const path = 'translate_tts'
const params = {
  ie: 'UTF-8',
  q: '',
  tl: 'en',
  total: 1,
  idx: 0,
  textlen: 10,
  client: 'tw-ob',
  prev: 'input',
  ttsspeed: 1,
}

module.exports = (text, lang = 'en') => {
  params.textlen = text.length
  params.q = text.trim()
  params.tl = lang.toLowerCase()
  return host+path+url.format({query:params})
}