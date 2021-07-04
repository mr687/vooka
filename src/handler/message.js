module.exports = async (message) => {
  if (message.author.bot) return
  if (!message.guild) return discord.sendMessage(message, strings.NO_GUILD)
  
  const utils = message.client.utils
  await utils.discord.prepare(message)
  if (!message.content || !utils.commander.hasPrefix(message)) return
  await utils.discord.save(message)
  if (!utils.commander.valid(message)) return
  await utils.commander.execute(message)
}