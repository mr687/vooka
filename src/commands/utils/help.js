module.exports = {
  name: 'help',
  description: 'Show bot commands.',
  aliases: ['commands', 'h'],
  async execute(message) {
    const commands = message.client.commands
    let fields = []
    commands.forEach((cmd) => {
      if (cmd.adminOnly) return
      const field = {
        name: `**${message.guild.prefix}${cmd.name}** ${cmd.usage||''}`,
        value: cmd.description
      }
      fields.push(field)
    })

    message.client.utils.discord.sendEmbedMessage(
      message,
      {
        title: 'Vooka Bot Commands 📻',
        fields
      }
    )
  }
}