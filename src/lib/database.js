const Monk = require('monk')

require('dotenv').config()

const tables = {
  MUSIC_SERVER :'server',
  RECENT_TRACKS :'recent_tracks',
  PENDING_REACTIONS : 'pending_reactions'
}

class Database{
  constructor() {
    this.uri = process.env.MONGODB_URI || 'Place your MONGODB URI here.'
    this.conn = Monk(this.uri)
  }

  async respawn(cb) {
    const server = await this.conn.get(tables.MUSIC_SERVER)
    const pendingReactions = await this.conn.get(tables.PENDING_REACTIONS)
    const recentTracks = await this.conn.get(tables.RECENT_TRACKS)
    pendingReactions.createIndex({guildId: 1})
    recentTracks.createIndex({id: 1}, {unique: true})
    server.createIndex({guildId: 1},{unique: true})
    return await cb({server, pendingReactions, recentTracks, conn: this.conn})
  }
}

module.exports = {
  database: new Database(),
  tables
}