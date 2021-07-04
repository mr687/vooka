const Discord = require('discord.js')
const Spotify = require('spotify-url-info')
const Youtube = require('youtube-sr').default
const Track = require('../structures/music/track')
const Playlist = require('../structures/music/playlist')
const Queue = require('../structures/music/queue')
const ytdl = require('ytdl-core')
const ArrayShuffle = require('array-shuffle')

class Music{
  constructor(client) {
    this.queues = new Discord.Collection()
    this.client = client
    this.utils = this.client.utils

    this.client.on("voiceStateUpdate", (oldState, newState) => {
      if (newState && newState.id === this.client.user.id && !newState.channelID) {
        let queue = this.queues.find(gQueue => gQueue.connection && gQueue.connection.channel.id === oldState.channelID)
        if (!queue) return
        let guildID = queue.connection.channel.guild.id
        try { this.stop({guild:{id:guildID}}) } catch { this._deleteQueue({guild:{id:guildID}}) }
      }
    })
  }
  async play(message, query){
    return this._handleTrack(message, 
      await this._resolveTrack(message, query))
  }
  async playSearch(message, query) {
    return this._handleTrack(message,
      await this._resolveTrack(message, query, true))
  }
  stop(message){
    const queue = this._queue(message)
    if (!queue) return
    queue.stopped = true
    if (queue.dispatcher) queue.dispatcher.end()
    if (message instanceof Discord.Message) {
      this.utils.discord.deletePlayingMessage(message, queue)
      this.utils.discord.sendReaction(message, '👍🏼')
    }
    return this._deleteQueue(message)
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
    if (!queue || !queue.tracks.length) {
      this.utils.discord.deletePlayingMessage(message, queue)
      return
    }
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
    if (!queue.previousTracks.length) return
    const track = queue.previousTracks.pop()
    this.toPrevious = true
    queue.tracks.unshift(track)
    this.queues.set(message.guild.id, queue)
    queue.dispatcher.end()
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
    let lyrics,q
    if (title){
      lyrics = await this.utils.searchLyrics(`${title}`)
    }
    else if (track.source === 'spotify'){
      q = `${track.title} ${track.author || ''}`
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
    return this._deleteQueue(message)
  }
  async autoplay(message){
    const recentTracks = await this.client.recentTracks.find({guildId: message.guild.id})
    if (recentTracks && recentTracks.length) {
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
          track.url = x.url
          track.source = x.source || 'youtube'
          track.streamUrl = x.url
          return track
        })
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
    const tracks = queue.tracks

    let fields = tracks.map(track => {
      return {
        name: `${queue.playingId === track.id? '▶️ ': ''}${track.title} [${track.duration}]` || 'No Title',
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
  _handleOnTrackFinish(message, queue){
    if (queue.stopped) return
    if (queue.repeatMode === 2 && !queue.skipped) queue.tracks.push(queue.tracks[0])
    if (queue.tracks.length <= 1 && (queue.skipped || !queue.repeatMode)) {
      // if (queue.autoplay) try { await this.addRelatedVideo(message) } catch { this.emit("noRelated", message) }
      if (queue.tracks.length <= 1) {
        this._deleteQueue(message)
        // if (this.options.leaveOnFinish && !queue.stopped) queue.connection.channel.leave()
        return this.utils.discord.deletePlayingMessage(message, queue)
      }
    }
    if ((queue.repeatMode !== 1 || queue.skipped) && !queue.toPrevious) {
      const recent = queue.tracks.shift()
      queue.previousTracks.push(recent)
      this.utils.discord.deletePlayingMessage(message, queue)
    }
    queue.toPrevious = false
    queue.skipped = false
    queue.beginTime = 0
    this._startTrack(message, true)
  }
  _handleOnTrackError(message, queue, err){
    this.utils.discord.deletePlayingMessage(message, queue)
    console.log(err)
    if (!queue) return
    const track = queue.tracks.shift()
    if (queue.tracks.length) return this._startTrack(message, true)
    this.stop(mesage)
    return this._deleteQueue(message)
  }
  async _resolveTrack(message, query, withSearch = false){
    if (query instanceof Track) return query
    if (query instanceof Playlist) return query

    const type = this.utils.urlType(query)
    let info,search,track,playlist = undefined
    switch (type) {
      case 'spotify_song':
        info = await Spotify.getData(query)
        if (!info) return
        return new Track(message, info, 'spotify')
      case 'youtube_video':
        info = await Youtube.getVideo(query)
        if (!info) return
        return new Track(message, info, 'youtube')
      case 'spotify_album':
      case 'spotify_playlist':
        playlist = new Playlist()
        info = await Spotify.getTracks(query)
        if (!info) return
        if (info.type === 'playlist') {
          info = info.track
        }
        playlist.tracks = info.map(i => new Track(message, i, 'spotify'))
        playlist.duration = playlist.tracks?.reduce((a, c) => a + (c.durationMS || 0), 0) || 0
        playlist.thumbnail = info[0] ? info[0].album? info[0].album.images[0]? info[0].album.images[0].url: null: null : null
        playlist.title = info.title || info.name || null
        playlist.user = message.author
        return playlist
      case 'youtube_playlist':
        search = await Youtube.getPlaylist(query)
        if (!search) return
        playlist = new Playlist()
        playlist.tracks = search.videos.map(i => new Track(message, i, 'youtube'))
        playlist.duration = search.videos.reduce((a,c) => a + c.durationMS, 0)
        playlist.thumbnail = search.thumbnail? search.thumbnail.url: null || search.videos[0].thumbnail || null
        playlist.user = message.author
        return playlist
      case 'attachment':
        track = new Track(message, {}, 'attachment')
        track.url = this.streamUrl = query
        track.source = type
        track.user = message.author
        return track
      default:
        if (withSearch) return await this._searchTracks(message, query).catch(e => console.log(e))
        search = await Youtube.searchOne(query,'video')
        if (!search) return
        return new Track(message, search, 'youtube')
    }
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
    const tracks = Array.isArray(playlist) ? playlist: playlist.tracks
    let queue = this._queue(message)
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
    let streamOptions = this.utils.config.streamConfigs
    if (track.source !== 'attachment') return ytdl(await track.streamUrl, streamOptions)
    return await track.streamUrl || track.url
  }
  async _startTrack(message, withMessage = false){
    const queue = this._queue(message)
    if (!queue.tracks.length) return this._deleteQueue(message)
    if (queue.stopped) return
    let track = queue.tracks[0]
    if (!track.streamUrl) return
    const stream = await this._createStream(queue)
    if (!stream) {
      return await this._handleOnTrackError(message, queue, {})
    }
    
    if (withMessage) {
      queue.playingMessage = this.utils.discord.sendPlayingMessage(message, track, queue)
    }

    let options = this.client.utils.config.discordSpeakConfigs
    options.seek = queue.beginTime
    options.volume = queue.volume / 100
    queue.dispatcher = queue.connection.play(stream, options)
      .on('finish', () => this._handleOnTrackFinish(message, queue))
      .on('error', err => this._handleOnTrackError(message, queue, err))
    if (queue.repeatMode !== 1) {
      track.guildId = message.guild.id
      this.client.recentTracks.insert(track)
        .catch(e => {})
    }
    // if (queue.currentStream) queue.currentStream.destroy()
    // queue.currentStream = stream
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
    this.utils.discord.sendEmbedMessage(
      message,
      {description: `Queued [${tracks[0].title}](${tracks[0].url}) and ${tracks.length-1} mores [<@${message.author.id}>]`}
    )
    return queue
  }
  _deleteQueue(message){
    const queue = this._queue(message)
    if (!queue) return
    if (queue.dispatcher) queue.dispatcher.destroy()
    if (queue.stream) queue.stream.destroy()
    return this.queues.delete(message.guild.id)
  }
}

module.exports = Music