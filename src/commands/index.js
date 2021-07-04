const fs = require('fs')
const path = require('path')
const { Collection } = require('discord.js')

const commandsPath = path.join(__dirname, '')
const commands = new Collection()

const saveCommand = (path) => {
  const command = require(path)
  commands.set(command.name, command)
}

const isFileJs = (filename) => {
  return filename.endsWith('.js')
}

const loadCommands = (path = commandsPath) => {
  fs.readdirSync(path).forEach(f => {
    if (f === 'index.js') return
    if (isFileJs(f)) {
      saveCommand(`${path}/${f}`)
    } else {
      loadCommands(`${path}/${f}`)
    }
  })
}

loadCommands(commandsPath)

module.exports = commands