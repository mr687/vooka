module.exports = {
  name: 'search',
  description: 'Show 10 songs list.',
  aliases: ['s'],
  args: true,
  usage: '<song>',
  async execute(message, args) {
    const query = args.join(' ')
    message.client.lib.music.playSearch(message, query)
  }
}