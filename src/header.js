var SphericalMercator = require("@mapbox/sphericalmercator");
var { Ellipsoid } = require("@math.gl/geospatial");

export function computeHeader({ positions, bbox }) {
  // Find bounding sphere
  // coerce cartographic to cartesian
  // Does cartographic need to be in radians?
  var minCartesianPosition = Ellipsoid.WGS84.cartographicToCartesian(bbox[0]);
  var maxCartesianPosition = Ellipsoid.WGS84.cartographicToCartesian(bbox[1]);

  var boundingSphere = new BoundingSphere().fromCornerPoints(
    minCartesianPosition,
    maxCartesianPosition
  );
  var {
    boundingSphereRadius = radius,
    boundingSphereCenter = center
  } = boundingSphere;
  var [
    boundingSphereCenterX,
    boundingSphereCenterY,
    boundingSphereCenterZ
  ] = boundingSphereCenter;

  var minimumHeight = bbox[0][2];
  var maximumHeight = bbox[1][2];
  var [centerX, centerY, centerZ] = computeTileCenter(bbox);

  // TODO: compute horizon occlusion point

  return {
    centerX,
    centerY,
    centerZ,
    minimumHeight,
    maximumHeight,
    boundingSphereCenterX,
    boundingSphereCenterY,
    boundingSphereCenterZ,
    boundingSphereRadius,
    horizonOcclusionPointX,
    horizonOcclusionPointY,
    horizonOcclusionPointZ
  };
}

function computeTileCenter(bbox) {
  var [minX, minY, minZ] = bbox[0];
  var [maxX, maxY, maxZ] = bbox[1];

  var centerX = (minX + maxX) / 2;
  var centerY = (minY + maxY) / 2;
  var centerZ = (minZ + maxZ) / 2;

  return Ellipsoid.WGS84.cartographicToCartesian([centerX, centerY, centerZ]);
}
