module.exports = {
  name: 'shuffle',
  description: 'Shuffle tracks order.',
  async execute(message) {
    return message.client.lib.music.shuffle(message)
  }
}