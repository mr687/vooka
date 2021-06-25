const fs = require('fs')
const path = require('path')

const commandsPath = path.join(__dirname, '')
let commands = {}

fs.readdirSync(commandsPath).forEach(filename => {
  const name = filename.replace('.js', '')
  if (name !== 'index') {
    commands[name] = require(`./${name}`)
  }
})

module.exports = commands