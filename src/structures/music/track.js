const Youtube = require('youtube-sr')
const {nanoid} = require('nanoid')

class Track{
  constructor(message, track = {}, source = 'youtube'){
    const {buildTimeCode, parseMs, ytSearch, config} = message.client.utils
    this.id = track.id || nanoid(5)
    this.user = message.author || null
    this.author = track.channel? track.channel.name: null || 
      (track.artists&&track.artists[0]? track.artists[0].name: null) || 'Unknown'
    this.title = track.title || track.name || null
    this.description = track.description || null
    this.thumbnail = track.thumbnail? track.thumbnail.displayThumbnailURL(): null ||
      (track.thumbnail? track.thumbnail.url: null) || 
        ((track.album&&track.album.images[0]&&track.album.images[0].url) ||
          (track.preview_url&&track.preview_url.length)) ?
            `https://i.scdn.co/image/${track.preview_url.split('?cid=')[1]}`:
              'https://www.scdn.co/i/_global/twitter_card-default.jpg' || null
    this.duration = track.durationFormatted || track.duration? buildTimeCode(parseMs(track.duration)): null ||
      track.duration_ms? buildTimeCode(parseMs(track.duration_ms)): null || null
    this.url = track.url || (track.external_urls ? track.external_urls.spotify : null) || null
    this.source = source
    this.streamUrl = this._searchStreamUrl(ytSearch, buildTimeCode, parseMs) || this.url
    this.stream = null
  }

  async _searchStreamUrl(ytSearch, buildTimeCode, parseMs) {
    switch (this.source) {
      case 'youtube':
      case 'attachment':
        return this.url
      case 'spotify':
        let q = `${this.title} ${this.author || ''}`
        const yt = await ytSearch(q.trim(), 1)
        if (!yt) return
        this.title = yt.title
        this.thumbnail = yt.thumbnail.url
        this.duration = buildTimeCode(parseMs(yt.duration || 0))
        this.source = 'youtube'
        this.url = yt.url
        return this.url
      default:
        return this.url
    }
  }
}

module.exports = Track