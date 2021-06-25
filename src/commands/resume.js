module.exports = async (params) => {
  const {
    bot,
    msg,
    args
  } = params

  return await bot.resume(msg)

}