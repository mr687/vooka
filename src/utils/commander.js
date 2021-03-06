const hasPrefix = (message) => {
  if (!message.content) return
  const guild = message.guild
  let prefix = guild.prefix || 
  message.client.env.DISCORD_PREFIX || 
  '-'
  if (message.client.user.tag.includes('Dev')) {
    prefix = '*'
  }
  const check = message.content
  .startsWith(prefix)
  return check 
}

const valid = (message) => {
  if (!message.client.commands.size) return
  const guild = message.guild
  const args = message.content.slice(guild.prefix.length).trim().split(/ +/g)
  const commandName = args.shift().replace(/[\W_]+/g, '').toLowerCase()
  const commands = message.client.commands
  const command = commands.get(commandName) ||
          commands.find(cmd => cmd.aliases &&
            cmd.aliases.includes(commandName))
  if (!command) return
  message.client.utils.discord.save(message, {lastCommand: command})
  return {command,args}
}

const execute = async (message, command, args) => {
  const utils = message.client.utils
  if (!command)
    command = valid(message).command
  if (!args)
    args = valid(message).args
  if (command.args && !args.length && command.args !== 'optional')
    return await utils.discord.sendEmbedMessage(message, {description: utils.strings.NO_ARGUMENTS})
  if (!message.member.voice.channel) {
    return utils.discord.sendEmbedMessage(message, {description: utils.strings.NO_VOICE_CHANNEL})
  }
  if (command.adminOnly &&
    message.author.id !== message.client.env.DISCORD_ADMIN_ID)
    return await utils.discord.sendEmbedMessage(message, {description: utils.strings.COMMAND_NO_PERMISSION})
  
  if (!command.args) return command.execute(message)
  return command.execute(message, args)
}

module.exports = {
  hasPrefix,
  valid,
  execute
}