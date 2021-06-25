const youtubedl = require('@distube/youtube-dl')
const config = {
  dumpSingleJson: true,
  noWarnings: true,
  noCallHome: true,
  noCheckCertificate: true,
  preferFreeFormats: true,
  youtubeSkipDashManifest: true,
  format: 'bestaudio'
}

module.exports = async (url) => {
  const res = await youtubedl(url, config)
  return res
}