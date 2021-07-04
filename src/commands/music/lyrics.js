module.exports = {
  name: 'lyrics',
  description: 'Show currenct track lyrics',
  aliases: ['lyric'],
  args: 'optional',
  async execute(message, args = []) {
    const title = args.join(' ')
    return message.client.lib.music.lyrics(message,title)
  }
}