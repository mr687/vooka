const Monk = require('monk')

require('dotenv').config()
const mongoURI = process.env.MONGODB_URI || 'Place your MONGODB URI here.'

module.exports.respawn = async (callback) => {
  return await callback(Monk(mongoURI))
}