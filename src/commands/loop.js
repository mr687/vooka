module.exports = async (params) => {
  const {
    bot,
    msg,
    args
  } = params

  const modes = {
    track: 0,
    queue: 1,
    off: 2
  }
  const mode = args[0].toLowerCase();
  if (modes[mode]) {
    return await bot.setRepeatMode(msg, modes[mode]);
  }

}