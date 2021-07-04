module.exports = {
  streamConfigs: {
    filter: 'audioonly',
    quality: 'highestaudio',
    highWaterMark: 1<<25,
    requestOptions: {},
    seek: 0,
  },
  discordSpeakConfigs: {
    volume: 1,
    bitrate: 'auto',
    highWaterMark: 1
  }
}