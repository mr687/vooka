module.exports = (client) => {
  console.log(`[CLIENT] ready, ${client.user.tag}.`)
  client.lib.music._handleOnWakeUp(client)
}