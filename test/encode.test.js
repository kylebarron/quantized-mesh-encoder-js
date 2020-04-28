import { TEST_EXPORTS } from "../src/encode";
const { encodeZigZag } = TEST_EXPORTS;

function decodeZigZag(value) {
  return (value >> 1) ^ -(value & 1);
}

describe("encodeZigZag", () => {
  test("encodes correctly", () => {
    for (var i = 0; i < 10; i++) {
      const result = decodeZigZag(encodeZigZag(i));
      expect(result).toEqual(i);
    }
  });
});
