module.exports = {
  name: 'play',
  description: 'Play song from a song title, youtube url, etc.',
  aliases: ['p'],
  args: true,
  usage: '<song|youtube-url|url1,url2,...>',
  async execute(message, args) {
    const query = args.join(' ').trim()
    message.client.lib.music.play(message, query)
  }
}