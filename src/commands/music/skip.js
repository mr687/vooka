module.exports = {
  name: 'skip',
  description: 'Skip to next track.',
  async execute(message) {
    return message.client.lib.music.skip(message)
  }
}