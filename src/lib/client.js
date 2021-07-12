const {Client} = require('discord.js')
const {discord, config} = require('../utils')
const {onReady, onMessage, onError, onMessageReactionAdd, onMessageReactionRemove} = require('../handler')

require('dotenv').config()
const token = process.env.DISCORD_TOKEN || 'Place your token here'
const discordConfigs = config.discord || {}

const client = new Client(discordConfigs)

client.on('ready', () => onReady(client))
client.on('message', onMessage)
client.on('messageReactionAdd', onMessageReactionAdd)
client.on('messageReactionRemove', onMessageReactionRemove)
client.on('error', onError)

const start = async() => {
  console.log('[NODE] Connecting to discord client...')
  await discord.prepare(client)
  client.login(token)
}

module.exports = {start}