const {
  formatDuration
} = require("./duration")
const Song = require('./song')

class Playlist {
  constructor(playlist, user) {
    this.user = user || playlist.users
    this.songs = []
    if (Array.isArray(playlist)) {
      playlist.forEach(song => {
        if (typeof song === Song) this.songs.push(song)
        else {
          const newSong = new Song(song, user)
          this.songs.push(newSong)
        }
      })
    } else {
      if (playlist.entries) {
        playlist.entries.forEach(song => {
          const newSong = new Song(song, user)
          this.songs.push(newSong)
        })
      }
    }

    if (!Array.isArray(this.songs) || !this.songs.length || this.songs.length < 1) throw new Error("Playlist is empty!")
    this.name = playlist.title
    this.url = playlist.webpage_url
    this.thumbnail = this.songs[0].thumbnail
    this.totalItems = this.songs.length || 0
    this.id = playlist.id || ""
    this.author = playlist.uploader || ""
  }
}

module.exports = Playlist