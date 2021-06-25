const { MessageEmbed } = require("discord.js")

module.exports = {
  name: 'queue',
  description: 'Show all queues',
  alias: ['q'],
  needBot: true,
  async execute(bot, msg) {
    const queue = bot.getQueue(msg)

    let content = queue.songs.map((song, id) =>
    `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
).slice(0, 10).join("\n")

    if (queue.songs.length > 10) {
      content += `\n\n and **${queue.songs.length - 1}** mores.`
    }

    msg.channel.send(
      new MessageEmbed()
      .setColor('#97ffe5')
      .setTitle('Current Queue')
      .setDescription(content)
    )
  }
}