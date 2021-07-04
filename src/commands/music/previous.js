module.exports = {
  name: 'previous',
  description: 'Skip to previous track.',
  aliases: ['before', 'back', 'prev'],
  async execute(message) {
    return message.client.lib.music.previous(message)
  }
}