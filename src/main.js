export function main(options) {
  var { indices, positions, bbox } = options || {};
  var header = computeHeader({ positions, bbox });
  return encode({ header, indices, positions });
}
