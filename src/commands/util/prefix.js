const {
  MessageEmbed
} = require('discord.js')

module.exports = {
  name: 'prefix',
  description: 'Change bot prefix.',
  usage: '<new-prefix>',
  arg: true,
  async execute(msg, args) {
    const prefix = args[0].toLowerCase()
    const guildId = msg.guild.id
    const db = msg.client.db

    await db.guilds.findOneAndUpdate({
      guildId
    }, {
      $set: {
        prefix
      }
    })

    await msg.channel.send(
      new MessageEmbed()
      .setColor('#97ffe5')
      .setDescription(`Prefix changed to **${prefix}**.`)
    )
  }
}