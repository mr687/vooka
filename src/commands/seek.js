module.exports = async (params) => {
  const {
    bot,
    msg,
    args
  } = params

  const req = args[0]
  const time = Number(req)

  return await bot.seek(msg, time)

}