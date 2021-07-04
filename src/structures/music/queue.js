const { Message } = require('discord.js')
const { strings } = require('../../utils')

class Queue{
  constructor(message, track) {
    if (!message instanceof Message) throw new (strings.INVALID_MESSAGE)
    this.id = message.guild.id
    this.connection = null
    this.dispatcher = null
    this.voiceChannelId = message.member.voice.channel.id
    this.channelId = message.channel.id
    this.tracks = track? [track]: []
    this.stopped = false
    this.skipped = false
    this.playing = true
    this.playingId = null
    this.pause = false
    this.volume = 100
    this.repeatMode = 0
    this.beginTime = 0
    this.previousTracks = []
    this.currentStream = null
    this.playingMessage = null
  }
}

module.exports = Queue