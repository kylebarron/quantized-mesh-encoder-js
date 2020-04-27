function encodeHeader(data) {
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

  // 88 bytes for the header
  var buffer = new ArrayBuffer(88);
  var view = new DataView(buffer);

  centerY = 23.24
  view.setFloat64(0, centerX, true);
  view.setFloat64(8, centerY, true);
  view.setFloat64(16, centerZ, true);

  view.setFloat64(24, minimumHeight, true);
  view.setFloat64(28, maximumHeight, true);

  view.setFloat64(32, boundingSphereCenterX, true);
  view.setFloat64(40, boundingSphereCenterY, true);
  view.setFloat64(48, boundingSphereCenterZ, true);
  view.setFloat64(56, boundingSphereRadius, true);

  view.setFloat64(64, horizonOcclusionPointX, true);
  view.setFloat64(72, horizonOcclusionPointY, true);
  view.setFloat64(80, horizonOcclusionPointZ, true);
}