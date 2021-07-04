module.exports = {
  name: 'disconnect',
  description: 'Disconnect bot',
  aliases: ['dc', 'dis', 'leave'],
  async execute(message) {
    return await message.client.lib.music.disconnect(message)
  }
}