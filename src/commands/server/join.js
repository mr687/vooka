module.exports = {
  name: 'join',
  description: 'Call Vooka BOT to join your voice channel',
  aliases: ['hey', 'hello'],
  execute: (message) => {
    const client = message.client
    const utils = client.utils
    
    if (client.voice.connections.size) {
      const connection = client.voice.connections.get(message.guild.id)
      if (connection && connection.channel.id === message.member.voice.channel.id) {
        return utils.discord.sendEmbedMessage(message, {description: utils.strings.ALREADY_JOIN})
      }
    }
    utils.discord.greeting(message)
  }
}