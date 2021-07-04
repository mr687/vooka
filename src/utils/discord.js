const {MessageEmbed, Client, Message} = require('discord.js')
const commands = require('../commands')
const database = require('../lib/database')
const tts = require('../lib/tts')
const Music = require('../lib/music')
const utils = require('./index')

const sendMessage = async (message, body) => {
  return await message.channel.send(body)
}
module.exports.sendReaction = async(message, emoji) => {
  message.react(emoji)
}
module.exports.sendMessage = sendMessage
module.exports.sendEmbedMessage = async(message, options) => {
  if (!options) return
  const embed = new MessageEmbed()
    .setColor('#197070')
    .setTimestamp(new Date())
  if (options.title) embed.setTitle(options.title)
  if (options.description) embed.setDescription(options.description)
  if (options.fields) embed.addFields(options.fields)
  if (options.thumbnail) {
    embed.setImage(options.thumbnail)
  }
  return await sendMessage(
    message, 
    embed
  )
}
module.exports.deletePlayingMessage = async(message, queue) => {
  try {
    if (queue.playingMessage !== null) {
      const playingMessage = await queue.playingMessage
      await playingMessage.delete()
      queue.playingMessage = null
      return queue
    }
  } catch (error) {}
}
module.exports.sendPlayingMessage = async(message, track, queue) => {
  await utils.discord.deletePlayingMessage(message, queue)
  let fields = []
  if (track.title) fields.push({name: 'Title', value: track.title, inline: true})
  if (track.author) fields.push({name: 'Author', value: track.author, inline: true})
  if (track.duration) fields.push({name: 'Duration', value: track.duration, inline: true})
  if (track.url) fields.push({name: 'Link', value: track.url})
  if (track.user) fields.push({name: 'Request By', value: `<@${track.user.id}>`})
  return await utils.discord.sendEmbedMessage(
    message,
    {
      title: 'Now Playing',
      description: track.description,
      fields,
      thumbnail: track.thumbnail? track.thumbnail:null
    }
  )
}
module.exports.sendFormatMessage = async(message, format='javascript', content=null) => {
  if (!content) return
  return await utils.discord.sendMessage(
    message,
    `\`\`\`${format}\n${content}\`\`\``
  )
}
module.exports.prepare = async (o) => {
  if (o instanceof Client) {
    o.commands = commands
    o.utils = utils
    o.env = process.env
    o.lib = {tts,music: new Music(o)}
    return await database.respawn(async (db) => {
      o.db = db
      o.server = await db.get('server');
      o.pendingReactions = await db.get('pending_reactions')
      o.recentTracks = await db.get('recent_tracks')
      o.pendingReactions.createIndex({guildId: 1})
      o.recentTracks.createIndex({id: 1}, {unique: true})
      o.server.createIndex({guildId: 1},{unique: true})
    })
  }

  if (o instanceof Message) {
    const client = o.client
    const guild = await client.server.findOne({guildId: o.guild.id})
    o.guild.prefix = client.env.DISCORD_PREFIX || '-'
    if (guild && guild.prefix) o.guild.prefix = guild.prefix
    return o
  }
  return
}
module.exports.save = async (message) => {
  const client = message.client
  try {
    const guild = await client.server.findOne({guildId: message.guild.id})
    if (!guild)
      return await client.server.insert({
        guildId: message.guild.id,
        prefix: client.env.DISCORD_PREFIX || '-',
        channelId: message.channel.id,
        voiceChannelId: message.member.voice.channel.id || null,
        playlist: null,
        lastCommand: message.guild.lastCommand || null,
        queue: null
      })
  } catch (error) {
    throw error
  }
}
module.exports.leaveVoiceChannel = async(message) => {
  if (message.member.voice.channel) {
    await message.member.voice.channel.leave()
  }
}
module.exports.speak = (message, options = {}) => {
  if (!options && !options.url) return
  return new Promise(async (resolve) => {
    if (options.connection) {
      options.connection.play(options.url, message.client.utils.config.discordSpeakConfigs)
        .on('error', e => resolve(e))
        .on('finish', () => resolve(true))
    }else{
      const channel = message.member.voice.channel
      if (!channel) return
      const connection = await channel.join()
      const dispatcher = connection.play(options.url, message.client.utils.config.discordSpeakConfigs)
        .on('error', e => resolve(e))
        .on('finish', () => resolve(dispatcher.end()))
    }
  })
}
module.exports.greeting = async (message) => {
  const lib = message.client.lib
  const greetingTts = lib.tts(utils.strings.GREETING_MESSAGE)
  await utils.discord.speak(message, {url: greetingTts})
}
module.exports.pendingReaction = async(message, guildId) => {
  return await message.client.pendingReactions.findOne({guildId})
}