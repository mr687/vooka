module.exports = {
  name: 'loop',
  description: 'Loop queue|track|off',
  usage: '<queue|track|off>',
  args: true,
  async execute(message, args) {
    const modes = {
      track: 1,
      queue: 2,
      off: 0
    }
    const mode = args[0].toLowerCase();
    if (modes[mode]) {
      return message.client.lib.music.repeatMode(message, modes[mode]);
    }
    if (modes[mode] === 0) {
      return message.client.lib.music.repeatMode(message, 0);
    }
  }
}