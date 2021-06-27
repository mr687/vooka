const {
  formatDuration
} = require('./duration')

class Song {
  constructor(info, user, youtube = true, preQueue = false) {
    this.user = user || null
    this.id = info.id || info.videoId || ''
    this.name = info.title || info.fulltitle || ''
    this.youtube = youtube
    this.isLive = info.is_live || info.isLive || false
    this.duration = info.duration || info.seconds || ''
    this.track = info.track || info.alt_title || this.name || null
    this.formattedDuration = this.isLive ? 'Live' : formatDuration((this.duration || 0) * 1000)
    this.url = info.webpage_url || info.url || ''
    this.streamUrl = preQueue ? null : info.url || ''
    this.thumbnail = info.thumbnails ? info.thumbnails.sort((a, b) => b.width - a.width)[0].url : info.thumbnail || null;
  }
}

module.exports = Song