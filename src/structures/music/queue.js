const { Message } = require('discord.js')
const { strings } = require('../../utils')
const Track = require('./track')

class Queue{
  constructor(message, track) {
    this.id = message.guild.id
    this.connection = null
    this.dispatcher = null
    this.voiceChannelId = message.member?message.member.voice.channel.id:null || message.voiceChannelId || null
    this.channelId = message.channel?message.channel.id:null || message.channelId || null
    this.tracks = track? [track]: []
    this.stopped = false
    this.skipped = false
    this.playing = true
    this.playingId = null
    this.pause = false
    this.volume = 100
    this.repeatMode = 0
    this.beginTime = 0
    this.toPrevious = false
    this.previousTracks = []
    this.currentStream = null
    this.playingMessage = null
  }

  saveInfo() {
    return {
      id: this.id,
      voiceChannelId: this.voiceChannelId,
      channelId: this.channelId,
      tracks: this.tracks,
      stopped: this.stopped,
      skipped: this.skipped,
      playing: this.playing,
      playingId: this.playingId,
      pause: this.pause,
      volume: this.volume,
      repeatMode: this.repeatMode,
      beginTime: this.beginTime,
      toPrevious: this.toPrevious,
      previousTracks: this.previousTracks,
      currentStream: this.currentStream
    }
  }

  import(message, data){
    this.id = data.id
    this.voiceChannelId = data.voiceChannelId
    this.channelId = data.channelId
    this.tracks = data.tracks.map(i => new Track(message, i, i.source))
    this.stopped = data.stopped
    this.skipped = data.skipped
    this.playing = data.playing
    this.playingId = data.playingId
    this.pause = data.pause
    this.volume = data.volume
    this.repeatMode = data.repeatMode
    this.beginTime = data.beginTime
    this.toPrevious = data.toPrevious
    this.previousTracks = data.previousTracks
    this.currentStream = data.currentStream
  }
}

module.exports = Queue