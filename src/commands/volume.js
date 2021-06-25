module.exports = async (params) => {
  const {
    bot,
    msg,
    args
  } = params

  const req = args[0]

  return await bot.setVolume(msg, req)

}