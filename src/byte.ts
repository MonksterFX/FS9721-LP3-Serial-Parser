/**
 * check if a bit is set
 * @param byte
 * @param position bit positions from right to left, starting at index 0
 * @returns bit
 */
function getBit(byte: number, position: number): boolean {
  const mask = 1 << position;
  return (byte & mask) != 0;
}

/**
 * breaks byte into high and low nibble
 * @param chunk
 * @param index
 * @returns high and low nibble
 */
function getNibbles(byte: number): { high: number; low: number } {
  // guard further calculation
  if (byte > 0xff) throw new Error('number is out of byte range');

  const num = byte & 0xff;
  const high = num >> 4;
  const low = num & 0xf;

  return { high, low };
}

/**
 * combine to nibbles to an UInt8 value
 * @param high
 * @param low
 * @returns UInt8
 */
function addNibbles(high: number, low: number): number {
  // guard further calculation
  if (high > 1 << 4 || low > 1 << 4) throw new Error('nibble is out of range');

  return (high << 4) + low;
}

/**
 * extract number from buffer at index
 * @param buffer
 * @param index index of byte starting on zero
 * @returns byte representation
 */
function fromBuffer(buffer: Buffer, index: number): number {
  const byte = buffer.at(index);

  if (byte === undefined)
    throw new Error(
      `could not parse nibble at ${index} with buffer length ${buffer.length}`
    );

  return byte;
}

const Byte = { getBit, getNibbles, fromBuffer, addNibbles };

export default Byte;
