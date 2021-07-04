module.exports = {
  name: 'resume',
  description: 'Resume song.',
  async execute(message) {
    return message.client.lib.music.resume(message)
  }
}