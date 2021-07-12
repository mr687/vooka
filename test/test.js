const assert = require('assert')
const utils = require('../src/utils')

describe('UtilsTest', () => {
  it('url type should returns spotify_song', () => {
    assert.strictEqual(utils.urlType('https://open.spotify.com/track/5S8TtEVuFPY9XEjg2hNWHa'),'spotify_song')
  })
  it('url type should returns youtube_video', () => {
    assert.strictEqual(utils.urlType('https://www.youtube.com/watch?v=2Ld0IfAfqPc'),'youtube_video')
  })
  it('url type should returns spotify_playlist', () => {
    assert.strictEqual(utils.urlType('https://open.spotify.com/playlist/3sYyB4rkoh3O2abJaDJVD9'),'spotify_playlist')
  })  
  it('url type should returns youtube_playlist', () => {
    assert.strictEqual(utils.urlType('https://www.youtube.com/playlist?list=PLlqZM4covn1H69IAGko-oNj0lubezFQms'),'youtube_playlist')
  })
  // it('url type should returns attachment', () => {
  //   assert.strictEqual(utils.urlType('https://open.spotify.com/track/5S8TtEVuFPY9XEjg2hNWHa'),'spotify_song')
  // })
})