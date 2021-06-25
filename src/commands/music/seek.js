const {
  MessageEmbed
} = require("discord.js")

module.exports = {
  name: 'seek',
  description: 'Seek current track.',
  usage: '<second>',
  arg: true,
  needBot: true,
  async execute(bot, msg, args) {
    const req = args[0]
    const time = parseInt(req)

    if (isNaN(time)) {
      return msg.channel.send(
        new MessageEmbed()
        .setColor('#97ffe5')
        .setDescription('Parameter <second> must be number.')
      )
    }

    bot.seek(msg, time)
  }
}