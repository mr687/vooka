module.exports = async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch()
    } catch (error) {return}
  }
  const {message, me, emoji} = reaction
  const {client} = message
  const pendingReaction = await client.utils.discord.pendingReaction(message, message.guild.id)
  if (!pendingReaction) return
  if (message.id !== pendingReaction.message.id) return
  
  const results = pendingReaction.results
  let limit = pendingReaction.limit
  let offset = pendingReaction.offset

  if (emoji.name === '⬆️') {
    if (offset === 0) return
    offset -= 10
    limit -= 10
  }else if(emoji.name === '⬇️') {
    if (offset === 10) return  
    offset += 10
    limit += 10
  }

  let content = `💡 Search '${pendingReaction.query}'`.padStart(5, '-').padEnd(5, '-')+'\n\n'
  results.slice(offset, limit).forEach((result, i) => {
    content += `${i+1+offset}) ${client.utils.stringLimit(result.title, 37)}${'['.padStart(41-result.title.length,' ')}${result.durationFormatted}]\n`
  })
  await message.edit(`\`\`\`yaml\n${content}\`\`\``)
  await client.pendingReactions.update(
    {guildId: message.guild.id},
    {
      $set: {
        limit, offset
      }
    }
  )
}

  