import Byte from './byte';

/**
 * remove bit on position 7 first to use this mapping
 */
const DIGIT_MAP: Record<number, string> = {
  0b1111101: '0',
  0b0000101: '1',
  0b1011011: '2',
  0b0011111: '3',
  0b0100111: '4',
  0b0111110: '5',
  0b1111110: '6',
  0b0010101: '7',
  0b1111111: '8',
  0b0111111: '9',
  0b1101000: 'L',
};

/**
 * remove bit on position 0 & 4 first to use this mapping
 */
const UNIT_PREFIX_MAP: Record<number, Omit<UnitPrefix, ''> | '%'> = {
  0b1000_0000: 'u',
  0b0100_0000: 'n',
  0b0010_0000: 'k',
  0b0000_1000: 'm',
  0b0000_0100: '%',
  0b0000_0010: 'M',
};

const UNIT_PREFIX_FILTER = 0b11101110;

/**
 * remove bit on position 0, 4 & 5 first to use this mapping
 */
const UNIT_MAP: Record<number, Units> = {
  0b1000_0000: 'F',
  0b0100_0000: 'Ohm',
  0b0000_1000: 'A',
  0b0000_0100: 'V',
  0b0000_0010: 'Hz',
};

const UNIT_FILTER = 0b11101110;

function getSign(chunk: Buffer): string {
  const n = Byte.getNibbles(Byte.fromBuffer(chunk, 1));
  const signBit = Byte.getBit(n.low, 3);
  return signBit ? '-' : '';
}

/**
 * extract digit from buffer
 * @param buffer
 * @param position
 * @returns
 */
function getDigit(buffer: Buffer, position: number): string {
  const n1 = Byte.getNibbles(Byte.fromBuffer(buffer, position * 2 + 1));
  const n2 = Byte.getNibbles(Byte.fromBuffer(buffer, position * 2 + 2));

  let valueRaw = (n1.low << 4) + n2.low;

  // remove bit on position 7, which is the point indicator
  let charRaw = valueRaw & 0b01111111;

  // lookup character
  const char = DIGIT_MAP[charRaw] !== undefined ? DIGIT_MAP[charRaw] : '';

  // check if point is set
  return Byte.getBit(n1.low, 3) && position !== 0 ? `.${char}` : char;
}

type UnitPrefix = 'u' | 'n' | 'k' | 'm' | '';
type Units = 'F' | 'Ohm' | 'A' | 'V' | 'Hz';
type Uint = `${UnitPrefix}${Units}` | '%';

type MultimeterSerialOutput = {
  value: number;
  unit: { scale: UnitPrefix; unit: Units };
};

/**
 * parse uint
 * @param buffer
 */
function getUnit(buffer: Buffer): { scale: UnitPrefix; unit: Units } {
  if (buffer.length === 4) throw new Error('buffer must be of length 4');

  let prefix = Byte.addNibbles(
    Byte.getNibbles(Byte.fromBuffer(buffer, 0)).low,
    Byte.getNibbles(Byte.fromBuffer(buffer, 1)).low
  );

  const prefixString = (UNIT_PREFIX_MAP[prefix & UNIT_PREFIX_FILTER] ||
    '') as UnitPrefix;

  const uint = Byte.addNibbles(
    Byte.getNibbles(Byte.fromBuffer(buffer, 2)).low,
    Byte.getNibbles(Byte.fromBuffer(buffer, 3)).low
  );

  const unitString = UNIT_MAP[uint & UNIT_FILTER];

  return { scale: prefixString, unit: unitString };
}

export function parse(buffer: Buffer): MultimeterSerialOutput {
  // check if protocol is aligned
  if (Byte.getNibbles(Byte.fromBuffer(buffer, 0)).high !== 1)
    throw new Error('protocol is not aligned');

  const rawDigits = [
    getSign(buffer),
    getDigit(buffer, 0),
    getDigit(buffer, 1),
    getDigit(buffer, 2),
    getDigit(buffer, 3),
  ];

  const unit = getUnit(buffer.subarray(-5));

  return {
    value: +rawDigits.join(''),
    unit,
  };
}
