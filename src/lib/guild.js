const {Collection} = require('discord.js')

class Guild{
  constructor (msg) {
    this.guildId = msg.guild.id
    this.prefix = msg.guild.prefix || '-'
    this.queue = null
    this.voiceChannelId = msg.member.voice.channel.id || null
  }

  toJson() {
    return JSON.parse(JSON.stringify(this))
  }
}

module.exports = Guild