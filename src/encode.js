export function encode({ header, indices, positions }) {
  var nBytes = getBufferLength({ indices, positions });
  var buffer = new ArrayBuffer(nBytes);
  var view = new DataView(buffer);

  var offset = 0;
  offset = encodeHeader(view, header, offset);
  offset = encodeVertexData(view, positions, offset);
  offset = encodeIndexData(view, indices, offset);

  return view;
}

/**
 * Encode zig zag
 *
 * @param  {Integer} value Value to encode
 * @return {Integer}       Encoded value
 */
function zigZagEncode(value) {
  if (value >= 0) {
    return value << 1;
  }

  return ((value * -1) << 1) - 1;
}

/**
 * Encode header data
 *
 * @param  {DataView} view   DataView to fill
 * @param  {Object} data   Object with data to encode
 * @param  {Number} offset Offset in DataView
 * @return {[type]}        [description]
 */
function encodeHeader(view, data, offset) {
  var {
    // The center of the tile in Earth-centered Fixed coordinates.
    // doubles
    centerX,
    centerY,
    centerZ,

    // The minimum and maximum heights in the area covered by this tile.
    // The minimum may be lower and the maximum may be higher than
    // the height of any vertex in this tile in the case that the min/max vertex
    // was removed during mesh simplification, but these are the appropriate
    // values to use for analysis or visualization.
    // floats
    minimumHeight,
    maximumHeight,

    // The tile’s bounding sphere.  The X,Y,Z coordinates are again expressed
    // in Earth-centered Fixed coordinates, and the radius is in meters.
    // doubles
    boundingSphereCenterX,
    boundingSphereCenterY,
    boundingSphereCenterZ,
    boundingSphereRadius,

    // The horizon occlusion point, expressed in the ellipsoid-scaled Earth-centered Fixed frame.
    // If this point is below the horizon, the entire tile is below the horizon.
    // See http://cesiumjs.org/2013/04/25/Horizon-culling/ for more information.
    horizonOcclusionPointX,
    horizonOcclusionPointY,
    horizonOcclusionPointZ
  } = data;

  view.setFloat64(offset + 0, centerX, true);
  view.setFloat64(offset + 8, centerY, true);
  view.setFloat64(offset + 16, centerZ, true);

  view.setFloat64(offset + 24, minimumHeight, true);
  view.setFloat64(offset + 28, maximumHeight, true);

  view.setFloat64(offset + 32, boundingSphereCenterX, true);
  view.setFloat64(offset + 40, boundingSphereCenterY, true);
  view.setFloat64(offset + 48, boundingSphereCenterZ, true);
  view.setFloat64(offset + 56, boundingSphereRadius, true);

  view.setFloat64(offset + 64, horizonOcclusionPointX, true);
  view.setFloat64(offset + 72, horizonOcclusionPointY, true);
  view.setFloat64(offset + 80, horizonOcclusionPointZ, true);

  // New offset
  return offset + 88;
}

/**
 * Encode vertex data
 * Creates an int describing length of data, plus three arrays of that length
 *
 * @param  {[type]} view   [description]
 * @param  {[type]} data   [description]
 * @param  {[type]} offset [description]
 * @return {[type]}        [description]
 */
function encodeVertexData(view, data, offset) {
  var { bbox, positions } = data;
  var interleaved = true;
  offset = 0;

  var vertexCount = positions.length / 3;
  view.setUint32(offset, vertexCount, true);
  offset += Uint32Array.BYTES_PER_ELEMENT;

  if (interleaved) {
    encodeInterleavedVertexData(view, data, offset, vertexCount);
  } else {
    encodeNonInterleavedVertexData(view, data, offset, vertexCount);
  }
}

