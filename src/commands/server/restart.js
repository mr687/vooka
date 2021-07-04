module.exports = {
  name: 'restart',
  description: 'Restart bot server.',
  usage: '',
  adminOnly: true,
  async execute(message) {
    const utils = message.client.utils
    await utils.discord.sendEmbedMessage(message, {description: utils.strings.RESTART_SERVER_TEXT})
    await utils.discord.leaveVoiceChannel(message)
    process.exit()
  }
}