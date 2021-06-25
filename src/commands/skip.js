module.exports = async (params) => {
  const {
    bot,
    msg,
    args
  } = params

  return bot.skip(msg)

}