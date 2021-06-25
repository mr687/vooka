const {
  formatDuration
} = require('./duration')

class Song {
  constructor(info, user, youtube = true) {
    this.user = user
    this.id = info.id
    this.name = info.title
    this.youtube = youtube
    this.isLive = info.is_live || info.isLive || false
    this.duration = info.duration
    this.formattedDuration = this.isLive ? 'Live' : formatDuration(this.duration * 1000)
    this.url = info.webpage_url
    this.streamUrl = info.url
    this.thumbnail = info.thumbnails ? info.thumbnails.sort((a, b) => b.width - a.width)[0].url : info.thumbnail || null;
  }
}

module.exports = Song