module.exports = {
  name: 'disconnect',
  description: 'Disconnect bot',
  alias: ['dc'],
  needBot: true,
  async execute(bot, msg) {
    bot.disconnect(msg)
  }
}