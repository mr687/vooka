const Discord = require('discord.js')
const DiscordBot = require('./player/bot')
const monk = require('monk')
const Guild = require('./guild')

require('dotenv').config()

const client = new Discord.Client()
const bot = new DiscordBot(client)
const db = monk(process.env.MONGODB_URI)

client.db = {
  guilds: db.get('guilds')
}

client.commands = require('../commands')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async (msg) => {
  if (msg.author.bot || !msg.guild || !msg.content) return

  let prefix = '-'
  const guild = await client.db.guilds.findOne({
    guildId: msg.guild.id
  })
  if (guild) {
    prefix = guild.prefix || '-'
  }
  
  msg.guild.prefix = prefix

  if (!guild) {
    const guildO = new Guild(msg.guild)
    await client.db.guilds.insert(guildO.toJson())
    console.log('[DATABASE] Saved new guild to database.')
  }
  
  if (!msg.content.startsWith(prefix)) return
  const args = msg.content.slice(prefix.length).trim().split(/ +/g)
  const commandName = args.shift().toLowerCase()

  const command = client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName))
  if (!command) return

  if (command.arg && !args.length) {
    let content = `You didn't provide any arguments, ${msg.author}!`

    if (command.usage) {
      content += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
    }

    return await msg.channel.send(
      new Discord.MessageEmbed()
      .setColor('#97ffe5')
      .setDescription(content)
    )
  }

  if (command.needBot) {
    if (command.arg) {
      return await command.execute(bot, msg, args)
    } else {
      return await command.execute(bot, msg)
    }
  } else {
    if (command.arg) {
      return await command.execute(msg, args)
    } else {
      return await command.execute(msg)
    }
  }

})

const token = process.env.DISCORD_TOKEN || 'Place your token here'
const start = () => {
  client.login(token)
}

module.exports = {
  start
}