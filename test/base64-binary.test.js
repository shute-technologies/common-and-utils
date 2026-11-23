// Runs against the compiled output (npm test builds first), so it checks what gets published.
const test = require('node:test');
const assert = require('node:assert/strict');
const { Base64Binary, STUtils } = require('../lib/index.js');

const bytesOf = (text) => Array.from(Buffer.from(text, 'latin1'));
const toBase64 = (text) => Buffer.from(text, 'latin1').toString('base64');

test('decodeArrayBuffer no longer throws: the alphabet is assigned', () => {
  assert.doesNotThrow(() => Base64Binary.decodeArrayBuffer('QUJD'));
});

// 'A' -> 'QQ==' (2 padding chars), 'AB' -> 'QUI=' (1), 'ABC' -> 'QUJD' (0)
for (const plain of ['', 'A', 'AB', 'ABC', 'ABCD', 'hello world', '\u0000ÿ\u0080\u007f']) {
  test(`decodeArrayBuffer(${JSON.stringify(toBase64(plain))}) has exactly ${plain.length} bytes, no zero padding`, () => {
    const buffer = Base64Binary.decodeArrayBuffer(toBase64(plain));

    assert.ok(buffer instanceof ArrayBuffer);
    assert.deepEqual(Array.from(new Uint8Array(buffer)), bytesOf(plain));
  });
}

test('decode without a buffer returns the same bytes', () => {
  assert.deepEqual(Array.from(Base64Binary.decode('QUI=')), bytesOf('AB'));
});

test('line breaks and spaces are ignored, including before the padding', () => {
  const wrapped = 'aGVs\r\nbG8g\nd29y bGQ=\n';
  assert.deepEqual(Array.from(new Uint8Array(Base64Binary.decodeArrayBuffer(wrapped))), bytesOf('hello world'));
});

test('unpadded input decodes to the right length', () => {
  assert.deepEqual(Array.from(new Uint8Array(Base64Binary.decodeArrayBuffer('QUI'))), bytesOf('AB'));
  assert.deepEqual(Array.from(new Uint8Array(Base64Binary.decodeArrayBuffer('QQ'))), bytesOf('A'));
});

test('STUtils.base64ToArrayBuffer round-trips binary data', () => {
  const data = new Uint8Array(1000).map((_, i) => (i * 37) & 0xff);
  const decoded = STUtils.base64ToArrayBuffer(Buffer.from(data).toString('base64'));
  assert.deepEqual(Array.from(new Uint8Array(decoded)), Array.from(data));
});
