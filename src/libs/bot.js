const {
  Client,
  Collection,
  MessageEmbed
} = require('discord.js')
const ytcore = require('ytdl-core-discord')
const Queue = require('./queue')
const Playlist = require('./playlist')
const Song = require('./song')
const ytdl = require('../parties/youtubedl')
const ytsr = require('../parties/ytsearch')

const isURL = string => {
  if (string.includes(" ")) return false;
  try {
    const url = new URL(string);
    if (!["https:", "http:"].includes(url.protocol) ||
      url.origin === "null" || !url.host
    ) return false;
  } catch {
    return false
  }
  return true;
}

const ffmpegFilters = {
  "3d": "apulsator=hz=0.125",
  bassboost: "bass=g=10,dynaudnorm=f=150:g=15",
  echo: "aecho=0.8:0.9:1000:0.3",
  flanger: "flanger",
  gate: "agate",
  haas: "haas",
  karaoke: "stereotools=mlev=0.1",
  nightcore: "asetrate=48000*1.25,aresample=48000,bass=g=5",
  reverse: "areverse",
  vaporwave: "asetrate=48000*0.8,aresample=48000,atempo=1.1",
  mcompand: "mcompand",
  phaser: "aphaser",
  tremolo: "tremolo",
  surround: "surround",
  earwax: "earwax",
}

class Bot {
  constructor(client, options = null) {
    if (!client && typeof client !== Client) throw new SyntaxError('Invalid Discord.Client')

    this.client = client
    this.guildQueues = new Collection()
    this.filters = ffmpegFilters
    this.options = options

    client.on('voiceStateUpdate', (oldState, newState) => {
      if (newState && newState.id === client.user.id && !newState.channelID) {
        let queue = this.guildQueues.find(gQueue => gQueue.connection && gQueue.connection.channel.id === oldState.channelID)
        if (!queue) return

        let guildID = queue.connection.channel.guild.id
        // Stop from guildID
      }
    })

  }

  skip(msg) {
    const queue = this.getQueue(msg)
    if (!queue) throw new Error("NotPlaying")
    if (queue.songs <= 1 && !queue.autoplay) throw new Error("NoSong")
    queue.skipped = true
    queue.dispatcher.end()
    msg.react('🤝')
    return queue
  }

  async play(msg, song) {
    if (!song) return

    try {
      const resolvedSong = await this._resolveSong(msg, song)
      await this._handleSong(msg, resolvedSong)
    } catch (error) {
      console.log(error)
    }
  }

  stop(msg) {
    const queue = this.getQueue(msg)
    if (!queue) throw new Error("NotPlaying");
    queue.stopped = true
    if (queue.dispatcher) {
      try {
        queue.dispatcher.end()
      } catch {}
    }
    this._deleteQueue(msg)
    msg.react('🤝')
  }

  pause(msg) {
    let queue = this.getQueue(msg);
    if (!queue) throw new Error("NotPlaying");
    queue.playing = false;
    queue.pause = true;
    queue.dispatcher.pause(true);
    msg.react('🤝')
    return queue;
  }

  resume(msg) {
    try {
      let queue = this.getQueue(msg);
      if (!queue) throw new Error("NotPlaying");
      queue.playing = true;
      queue.pause = false;
      queue.dispatcher.resume();
      msg.react('🤝')
      return queue;
    } catch (er) {
      console.log(er)
    }
  }

  setVolume(msg, percent) {
    let queue = this.getQueue(msg);
    if (!queue) throw new Error("NotPlaying");
    queue.volume = percent;
    queue.dispatcher.setVolume(queue.volume / 100);
    msg.react('🤝')
    return queue
  }

  shuffle(msg) {
    let queue = this.getQueue(msg);
    if (!queue) throw new Error("NotPlaying");
    let playing = queue.songs.shift();
    for (let i = queue.songs.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
    }
    queue.songs.unshift(playing);
    return queue;
  }

  async disconnect(msg) {
    const queue = this.getQueue(msg)
    if (!queue) return
    await queue.connection.channel.leave()
    this._deleteQueue(msg)
    msg.react('🤝')
  }

