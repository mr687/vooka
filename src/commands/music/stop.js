module.exports = {
  name: 'stop',
  description: 'Stop and clear queue',
  async execute(message) {
    return message.client.lib.music.stop(message)
  }
}