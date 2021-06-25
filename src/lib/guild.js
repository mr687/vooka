const {Collection} = require('discord.js')

class Guild{
  constructor (guild) {
    this.guildId = guild.id
    this.prefix = guild.prefix || '-'
    this.queue = null
  }

  toJson() {
    return JSON.parse(JSON.stringify(this))
  }
}

module.exports = Guild