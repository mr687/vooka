const ytsearch = require('yt-search')

const search = async (q, n) => {
  const res = await ytsearch(q)
  const results = res.videos.slice(0, n)
  return results
}

const findOne = async (q) => {
  const result = await search(q, 1)
  return result[0]
}

module.exports = {
  findOne,
  search
}