  jump(msg, num) {
    let queue = this.getQueue(msg);
    if (!queue) throw new Error("NotPlaying");
    if (num > queue.songs.length || num < 1) throw new Error("InvalidSong");
    queue.songs = queue.songs.splice(num - 1);
    queue.skipped = true;
    if (queue.dispatcher) queue.dispatcher.end();
    return queue;
  }

  async seek(msg, time) {
    let queue = this.getQueue(msg);
    if (!queue) throw new Error("NotPlaying");
    queue.beginTime = time;
    await this._playSong(msg, false);
    msg.react('🤝')
  }

  async setRepeatMode(msg, mode = 2) {
    let queue = this.getQueue(msg);
    if (!queue) throw new Error("NotPlaying");
    mode = parseInt(mode, 10);
    if (!mode && mode !== 0) queue.repeatMode = (queue.repeatMode + 1) % 3;
    else if (queue.repeatMode === mode) queue.repeatMode = 0;
    else queue.repeatMode = mode;

    const newMode = mode ? mode == 2 ? "queue" : "track" : "off";

    let content
    if (newMode !== 'off') {
      content = `Now looping the **${newMode}**.`
    } else {
      content = `Looping is now **disabled**.`
    }

    await msg.channel.send(
      this._embedMessage(false, content)
    )

    return queue.repeatMode;
  }

  toggleAutoplay(msg) {
    let queue = this.getQueue(msg);
    if (!queue) throw new Error("NotPlaying");
    queue.autoplay = !queue.autoplay;
    return queue.autoplay;
  }

  isPlaying(msg) {
    let queue = this.getQueue(msg);
    return queue ? queue.playing || !queue.pause : false;
  }

  isPaused(msg) {
    let queue = this.getQueue(msg);
    return queue ? queue.pause : false;
  }

  _isVoiceChannelEmpty(queue) {
    let voiceChannel = queue.connection.channel;
    let members = voiceChannel.members.filter(m => !m.user.bot);
    return !members.size;
  }

  async _playSong(msg, withNotify = true) {
    const queue = this.getQueue(msg)

    if (!queue) return
    if (!queue.songs.length) {
      this._deleteQueue(msg)
      return
    }
    const song = queue.songs[0]
    try {
      if (song.youtube) {
        const stream = await this._createStream(queue)
        queue.dispatcher = queue.connection.play(stream, {
            volume: queue.volume / 100,
            highWaterMark: 1,
            fec: true,
            plp: 30,
            bitrate: 'auto',
            seek: queue.beginTime
          }).on('finish', () => this._handleSongFinish(msg, queue))
          .on('error', (err) => {
            this._handlePlayingError(msg, queue, err)
          })
        if (queue.stream) queue.stream = null
        queue.stream = stream

        if (withNotify) {
          const content = `[${song.name}](${song.url}) [<@${msg.author.id}>]`
          await msg.channel.send(this._embedMessage(
            "Now Playing",
            content
          ))
        }
      }
    } catch (e) {
      this._handlePlayingError(msg, queue, e)
    }
  }

  async _handlePlaylist(msg, arg, skip = false) {
    let playlist
    if (typeof arg === 'object') playlist = arg
  }

