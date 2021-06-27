const Discord = require('discord.js')
const DiscordBot = require('./player/bot')
const monk = require('monk')
const Guild = require('./guild')

require('dotenv').config()

const client = new Discord.Client()
const db = monk(process.env.MONGODB_URI)

client.db = {
  guilds: db.get('guilds')
}

client.commands = require('../commands')

const bot = new DiscordBot(client)

client.on('ready', async() => {
  console.log(`Logged in as ${client.user.tag}!`)

  const guilds = await client.db.guilds.find()
  if (guilds.length > 0) {
    console.log('[SYSTEM] Restoring to registered guild if exists.')
    guilds.forEach(guild => {
      if (guild.queue) {
        bot._handleWakeUpFromRestartServer(guild)
      }
    })
  }
})

client.on('message', async (msg) => {
  if (msg.author.bot || !msg.guild || !msg.content) return

  let prefix = '-'
  const guild = await client.db.guilds.find({
    guildId: msg.guild.id
  })
  if (guild) {
    prefix = guild.prefix || '-'
  }
  
  msg.guild.prefix = prefix
  
  if (!msg.content.startsWith(prefix)) return
  if (!msg.member.voice.channel) return msg.channel.send('You have to join to voice channel.')

  if (!guild) {
    const guildO = new Guild(msg)
    client.db.guilds.insert(guildO.toJson())
    console.log('[DATABASE] Saved new guild to database.')
  }

  const args = msg.content.slice(prefix.length).trim().split(/ +/g)
  const commandName = args.shift().toLowerCase()

  const command = client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName))
  if (!command) return

  if (command.arg && !args.length && command.arg !== 'optional') {
    let content = `You didn't provide any arguments, ${msg.author}!`

    if (command.usage) {
      content += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
    }

    return msg.channel.send(
      new Discord.MessageEmbed()
      .setColor('#97ffe5')
      .setDescription(content)
    )
  }

  if (command.needBot) {
    if (command.arg) {
      command.execute(bot, msg, args)
    } else {
      command.execute(bot, msg)
    }
  } else {
    if (command.arg) {
      command.execute(msg, args)
    } else {
      command.execute(msg)
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