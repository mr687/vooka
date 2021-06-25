module.exports = {
  name: 'resume',
  description: 'Resume song.',
  needBot: true,
  async execute(bot, msg) {
    return await bot.resume(msg)
  }
}