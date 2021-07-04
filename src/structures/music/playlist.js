const {nanoid} = require('nanoid')

class Playlist{
  constructor() {
    this.id = nanoid(5)
    this.title = null
    this.tracks = []
    this.duration = 0
    this.thumbnail = null
    this.user = null
  }
}

module.exports = Playlist