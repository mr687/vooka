module.exports = {
  name: 'prefix',
  description: 'Change bot prefix.',
  usage: '<new-prefix>',
  args: true,
  async execute(message, args) {
    const prefix = args[0]? args[0].toLowerCase(): null
    const guildId = message.guild.id
    await message.client.server.update(
      {guildId},
      {
        $set: { prefix }
      }
    )

    message.client.utils
      .discord.sendEmbedMessage(message, {description: message.client.utils
        .strings.PREFIX_UPDATED(prefix)})
  }
}