function encodeInterleavedVertexData(
  view,
  data,
  offset,
  positions,
  vertexCount
) {
  positions;
  var [[minX, minY, minZ], [maxX, maxY, maxZ]] = bbox;

  var prevX = 0;
  // Loop over x, y, z separately to make zig-zag encoding easier
  for (var i = 0; i < positions.length; i += 3) {
    // Scale to integer
    var ratio = (positions[i] - minX) / maxX;
    var x = Math.round(ratio * 32767);

    var diff = x - prevX;
    var encoded = zigZagEncode(diff);
    view.setUint16(offset, encoded, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    prevX = x;
  }

  var prevY = 0;
  for (var i = 1; i < positions.length; i += 3) {
    // Scale to integer
    var ratio = (positions[i] - minY) / maxY;
    var y = Math.round(ratio * 32767);

    var diff = y - prevY;
    var encoded = zigZagEncode(diff);
    view.setUint16(offset, encoded, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    prevY = y;
  }

  var prevZ = 0;
  for (var i = 2; i < positions.length; i += 3) {
    // Scale to integer
    var ratio = (positions[i] - minZ) / maxZ;
    var z = Math.round(ratio * 32767);

    var diff = z - prevZ;
    var encoded = zigZagEncode(diff);
    view.setUint16(offset, encoded, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    prevZ = z;
  }
}

function encodeNonInterleavedVertexData(
  view,
  data,
  offset,
  positions,
  vertexCount
) {
  positions;
  var [[minX, minY, minZ], [maxX, maxY, maxZ]] = bbox;

  var prevX = 0;
  // Loop over x, y, z separately to make zig-zag encoding easier
  for (var i = 0; i < positions.length / 3; i++) {
    // Scale to integer
    var ratio = (positions[i] - minX) / maxX;
    var x = Math.round(ratio * 32767);

    var diff = x - prevX;
    var encoded = zigZagEncode(diff);
    view.setUint16(offset, encoded, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    prevX = x;
  }

  var prevY = 0;
  for (var i = positions.length; i < (positions.length / 3) * 2; i++) {
    // Scale to integer
    var ratio = (positions[i] - minY) / maxY;
    var y = Math.round(ratio * 32767);

    var diff = y - prevY;
    var encoded = zigZagEncode(diff);
    view.setUint16(offset, encoded, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    prevY = y;
  }

  var prevZ = 0;
  for (var i = positions.length * 2; i < positions.length; i++) {
    // Scale to integer
    var ratio = (positions[i] - minZ) / maxZ;
    var z = Math.round(ratio * 32767);

    var diff = z - prevZ;
    var encoded = zigZagEncode(diff);
    view.setUint16(offset, encoded, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    prevZ = z;
  }
}

function getBufferLength(data) {
  const { positions, indices, bbox } = data;
  var [[minX, minY, _], [maxX, maxY, _]] = bbox;

  let nBytes = 0;

  // Header always 88 bytes
  nBytes += 88;

  // Vertex data
  // vertexCount
  nBytes += Uint32Array.BYTES_PER_ELEMENT;
  // uint16 per position
  var vertexCount = positions.length / 3;
  nBytes += Uint16Array.BYTES_PER_ELEMENT * vertexCount * 3;

  // Index data
  var indexBytesPerElement =
    vertexCount > 65536
      ? Uint32Array.BYTES_PER_ELEMENT
      : Uint16Array.BYTES_PER_ELEMENT;

  // triangleCount
  nBytes += Uint32Array.BYTES_PER_ELEMENT;
  var triangleCount = indices.length / 3;
  nBytes += indexBytesPerElement * triangleCount * 3;

  // Edge vertices
  var westVertexCount = 0;
  var southVertexCount = 0;
  var eastVertexCount = 0;
  var northVertexCount = 0;

  // Note: Assumes interleaved positions
  for (var i = 0; i < positions.length; i += 3) {
    var [x, y] = positions.subarray(i, i + 2);

    if (x === minX) westVertexCount++;
    if (x === maxX) eastVertexCount++;
    if (y === minY) southVertexCount++;
    if (y === maxY) northVertexCount++;
  }

  // count of each side
  nBytes += Uint32Array.BYTES_PER_ELEMENT * 4;
  nBytes += indexBytesPerElement * westVertexCount;
  nBytes += indexBytesPerElement * southVertexCount;
  nBytes += indexBytesPerElement * eastVertexCount;
  nBytes += indexBytesPerElement * northVertexCount;

  return nBytes;
}

export const TEST_EXPORTS = { encodeZigZag };
