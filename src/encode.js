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
    horizonOcclusionPointZ,
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

}