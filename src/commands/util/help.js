const {
  MessageEmbed
} = require('discord.js')

module.exports = {
  name: 'help',
  description: 'Show bot commands.',
  alias: ['commands', 'h'],
  async execute(msg) {

    const commands = msg.client.commands
    let content = ''
    let n = 1
    commands.forEach((cmd) => {
      if (cmd.adminOnly) return
      content += `${n}. **${msg.guild.prefix}${cmd.name}**`
      if (cmd.usage) {
        content += ` ${cmd.usage}`
      }
      if (cmd.description) {
        content += `, ${cmd.description}`
      }
      content += '.\n'
      n += 1
    })

    msg.channel.send(
      new MessageEmbed()
      .setColor('#97ffe5')
      .setTitle('**Bot Commands**')
      .setDescription(content)
    )
  }
}