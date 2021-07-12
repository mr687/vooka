const {nanoid} = require('nanoid')

class Track{
  constructor(message, track = {}, source = 'youtube'){
    const {buildTimeCode, parseMs} = message.client.utils
    this.id = track.id || nanoid(5)
    this.user = message.author || track.user || null
    this.author = track.author?track.author:null || track.channel? track.channel.name: null || 
      (track.artists&&track.artists[0]? track.artists[0].name: null) || 'Unknown'
    this.title = track.title || track.title || track.name || null
    this.description = track.description || track.description || null
    this.thumbnail = track.thumbnail? track.thumbnail:null || track.thumbnail? track.thumbnail.displayThumbnailURL(): null ||
      (track.thumbnail? track.thumbnail.url: null) || 
        track.album&&track.album.images[0]? track.album.images[0].url: null || null
    this.duration = track.duration?track.duration:null || track.duration? buildTimeCode(parseMs(track.duration)): null ||
      track.duration_ms? buildTimeCode(parseMs(track.duration_ms)): null || null
    this.durationMs = track.durationMs || track.duration || track.duration_ms || 0
    this.url = track.url || (track.external_urls ? track.external_urls.spotify : null) || null
    this.source = track.source || source
    this.expireStreamUrl = track.expireStreamUrl || null
    this.streamUrl = track.streamUrl || null
    this.stream = track.stream || null
    this.related = track.related || track.videos || []
  }

  isExpired() {
    if (!this.expireStreamUrl) return false
    const now = new Date().getTime()/1000
    return now >= (parseInt(this.expireStreamUrl) - this.durationMs)
  }
}

module.exports = Track