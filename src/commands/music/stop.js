module.exports = {
  name: 'stop',
  description: 'Stop and clear queue',
  needBot: true,
  async execute(bot, msg) {
    return bot.stop(msg)
  }
}