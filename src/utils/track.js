const Playlist = require('../structures/music/playlist')
const Track = require('../structures/music/track')
const Spotify = require('spotify-url-info')
const Youtube = require('youtube-sr').default
const utils = require('./index')
const YoutubeDl = require('ytdl-getinfo')
const URL = require('url')

const ytinfoBestAudio = (info) => {
  if (!info && !info.formats) return
  if (!info.formats.length) return
  const result = info.formats
    .filter(p => p.format_note === 'tiny' && 
      p.acodec === 'opus')
    .sort((a, b) => parseInt(b.format_id) - parseInt(a.format_id))
    .shift()
  if (!result || !result.url) return
  return result.url
}
module.exports.resolveQuery = async (message, query, opts = {}) => {
  if (query.includes('youtu') && query.includes('list=')) {
    try {
      const splited = query.split(/^.*(youtu.be\/|list=)([^#\&\?]*).*/)
      query = `https://www.youtube.com/playlist?list=${splited[2]}`
    } catch {}
  }
  const type = utils.urlType(query)
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
      playlist.duration = utils.buildTimeCode(utils.parseMs(playlist.tracks?.reduce((a, c) => a + (c.duration_ms || 0), 0) || 0))
      playlist.thumbnail = info[0] ? info[0].album? info[0].album.images[0]? info[0].album.images[0].url: null: null : null
      playlist.user = message.author
      return playlist
    case 'youtube_playlist':
      search = await Youtube.getPlaylist(query)
      if (!search) return
      playlist = new Playlist()
      playlist.title = search.title || null
      playlist.id = search.id || playlist.id
      playlist.tracks = search.videos.map(i => new Track(message, i, 'youtube'))
      playlist.durationMs = search.videos.reduce((a,c) => a + c.duration, 0)
      playlist.duration = utils.buildTimeCode(utils.parseMs(playlist.durationMs))
      playlist.url = search.url || null
      playlist.thumbnail = search.thumbnail || search.videos[0].thumbnail.url || null
      playlist.user = message.author
      return playlist
    case 'attachment':
      const checkUrl = await message.client.utils.isHostAlive(query)
      if (!checkUrl){
        await message.client.utils
          .discord.sendEmbedMessage(message, {description: 'Url invalid!'})
        return null
      }

      track = new Track(message, {}, 'attachment')
      track.source = type

      if (opts.radio) {
        track = new Track(message, {}, 'radio')
        track.source = 'radio'
      }
      track.url = query
      track.user = message.author
      return track
    default:
      search = await Youtube.searchOne(query,'video')
      if (!search) return
      return new Track(message, search, 'youtube')
  }
}
module.exports.streamUrl = async(track) => {
  if (!track.url) return
  let ytStream = null
  const {ytSearch, config, discord} = utils
  let resultUrl = undefined
  return new Promise(async (resolve) => {
    switch (track.source) {
      case 'youtube':
        if (!track.url) return
        ytStream = await YoutubeDl.getInfo(track.url, config.ytdlConfigs())
        if (!ytStream && !ytStream.items.length) return resolve(null)
        resultUrl = ytinfoBestAudio(ytStream.items[0])
        if (!resultUrl) return resolve(null)
        track.expireStreamUrl = URL.parse(resultUrl,true).query.expire
        return resolve(resultUrl || null)
      case 'attachment':
        return resolve(track.url)
      case 'spotify':
        let q = `${track.title} ${track.author || ''}`
        const yt = await ytSearch(q.trim(), 1)
        if (!yt) return
        ytStream = await YoutubeDl.getInfo(yt.url, config.ytdlConfigs())
        if (!ytStream && !ytStream.items.length) return resolve(null)
        resultUrl = ytinfoBestAudio(ytStream.items[0])
        if (!resultUrl) return resolve(null)
        track.expireStreamUrl = URL.parse(resultUrl,true).query.expire
        return resolve(resultUrl || null)
      default:
        return resolve(track.url)
    }
  })
}