module.exports = {
  name: 'pause',
  description: 'Pause song.',
  async execute(message) {
    return message.client.lib.music.pause(message)
  }
}