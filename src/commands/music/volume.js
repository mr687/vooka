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
    return await bot.setVolume(msg, req)
  }
}