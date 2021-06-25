class Queue {
  constructor(message, song) {
    this.dispatcher = null
    this.connection = null
    this.volume = 100
    this.songs = [song]
    this.stopped = false
    this.skipped = false
    this.playing = true
    this.pause = false
    this.repeatMode = 2
    this.autoplay = false
    this.filter = null
    this.initMessage = message
    this.stream = null
    this.beginTime = 0
    this.previousSongs = []
  }
}

module.exports = Queue