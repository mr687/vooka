class Queue {
  constructor(message=null, song = null) {
    this.dispatcher = null
    this.connection = null
    this.volume = 100
    this.songs = song? [song] : []
    this.stopped = false
    this.skipped = false
    this.playing = true
    this.pause = false
    this.repeatMode = 0
    this.autoplay = false
    this.filter = null
    this.initMessage = message || null
    this.stream = null
    this.beginTime = 0
    this.previousSongs = []
  }

  import(o) {
    let info = o
    if (typeof o === 'string') info = JSON.parse(o)
    Object.keys(info).forEach(key => {
      if (!key) return
      if (this[key]) {
        this[key]=info[key]
      }
    })
    return this
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