  async _searchSong(msg, name, multiple = false) {
    const results = await ytsr.search(name, 10)
    if (!results.length) return
    const result = results[0]
    if (multiple) {
      let answers = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {
        max: 1,
        time: 60000,
        errors: ['time']
      })
      if (!answers.first()) throw new Error()
      const index = parseInt(answers.first().content, 10)
      if (isNaN(index) || index > results.length || index < 1) throw new Error()
      result = results[index - 1]
    }
    const info = await ytdl(result.url)
    const song = new Song(info, msg.author)
    return song
  }

  async _resolveSong(msg, song) {
    if (!song) return
    if (song instanceof Song) return song
    if (typeof song === 'object') return new Song(song, msg.author)
    if (isURL(song)) {
      const info = await ytdl(song)
      if (info.entries) return info.entries.map(i => new Song(i, msg.author, true))
      return new Song(info, msg.author, true)
    }
    return this._resolveSong(msg, await this._searchSong(msg, song))
  }

  async _handleSong(msg, song, skip = false) {
    if (!song) return
    if (Array.isArray(song)) {
      this._handlePlaylist(msg, song, skip)
    } else if (this.getQueue(msg)) {
      let queue = this._addToQueue(msg, song, skip)
      if (skip) this.skip(msg)
    } else {
      let queue = this._newQueue(msg, song)
    }
  }

  async _handleSongFinish(msg, queue) {
    if (queue.stopped) return
    if (queue.repeatMode === 2 && !queue.skipped) queue.songs.push(queue.songs[0])
    if (queue.songs.length <= 1 && (queue.skipped || !queue.repeatMode)) {
      this._deleteQueue(msg)
      return
    }
    if (queue.repeatMode !== 1 || queue.skipped) {
      const {
        id
      } = queue.songs.shift()
      queue.previousSongs.push(id)
    }
    queue.skipped = false
    queue.beginTime = 0
    await this._playSong(msg)
  }

  _handlePlayingError(msg, queue, e = null) {
    const song = queue.songs.shift()
    if (e) {
      console.log(e)
    }
    if (queue.songs.length > 0) this._playSong(msg)
    else {
      try {
        this.stop(msg)
      } catch (error) {
        this._deleteQueue(msg)
      }
    }
  }

  async _createStream(queue) {
    const song = queue.songs[0]
    return song.streamUrl
  }

  getQueue(msg) {
    if (typeof msg === 'string') return this.guildQueues.get(msg)
    if (!msg || !msg.guild) throw new TypeError('Parameter should be Discord.Message or server ID!')
    return this.guildQueues.get(msg.guild.id)
  }

  async _addToQueue(msg, song, unshift = false) {
    const queue = this.getQueue(msg)
    if (!queue) throw new Error('NotPlaying')
    if (!song) throw new Error('NoSong')
    if (unshift) {
      const playing = queue.songs.shift()
      queue.songs.unshift(playing, song)
    } else {
      queue.songs.push(song)
    }

    const content = `Queued [${song.name}](${song.url}) [<@${msg.author.id}>]`
    await msg.channel.send(this._embedMessage(
      false,
      content
    ))
    return queue
  }

  async _newQueue(msg, song, retry = false) {
    const voice = msg.member.voice.channel
    if (!voice) await msg.channel.send('You are not in the voice channel.')
    const queue = new Queue(msg, song)
    this.guildQueues.set(msg.guild.id, queue)

    try {
      queue.connection = await voice.join()
    } catch (e) {
      this._deleteQueue(msg)
      await msg.channel.send('Vooka cannot join the voice channel!')
      if (retry) throw e
      return this._newQueue(msg, song, true)
    }
    queue.connection.on('error', async (err) => {
      await msg.channel.send('There is a problem with Discord Voice Connection.\nPlease try again! Sorry for the interruption!')
      this._deleteQueue(msg)
    })
    await this._playSong(msg)
    return queue
  }

  async _deleteQueue(msg) {
    const queue = this.getQueue(msg)
    if (!queue) return
    if (queue.dispatcher) try {
      queue.dispatcher.destroy()
    } catch {}
    if (queue.stream) try {
      queue.stream = null
    } catch {}
    if (typeof msg === 'string') this.guildQueues.delete(msg)
    else if (msg && msg.guild) this.guildQueues.delete(msg.guild.id)
  }

  _addSongsToQueue(msg, songs, unshift = false) {
    let queue = this.getQueue(msg);
    if (!queue) throw new Error("NotPlaying");
    if (!songs.length) throw new Error("NoSong");
    if (unshift) {
      let playing = queue.songs.shift();
      queue.songs.unshift(playing, ...songs);
    } else {
      queue.songs.push(...songs);
    }
    return queue;
  }

  _embedMessage(title, content) {
    const head = title ? `**${title}**` : ''
    const embed = new MessageEmbed()
      .setColor('#97ffe5')
      .setDescription(content)
    if (title !== false) embed.setTitle(head)
    return embed
  }
}
module.exports = Bot