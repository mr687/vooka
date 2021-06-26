module.exports = {
  name: 'search',
  description: 'Show 10 songs list.',
  alias: ['s'],
  arg: true,
  usage: '<song>',
  needBot: true,
  async execute(bot, msg, args) {
    const song = args.join(' ')
    bot.play(msg, song, true)
  }
}