var {readFileSync} = require('fs')

var path = 'test/fixtures/10_165_360.png'
var buf = readFileSync(path)

require('@loaders.gl/polyfills')

var {ImageLoader} = require('@loaders.gl/images');
var {TerrainLoader} = require('@loaders.gl/terrain');
var {parse, registerLoaders} = require('@loaders.gl/core');

registerLoaders(ImageLoader);

var elevationDecoder = {
  rScaler: 256,
  gScaler: 1,
  bScaler: 1 / 256,
  offset: -32768,
};
var options = {
  terrain: {
    bounds: [0, 1, 1, 0],
    elevationDecoder
  }
}


var terrain = await parse(buf, TerrainLoader, options)
console.log(test)
