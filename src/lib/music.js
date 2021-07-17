const Discord = require('discord.js')
const Track = require('../structures/music/track')
const Playlist = require('../structures/music/playlist')
const Queue = require('../structures/music/queue')
const ArrayShuffle = require('array-shuffle')
const EventEmitter = require('events')

class Music extends EventEmitter{
  constructor(client) {
    super()
    this.queues = new Discord.Collection()
    this.client = client
    this.utils = this.client.utils
    this.events = this.utils.events

    this.client.on("voiceStateUpdate", (oldState, newState) => {
      if (newState && newState.id === this.client.user.id && !newState.channelID) {
        try { 
          const queue = this.queues.find(gQueue => gQueue.connection && gQueue.connection.channel.id === oldState.channelID)
          if (!queue) return
          const guildId = queue.connection.channel.guild.id
          this.emit(this.events.LEAVE_CHANNEL, {guildId})
          this.stop({guild:{id:guildId}})
        } catch(e) { 
          this.emit(this.events.ERROR, e)
          this._deleteQueue({guild:{id:guildId}})
         }
      }
    })
  }
  async play(message, query){
    try {
      return this._handleTrack(message, 
        await this._resolveTrack(message, query))
    } catch (e) {
      this.emit(this.events.ERROR, e)
    }
  }
  async playSearch(message, query) {
    try {
      return this._handleTrack(message, 
        await this._resolveTrack(message, query, {withSearch: true}))
    } catch (e) {
      this.emit(this.events.ERROR, e)
    }
  }
  async playRadio(message, query) {
    if (!query) return
    if (this.utils.isUrl(query)) {
      try {
        return this._handleTrack(message, 
          await this._resolveTrack(message, query, {radio: true}))
      } catch (e) {
        this.emit(this.events.ERROR, e)
      }
    }else{
      return await this.utils.discord.sendEmbedMessage(
        message,
        {description: this.utils.strings.INVALID_RADIO_PARAMS}
      )
    }
  }
  stop(message){
    const queue = this._queue(message)
    if (!queue) return
    try {
      queue.stopped = true
      if (queue.dispatcher) queue.dispatcher.end()
      if (message instanceof Discord.Message) {
        this.utils.discord.deletePlayingMessage(message, queue)
        this.utils.discord.sendReaction(message, '👍🏼')
      }
      return this._deleteQueue(message)
    } catch (e) {
      this.emit(this.events.ERROR, e)
    }
  }
  pause(message){
    const queue = this._queue(message)
    if (!queue) return
    if (!queue.playing) return
    queue.playing = false
    queue.pause = true
    if (queue.dispatcher) queue.dispatcher.pause(true)
    return this.utils.discord.sendReaction(message, '👍🏼')
  }
  resume(message){
    const queue = this._queue(message)
    if (!queue) return
    if (!queue.pause) return
    queue.playing = true
    queue.pause = false
    if (queue.dispatcher) queue.dispatcher.resume()
    return this.utils.discord.sendReaction(message, '👍🏼')
  }
  skip(message){
    const queue = this._queue(message)
    if (!queue || !queue.tracks.length) return
    this.utils.discord.deletePlayingMessage(message, queue)
    queue.skipped = true
    queue.dispatcher.end()
    this.utils.discord.sendReaction(message, '👍🏼')
    return queue
  }
  seek(message, time){
    const queue = this._queue(message)
    if(!queue) return
    queue.beginTime = time
    this._startTrack(message)
    return this.utils.discord.sendReaction(message, '👍🏼')
  }
  volume(message, volume){
    const queue = this._queue(message)
    if (!queue) return
    queue.volume = volume
    if (queue.dispatcher) queue.dispatcher.setVolume(volume/100)
    this.utils.discord.sendReaction(message, '👍🏼')
    return queue
  }
  repeatMode(message, mode = 2){
    const queue = this._queue(message)
    if (!queue) return
    mode = parseInt(mode, 10)
    if (!mode && mode !== 0) queue.repeatMode = (queue.repeatMode + 1) % 3
    else if (queue.repeatMode === mode) queue.repeatMode = 0
    else queue.repeatMode = mode
    this.utils.discord.sendReaction(message, '👍🏼')
    return queue.repeatMode
  }
  previous(message){
    const queue = this._queue(message)
    if (!queue || queue.tracks.length < 2) return
    queue.toPrevious = true
    queue.dispatcher.end()
    this.utils.discord.deletePlayingMessage(message, queue)
    return this.utils.discord.sendReaction(message, '👍🏼')
  }
  async lyrics(message, title = null){
    const queue = this._queue(message)
    if ((!queue || !queue.playing) && !title) 
      return this.utils.discord.sendEmbedMessage(
        message,
        {description: this.utils.strings.NO_QUEUE}
      )
    const track = queue.tracks[0]
    this.utils.discord.sendReaction(message, '👍🏼')
    let lyrics,q
    if (title){
      lyrics = await this.utils.searchLyrics(`${title}`)
    }
    else if (track.source === 'spotify'){
      q = `${track.title}`
      lyrics = await this.utils.searchLyrics(`${q.trim()}`)
    }else if(track.source === 'youtube') {
      q = `${track.title}`
      lyrics = await this.utils.searchLyrics(`${q.trim()}`)
    }
    return this.utils.discord.sendEmbedMessage(
      message, 
      {title: 'Lyrics', description: !lyrics? 'No lyrics found!': lyrics}
    )
  }
  async disconnect(message){
    const queue = this._queue(message)
    if (!queue) {
      message.member.voice.channel.leave()
      return
    }
    if (queue) {
      queue.stopped = true
      queue.dispatcher.end()
    }
    const connection = this.client.voice
      .connections.find((c) => c.channel.id === queue.voiceChannelId)
    if (connection) {
      await this.utils.discord.speak(message, {
        url: this.client.lib.tts(this.utils.strings.GOODBYE_MESSAGE),
        connection
      }).then(() => {
        connection.channel.leave()
      })
    }
    this.utils.discord.sendReaction(message, '👍🏼')
    return this._deleteQueue(message)
  }
  async autoplay(message){
    let recentTracks = await this.client.recentTracks.find({guildId: message.guild.id})
    if (recentTracks && recentTracks.length) {
      recentTracks = ArrayShuffle(recentTracks)
      this._handlePlaylist(
        message,
        recentTracks.map(x => {
          const track = new Track(message)
          track.id = x.id
          track.user = x.user
          track.author = x.author
          track.title = x.title
          track.description = x.description
          track.thumbnail = x.thumbnail
          track.duration = x.duration
          track.durationMs = x.durationMs
          track.url = x.url
          track.expireStreamUrl = x.expireStreamUrl
          track.source = x.source || 'youtube'
          track.streamUrl = x.url
          track.related = x.related || []
          return track
        }),
        true
      )
      return this.utils.discord.sendReaction(message, '👍🏼')
    }
    return this.utils.discord.sendEmbedMessage(
      message,
      {description: this.utils.strings.NO_PREVIOUS_TRACKS}
    )
  }
  shuffle(message){
    const queue = this._queue(message)
    if (!queue || queue.tracks.length < 1) return
    const playing = queue.tracks.shift()
    queue.tracks = ArrayShuffle(queue.tracks)
    queue.tracks.unshift(playing)
    this.utils.discord.sendReaction(message, '👍🏼')
    return queue
  }
  showQueue(message) {
    const queue = this._queue(message)
    if (!queue) return
    const tracks = queue.tracks.slice(0, 20)

    let fields = tracks.map(track => {
      return {
        name: `${queue.playingId === track.id? '▶️ ': ''}${track.title ?? 'Unknown'} [${track.source==='radio'? 'Radio' : (track.duration ?? '00:00')}]` || 'No Title',
        value: track.url || ''
      }
    })
    this.utils.discord.sendEmbedMessage(
      message,
      {
        title: `Queue [${tracks.length} Track(s)]`,
        fields
      }
    )
  }
  async _handleOnTrackFinish(message, queue){
    if (queue.stopped) return
    if (queue.repeatMode === 2 && !queue.skipped) queue.tracks.push(queue.tracks[0])
    if (queue.tracks.length <= 1) {
      this._deleteQueue(message)
      return await this.utils.discord.deletePlayingMessage(message, queue)
    }
    if (queue.previousTracks.length && queue.toPrevious) {
      queue.tracks.unshift(queue.previousTracks.pop())
    }
    else if (queue.repeatMode !== 1 || queue.skipped) {
      const recent = queue.tracks.shift()
      queue.previousTracks.push(recent)
    }
    await this.utils.discord.deletePlayingMessage(message, queue)
    queue.toPrevious = false
    queue.skipped = false
    queue.beginTime = 0
    return await this._startTrack(message, true)
  }
  _handleOnTrackError(message, queue, err){
    if (typeof message !== 'string') {
      this.utils.discord.deletePlayingMessage(message, queue)
    }
    console.log(err)
    if (!queue) return
    const track = queue.tracks.shift()
    if (queue.tracks.length) return this._startTrack(message, true)
    this.stop(mesage)
    return this._deleteQueue(message)
  }
  async _resolveTrack(message, query, opts){
    if (query instanceof Track) return query
    if (query instanceof Playlist) return query

    if (opts.withSearch) return await this._searchTracks(message, query).catch(e => console.log(e))
    const result = await this.utils.track.resolveQuery(message, query, opts)
    return result
  }
  _searchTracks(message, query) {
    return new Promise(async (resolve) => {
      const results = await this.utils.ytSearch(query, 20)
      if (!results.length) return resolve(null)
      const previousPendingReaction = await this.utils.discord.pendingReaction(message, message.guild.id)
      if (previousPendingReaction) await this.client.pendingReactions.remove({guildId:message.guild.id})

      let content = `💡 Search '${query}'`.padStart(5, '-').padEnd(5, '-')+'\n\n'
      results.slice(0, 10).forEach((result, i) => {
        content += `${i+1}) ${this.utils.stringLimit(result.title, 37)}${'['.padStart(41-result.title.length,' ')}${result.durationFormatted}]\n`
      })
      const pendingReactionMessage = await this.utils.discord.sendFormatMessage(message, 'yaml', content)
      await Promise.all([pendingReactionMessage.react('⬆️'), pendingReactionMessage.react('⬇️')])
      await this.client.pendingReactions.insert({
        guildId: message.guild.id,
        results,
        limit: 10,
        offset: 0,
        message: {id: pendingReactionMessage.id},
        query,
        userId: message.author.id
      })
      await message.channel.awaitMessages((m) => !isNaN(parseInt(m.content, 10)) && parseInt(m.content, 10) < results.length, {max: 1, time: 80000, errors: ['time']})
        .then(async(collected) => {
          const response = collected.first()
          const index = parseInt(response.content, 10)
          const result = results[index-1]
          await this.client.pendingReactions.remove({guildId:message.guild.id})
          return resolve(new Track(message, result))
        })
    })
  }
  _handleTrack(message, track){
    if (!track) return
    if (track instanceof Playlist) return this._handlePlaylist(message, track)
    if (this._queue(message)) return this._addTrackToQueue(message, track)
    return this._createQueue(message, track)
  }
  _handlePlaylist(message, playlist){
    if (Array.isArray(playlist) && !playlist.length) return
    if (playlist instanceof Playlist && !playlist.tracks.length) return
    let tracks = Array.isArray(playlist) ? playlist: playlist.tracks
    let queue = this._queue(message)
    if (playlist instanceof Playlist) {
      this.utils.discord.sendPlaylistMessage(message, playlist)
    }
    if (queue){
      this._addTracksToQueue(message, tracks)
    }else{
      const track = tracks.shift()
      queue = this._createQueue(message, track)
      if (tracks.length) this._addTracksToQueue(message, tracks)
      tracks.unshift(track)
    }
  }
  async _createStream(queue){
    const track = queue.tracks[0]
    if (!track.streamUrl){
      track.streamUrl = await this.utils.track.streamUrl(track)
    }
    if (track.source !== 'attachment' && track.isExpired()) {
      track.streamUrl = await this.utils.track.streamUrl(track)
    }
    const streamUrl = track.streamUrl
    if (!streamUrl && !track.url) return
    return streamUrl
  }
  async _startTrack(message, withMessage = false){
    const queue = this._queue(message)
    if (!queue.tracks.length) return this._deleteQueue(message)
    if (queue.stopped) return
    let track = queue.tracks[0]

    if (withMessage) {
      queue.playingMessage = this.utils.discord.sendPlayingMessage(message, track, queue)
    }

    const stream = await this._createStream(queue)
    if (!stream) {
      return await this._handleOnTrackError(message, queue, {})
    }
    if (!track.streamUrl) return
    let options = this.client.utils.config.discordSpeakConfigs
    options.seek = queue.beginTime
    options.volume = queue.volume / 100
    queue.dispatcher = queue.connection.play(stream, options)
      .on('finish', async () => await this._handleOnTrackFinish(message, queue))
      .on('error', err => this._handleOnTrackError(message, queue, err))
    if (queue.repeatMode !== 1) {
      track.guildId = message.guild.id
      this.client.recentTracks.insert(track)
        .catch(e => {})
    }
    // if (queue.currentStream) queue.currentStream.destroy()
    // queue.currentStream = stream
    if (!message.client) message.client = this.client
    this.utils.discord.save(message, {queue: queue.saveInfo()})
    queue.playing = true
    queue.playingId = track.id
  }
  _queue(message){
    return this.queues.get(message.guild.id)
  }
  _createQueue(message, track){
    if (!track) return
    const voiceChannel = message.member.voice.channel
    if (!voiceChannel) return this.client.utils
      .discord.sendEmbedMessage(message, {
        description: this.client.utils.strings.NO_VOICE_CHANNEL
      })
    const queue = new Queue(message, track)
    this.queues.set(queue.id, queue)
    voiceChannel
      .join()
      .then(connection => {
        queue.connection = connection
        connection.voice.setSelfDeaf(true)
        this._startTrack(message, true)
      })
      .catch(e => console.log(e))
  }
  _addTrackToQueue(message, track){
    const queue = this._queue(message)
    if (!queue || !track) return
    queue.tracks.push(track)
    this.utils.discord.sendEmbedMessage(
      message,
      {description: `Queued [${track.title}](${track.url}) [<@${message.author.id}>]`}
    )
    return queue
  }
  _addTracksToQueue(message, tracks){
    const queue = this._queue(message)
    if (!Array.isArray(tracks) || !tracks.length) return
    queue.tracks.push(...tracks)
    return queue
  }
  _deleteQueue(message){
    const queue = this._queue(message)
    if (!queue) return
    if (queue.dispatcher) queue.dispatcher.destroy()
    // if (queue.stream) queue.stream.destroy()
    this.client.server.update({guildId: message.guild.id}, {$set:{queue:null}})
    return this.queues.delete(message.guild.id)
  }
  async _handleOnWakeUp(client) {
    const servers = await client.server.find()
    const serversRecovery = servers.filter(p => p.queue && p.queue.playing && p.voiceChannelId)
    if (serversRecovery.length) console.log(`[BOT] Check and Restore server data (${serversRecovery.length}) server.`)
    serversRecovery.forEach(async (server) => {
      const voiceChannel = client.channels.cache.get(server.voiceChannelId)
      if (!voiceChannel) return

      const newQueue = new Queue({guild: {id: server.guildId}, voiceChannelId: server.voiceChannelId, channelId: server.channelId})
      newQueue.import({
        guild: {id: server.guildId},
        client
      }, server.queue)
      newQueue.connection = await voiceChannel.join()
      this.queues.set(server.guildId, newQueue)

      this._startTrack({guild: {id: server.guildId}})
    })
  }
}

module.exports = Music