const {
  formatDuration
} = require("./duration")
const Song = require('./song')

class Playlist {
  constructor(playlist, user) {
    this.user = user
    this.songs = []
    this.partial = playlist.partial || false
    this.event = this.partial ? playlist || null : null
    if (Array.isArray(playlist)) {
      playlist.forEach(song => {
        this.songs.push(song)
      })
    }
    if (playlist.items) {
      playlist.items.forEach(song => {
        const newSong = new Song(song, user)
        this.songs.push(newSong)
      })
    }

    this.totalItems = this.songs.length || 0
  }
}

module.exports = Playlist