module.exports = {
  name: 'volume',
  description: 'Set volume, max: 200',
  alias: ['vol'],
  usage: '<volume number>',
  arg: true,
  needBot: true,
  async execute(bot, msg, args) {
    const req = parseInt(args[0])
    if (isNaN(req)) return
    bot.setVolume(msg, req)
  }
}