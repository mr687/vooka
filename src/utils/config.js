require('dotenv').config()

module.exports = {
  streamConfigs: {
    filter: 'audioonly',
    quality: 'highestaudio',
    highWaterMark: 1,
    requestOptions: {},
    seek: 0,
  },
  discordSpeakConfigs: {
    volume: 1,
    bitrate: 'auto',
    highWaterMark: 1
  },
  ytdlConfigs: () => {
    let conf = ['--default-search=ytsearch', '-i', '--format=bestaudio']
    const proxy = process.env.PROXY || null
    if (proxy) {
      conf.push(`--proxy=${proxy}`)
    }
    return conf
  },
  discord: { partials: ['MESSAGE', 'CHANNEL', 'REACTION'] }
}