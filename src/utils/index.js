const Youtube = require('youtube-sr').default
const FindLyrics = require('findlyrics')

const spotifySongRegex = /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/;
const spotifyPlaylistRegex = /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})/;
const spotifyAlbumRegex = /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:album\/|\?uri=spotify:album:)((\w|-){22})/;
const attachmentRegex = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

module.exports.commander = require('./commander')
module.exports.discord = require('./discord')
module.exports.strings = require('./strings')
module.exports.config = require('./config')
module.exports.isUrl = (str) => {
  return str.length < 2083 && attachmentRegex.test(str)
}
module.exports.urlType = (url) => {
  if (spotifySongRegex.test(url)) return 'spotify_song';
  if (spotifyAlbumRegex.test(url)) return 'spotify_album';
  if (spotifyPlaylistRegex.test(url)) return 'spotify_playlist';
  if (Youtube.validate(url, 'PLAYLIST')) return 'youtube_playlist';
  if (Youtube.validate(url, 'VIDEO')) return 'youtube_video';
  if (url.length < 2083 && attachmentRegex.test(url)) return 'attachment';
  return 'youtube_search';
}
module.exports.parseMs = (milliseconds) => {
  const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;
  return {
      days: roundTowardsZero(milliseconds / 86400000),
      hours: roundTowardsZero(milliseconds / 3600000) % 24,
      minutes: roundTowardsZero(milliseconds / 60000) % 60,
      seconds: roundTowardsZero(milliseconds / 1000) % 60
  };
}
module.exports.durationString = (duration) => {
  return Object.values(duration)
    .map((m) => (isNaN(m) ? 0 : m))
    .join(':');
}
module.exports.buildTimeCode = (data) => {
  const items = Object.keys(data);
  const required = ['days', 'hours', 'minutes', 'seconds'];
  const parsed = items.filter((x) => required.includes(x)).map((m) => (data[m] > 0 ? data[m] : ''));
  const final = parsed
      .filter((x) => !!x)
      .map((x) => x.toString().padStart(2, '0'))
      .join(':');
  return final.length <= 3 ? `0:${final.padStart(2, '0') || 0}` : final;
}
module.exports.ytSearch = (query, n) => {
  return new Promise(async (resolve) => {
    if (n === 1) {
      await Youtube.searchOne(query, 'video', false)
      .then(result => {
        resolve(result)
      }).catch(() => resolve([]))
    }
    else{
      await Youtube.search(query, {type: 'video', limit: n || 10})
      .then(results => {
        resolve(results)
      }).catch(() => resolve([]))
    }
  })
}
module.exports.searchLyrics = async (query) => {
  return await FindLyrics(query)
}
module.exports.stringLimit = (str, limit = 0, end='...') => {
  if (str.length <= limit) return str
  return str.substring(0, limit).concat(end)
}