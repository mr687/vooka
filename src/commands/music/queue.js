module.exports = {
  name: 'queue',
  description: 'Show all queues',
  aliases: ['q'],
  async execute(message) {
    return message.client.lib.music.showQueue(message)
  }
}