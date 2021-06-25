module.exports = {
  name: 'loop',
  description: 'Loop queue|track|off',
  usage: '<queue|track|off>',
  arg: true,
  needBot: true,
  async execute(bot, msg, args) {
    const modes = {
      track: 1,
      queue: 2,
      off: 0
    }
    const mode = args[0].toLowerCase();
    if (modes[mode]) {
      return await bot.setRepeatMode(msg, modes[mode]);
    }
  }
}