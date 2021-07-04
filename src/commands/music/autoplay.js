module.exports = {
  name: 'autoplay',
  description: 'Autoplay recent tracks.',
  aliases: ['ap', 'auto'],
  async execute(message) {
    return message.client.lib.music.autoplay(message)
  }
}