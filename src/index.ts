import { ByteLengthParser, SerialPort } from 'serialport';
import Byte from './byte';
import { parse } from './parser';

const port = new SerialPort({
  path: '/dev/cu.usbserial-14310',
  parity: 'none',
  dataBits: 8,
  stopBits: 1,
  baudRate: 2400,
});

const parser = new ByteLengthParser({ length: 14 });

parser.on('data', (chunk: Buffer) => {
  const parsed = parse(chunk);
  console.log(`${parsed.value} ${parsed.unit.scale}${parsed.unit.unit}`);
});

port.pipe(parser);
