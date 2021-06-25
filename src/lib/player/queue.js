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
    this.repeatMode = 0
    this.autoplay = false
    this.filter = null
    this.initMessage = message
    this.stream = null
    this.beginTime = 0
    this.previousSongs = []
  }

  toDatabase() {
    return JSON.stringify({
      volume: this.volume,
      songs: this.songs,
      stopped: this.stopped,
      skipped: this.skipped,
      playing: this.playing,
      pause: this.pause,
      repeatMode: this.repeatMode,
      autoplay: this.autoplay,
      filter: this.filter,
      stream: this.stream,
      beginTime: this.beginTime,
      previousSongs: this.previousSongs,
    })
  }
}

module.exports = Queue