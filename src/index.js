const Discord = require('./lib/discord')

Discord.start()
  .catch(e => console.log(e))

// https://discord.com/api/oauth2/authorize?client_id=858110664018755644&permissions=2184707392&scope=bot