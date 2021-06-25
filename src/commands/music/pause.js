module.exports = {
  name: 'pause',
  description: 'Pause song.',
  needBot: true,
  async execute(bot, msg) {
    return bot.pause(msg)
  }
}