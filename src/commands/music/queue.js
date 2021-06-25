module.exports = {
  name: 'queue',
  description: 'Show all queues',
  alias: ['q'],
  needBot: true,
  async execute(bot, msg) {
    const queue = bot.getQueue(msg)
    await msg.channel.send(
      new MessageEmbed()
      .setColor('#97ffe5')
      .setTitle('Current Queue')
      .setDescription(queue.songs.map((song, id) =>
      `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
  ).slice(0, 10).join("\n"))
    )
  }
}