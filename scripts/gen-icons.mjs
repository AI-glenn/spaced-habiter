// Generate flat-color PNG icons for the PWA manifest.
// Produces solid-background icons with a simple centered glyph.
// Pure Node — no native deps.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'public');

const BG = [0x4a, 0x6b, 0x8a]; // slate blue
const FG = [0xfa, 0xf8, 0xf4]; // warm cream

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c >>> 0;
    }
    crc32.table = table;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// Produce a square PNG. `pixel(x, y)` returns [r, g, b].
function makePNG(size, pixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type = RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = size * 3;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter type "None"
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y);
      const off = y * (stride + 1) + 1 + x * 3;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
    }
  }
  const idat = deflateSync(raw);

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// A simple "checkmark inside rounded square" glyph.
function pixelFor(size, x, y) {
  const r = size / 2;
  const cx = x - r + 0.5;
  const cy = y - r + 0.5;

  // Rounded-square mask via Chebyshev approximation isn't strictly needed —
  // we'll just fill the whole square with BG and draw a thick white circle
  // outline + a checkmark-ish glyph in the middle. Designs at 192 and 512
  // both render at the same proportions.

  const dist = Math.max(Math.abs(cx), Math.abs(cy));
  const radius = r * 0.92;
  if (dist > radius) return BG; // letterbox stays bg, manifest masks anyway

  // Outer ring
  const ringOuter = r * 0.62;
  const ringInner = r * 0.5;
  const dRound = Math.sqrt(cx * cx + cy * cy);
  if (dRound >= ringInner && dRound <= ringOuter) return FG;

  // Checkmark: two thick line segments inside the ring.
  const t = r * 0.07; // half-thickness
  // Segment 1: from (-r*0.22, r*0.02) to (-r*0.04, r*0.20)
  if (onSegment(cx, cy, -r * 0.22, r * 0.02, -r * 0.04, r * 0.2, t)) return FG;
  // Segment 2: from (-r*0.04, r*0.20) to (r*0.28, -r*0.18)
  if (onSegment(cx, cy, -r * 0.04, r * 0.2, r * 0.28, -r * 0.18, t)) return FG;

  return BG;
}

function onSegment(px, py, ax, ay, bx, by, t) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return false;
  let u = ((px - ax) * dx + (py - ay) * dy) / len2;
  u = Math.max(0, Math.min(1, u));
  const ex = ax + u * dx - px;
  const ey = ay + u * dy - py;
  return ex * ex + ey * ey <= t * t;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of [192, 512]) {
  const png = makePNG(size, (x, y) => pixelFor(size, x, y));
  writeFileSync(resolve(OUT_DIR, `icon-${size}.png`), png);
  console.log(`wrote icon-${size}.png (${png.length} bytes)`);
}
