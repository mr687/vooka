module.exports = async (params) => {
  const {
    bot,
    msg,
    args
  } = params

  const song = args.join(' ')

  return await bot.play(msg, song)

}