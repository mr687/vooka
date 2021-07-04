module.exports = {
  name: 'autoplay',
  description: 'Autoplay recent tracks.',
  aliases: ['ap', 'auto'],
  usage: '<song|youtube-url|url1,url2,...>',
  async execute(message) {
    return message.client.lib.music.autoplay(message)
  }
}