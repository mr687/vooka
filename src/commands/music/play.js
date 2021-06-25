module.exports = {
  name: 'play',
  description: 'Play song from song title, youtube url, etc.',
  alias: ['p'],
  arg: true,
  usage: '<song|youtube-url|url1,url2,...>',
  needBot: true,
  async execute(bot, msg, args) {
    const song = args.join(' ')
    await bot.play(msg, song)
  }
}