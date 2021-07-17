module.exports = {
  RESTART_SERVER_TEXT: '👨🏻‍💻👨🏻‍💻 Server is restarting. Please wait for a moment. 👨🏻‍💻👨🏻‍💻',
  COMMAND_NO_PERMISSION: '⛔️⛔️ You don\'t have permission to this command. ⛔️⛔️',
  NO_GUILD: 'Vooka BOT doesn\'t work here, please join server\' voice channel to use it.',
  INVALID_MESSAGE: 'Invalid class Discord.Message!',
  GREETING_MESSAGE: 'Hello, my name is Vooka Bot. Enjoy with the music.',
  NO_ARGUMENTS: 'Argument is required for this command.',
  PREFIX_UPDATED: (prefix) => {
    return `New prefix updated successfuly. Prefix now is **${prefix}**.`
  },
  ALREADY_JOIN: 'Vooka Bot is already join to your voice channel.',
  NO_VOICE_CHANNEL: 'You are not in the voice channel. 😱',
  GOODBYE_MESSAGE: 'Thank your for using Vooka Bot, see you.',
  NO_PREVIOUS_TRACKS: 'You don\'t have any playlist before. Use **trending** to play spotify trending playlist. 🥂',
  NO_QUEUE: 'Playlist not found! You can play some music with **play** command. 🤝',
  PARAM_NOT_NUMBER: 'Parameter <second> must be number.',
  WRONG_REACTION: 'You reacted with neither a arrow up, nor a arrow down.',
  INVALID_RADIO_PARAMS: 'Acctually, **Vooka Bot** only allow radio URL for now. You can search with [-radio search <name>] instead.'
}