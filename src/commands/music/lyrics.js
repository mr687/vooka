const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("findthelyrics");

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
    if (args) {
      track = args.join(' ')
    }else{
      const currentSong = queue.songs[0] || null
      if (!currentSong) return
      track = currentSong.track
    }

    let lyrics = "Not Found!"

    if (track) {
      ftl.find(track ,function(err, resp) {
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