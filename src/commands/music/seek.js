module.exports = {
  name: 'seek',
  description: 'Seek current track.',
  usage: '<second>',
  args: true,
  async execute(message, args) {
    const req = args[0]
    const time = parseInt(req)

    if (isNaN(time)) {
      return message.client.utils.discord
        .sendEmbedMessage(
          message,
          {description: message.client.utils.strings.PARAM_NOT_NUMBER}
        )
    }
    return message.client.lib.music.seek(message, time)
  }
}