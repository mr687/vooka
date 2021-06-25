const Discord = require('discord.js')
const DiscordBot = require('./bot')

const client = new Discord.Client()
const bot = new DiscordBot(client)

const commands = require('../commands')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async (msg) => {
  if (msg.author.bot) return
  if (!msg.guild) return
  if (!msg.content.startsWith('.')) return
  const args = msg.content.slice(1).trim().split(/ +/g)
  const command = args.shift()

  if (commands[command]) {
    commands[command]({
      bot,
      msg,
      args
    })
  }

})

require('dotenv').config()
const token = process.env.DISCORD_TOKEN || 'Place your token here'
const start = () => {
  client.login(token)
}

module.exports = {
  start
}