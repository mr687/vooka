const {Client} = require('discord.js')
const {discord} = require('../utils')
const {onReady, onMessage, onVoiceStateUpdate, onError, onMessageReactionAdd, onMessageReactionRemove} = require('../handler')

require('dotenv').config()
const token = process.env.DISCORD_TOKEN || 'Place your token here'

const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

client.on('ready', () => onReady(client))
client.on('message', onMessage)
client.on('voiceStateUpdate', onVoiceStateUpdate)
client.on('messageReactionAdd', onMessageReactionAdd)
client.on('messageReactionRemove', onMessageReactionRemove)
client.on('error', onError)

const start = async() => {
  console.log('[NODE] Connection to discord client...')
  await discord.prepare(client)
  client.login(token)
}

module.exports = {start}