module.exports = {
  name: 'skip',
  description: 'Skip to next track.',
  alias: ['s'],
  needBot: true,
  async execute(bot, msg) {
    return bot.skip(msg)
  }
}