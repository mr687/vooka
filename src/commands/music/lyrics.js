const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("findthelyrics");

module.exports = {
  name: 'lyrics',
  description: 'Show currenct track lyrics',
  alias: ['lyric'],
  needBot: true,
  async execute(bot, msg) {
    const queue = bot.getQueue(msg)
    if (!queue) return

    const currentSong = queue.songs[0] || null
    if (!currentSong) return

    let lyrics = "Not Found!"

    if (currentSong.track) {
      ftl.find(q ,function(err, resp) {
          if (!err) {
              lyrics = resp
          } else {
          }
      });
    }
    
    msg.channel.send(
      new MessageEmbed()
      .setColor('#97ffe5')
      .setTitle('Lyrics')
      .setDescription(lyrics)
    )
  }
}