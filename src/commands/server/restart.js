const {
  MessageEmbed
} = require("discord.js")

const adminId = process.env.ADMIN_ID || '464985649460674572'

module.exports = {
  name: 'restart',
  description: 'Restart bot server.',
  usage: '',
  adminOnly: true,
  async execute(msg, args) {
    if (msg.author.id === adminId) {
      msg.channel.send(
        new MessageEmbed()
        .setColor('#97ffe5')
        .setDescription('Restarting server.')
      )
      process.exit()
    } else {
      msg.channel.send(
        new MessageEmbed()
        .setColor('#97ffe5')
        .setDescription('You have not permission to this command.')
      )
    }
  }
}