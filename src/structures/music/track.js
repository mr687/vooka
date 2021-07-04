const Youtube = require('youtube-sr')
const {nanoid} = require('nanoid')
const YoutubeDl = require('ytdl-getinfo')

class Track{
  constructor(message, track = {}, source = 'youtube'){
    const {buildTimeCode, parseMs, ytSearch, config, discord} = message.client.utils
    this.id = track.id || nanoid(5)
    this.user = message.author || null
    this.author = track.channel? track.channel.name: null || 
      (track.artists&&track.artists[0]? track.artists[0].name: null) || 'Unknown'
    this.title = track.title || track.name || null
    this.description = track.description || null
    this.thumbnail = track.thumbnail? track.thumbnail.displayThumbnailURL(): null ||
      (track.thumbnail? track.thumbnail.url: null) || 
        track.album&&track.album.images[0]? track.album.images[0].url: null || null
    this.duration = track.durationFormatted || track.duration? buildTimeCode(parseMs(track.duration)): null ||
      track.duration_ms? buildTimeCode(parseMs(track.duration_ms)): null || null
    this.url = track.url || (track.external_urls ? track.external_urls.spotify : null) || source==='youtube'?`https://www.youtube.com/watch?v=${this.id}`:null
    this.source = source
    this.streamUrl = null
    this.stream = null
  }

  searchStreamUrl(utils) {
    if (!this.url) return
    let ytStream = null
    const {buildTimeCode, parseMs, ytSearch, config, discord} = utils
    return new Promise(async (resolve) => {
      switch (this.source) {
        case 'youtube':
          if (!this.url) return
          ytStream = await YoutubeDl.getInfo(this.url, config.ytdlConfigs())
          if (!ytStream && !ytStream.items.length) return resolve(null)
          this.source = 'attachment'
          return resolve(ytStream.items[0].url)
        case 'attachment':
          return resolve(this.url)
        case 'spotify':
          let q = `${this.title} ${this.author || ''}`
          const yt = await ytSearch(q.trim(), 1)
          if (!yt) return
          ytStream = await YoutubeDl.getInfo(yt.url, config.ytdlConfigs())
          if (!ytStream && !ytStream.items.length) return resolve(null)
          this.source = 'attachment'
          return resolve(ytStream.items[0].url)
        default:
          return this.url
      }
    })
  }
}

module.exports = Track