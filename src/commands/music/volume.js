module.exports = {
  name: 'volume',
  description: 'Set volume, max: 200',
  aliases: ['vol'],
  usage: '<volume number>',
  args: true,
  async execute(message, args) {
    const req = parseInt(args[0])
    if (isNaN(req)) return
    message.client.lib.music.volume(message, req)
  }
}