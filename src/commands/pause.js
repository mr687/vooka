module.exports = async (params) => {
  const {
    bot,
    msg,
    args
  } = params

  return bot.pause(msg)

}