const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("@youka/lyrics");

module.exports = {
  name: 'lyrics',
  description: 'Show currenct track lyrics',
  alias: ['lyric'],
  arg: 'optional',
  needBot: true,
  async execute(bot, msg, args = false) {
    const queue = bot.getQueue(msg)
    if (!queue) return

    let track = null
    if (args && args.length > 0) {
      track = args.join(' ')
    }else{
      const currentSong = queue.songs[0] || null
      if (!currentSong) return
      track = currentSong.track
    }

    let lyrics = "Not Found!"

    if (track) {
      lyrics = await lyricsFinder(track)
    }
    msg.channel.send(
      new MessageEmbed()
      .setColor('#97ffe5')
      .setTitle('Lyrics')
      .setDescription(lyrics)
    )
  }
}