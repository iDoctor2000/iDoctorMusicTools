import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outputDir = resolve("public/screenshots");

const shots = [
  { file: "tuner-1.png", accent: [34, 211, 238], secondary: [56, 189, 248] },
  { file: "metronome-1.png", accent: [139, 92, 246], secondary: [34, 211, 238] },
  { file: "capo-1.png", accent: [56, 189, 248], secondary: [217, 70, 239] },
  { file: "musicband-1.png", accent: [217, 70, 239], secondary: [34, 211, 238] },
  { file: "vocal-1.png", accent: [139, 92, 246], secondary: [217, 70, 239] },
];

const width = 540;
const height = 1170;

function crc32(buffer) {
  let crc = -1;

  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const lengthBuffer = Buffer.alloc(4);
  const crcBuffer = Buffer.alloc(4);

  lengthBuffer.writeUInt32BE(data.length);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function mix(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function putPixel(buffer, x, y, color, alpha = 255) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const index = (y * width + x) * 4;
  const a = alpha / 255;
  buffer[index] = Math.round(color[0] * a + buffer[index] * (1 - a));
  buffer[index + 1] = Math.round(color[1] * a + buffer[index + 1] * (1 - a));
  buffer[index + 2] = Math.round(color[2] * a + buffer[index + 2] * (1 - a));
  buffer[index + 3] = 255;
}

function rect(buffer, x, y, w, h, color, alpha = 255) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      putPixel(buffer, xx, yy, color, alpha);
    }
  }
}

function line(buffer, x0, y0, x1, y1, color, alpha = 255) {
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;

  while (true) {
    putPixel(buffer, x, y, color, alpha);
    putPixel(buffer, x + 1, y, color, Math.round(alpha * 0.65));
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

function circle(buffer, cx, cy, radius, color, alpha = 255) {
  const r2 = radius * radius;
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      const dist = (x - cx) ** 2 + (y - cy) ** 2;
      if (dist <= r2 && dist >= r2 * 0.86) {
        putPixel(buffer, x, y, color, alpha);
      }
    }
  }
}

function createImage({ accent, secondary }) {
  const rgba = Buffer.alloc(width * height * 4);
  const baseTop = [2, 6, 23];
  const baseBottom = [15, 23, 42];

  for (let y = 0; y < height; y += 1) {
    const t = y / height;
    for (let x = 0; x < width; x += 1) {
      const radial =
        Math.max(0, 1 - Math.hypot((x - width * 0.52) / 360, (y - height * 0.28) / 420)) *
        0.55;
      const index = (y * width + x) * 4;
      rgba[index] = Math.min(255, mix(baseTop[0], baseBottom[0], t) + accent[0] * radial);
      rgba[index + 1] = Math.min(255, mix(baseTop[1], baseBottom[1], t) + accent[1] * radial);
      rgba[index + 2] = Math.min(255, mix(baseTop[2], baseBottom[2], t) + accent[2] * radial);
      rgba[index + 3] = 255;
    }
  }

  rect(rgba, 44, 64, 452, 92, [255, 255, 255], 13);
  rect(rgba, 70, 94, 180, 12, accent, 180);
  rect(rgba, 70, 122, 270, 8, [203, 213, 225], 72);

  circle(rgba, 270, 430, 158, accent, 145);
  circle(rgba, 270, 430, 104, secondary, 120);
  circle(rgba, 270, 430, 42, [248, 250, 252], 130);

  for (let i = 0; i < 34; i += 1) {
    const x = 70 + i * 12;
    const h = 30 + Math.round(Math.sin(i * 0.8) * 20 + ((i * 17) % 42));
    rect(rgba, x, 790 - h, 6, h, i % 3 === 0 ? secondary : accent, 180);
  }

  for (let i = 0; i < 8; i += 1) {
    const y = 900 + i * 30;
    rect(rgba, 58, y, 424, 2, [255, 255, 255], 22);
    rect(rgba, 58, y, 90 + ((i * 37) % 240), 3, i % 2 ? secondary : accent, 118);
  }

  for (let i = 0; i < 90; i += 1) {
    const x = (i * 73) % width;
    const y = (i * 137) % height;
    putPixel(rgba, x, y, [255, 255, 255], 130);
    putPixel(rgba, x + 1, y, accent, 90);
  }

  line(rgba, 64, 240, 458, 596, accent, 72);
  line(rgba, 86, 604, 468, 260, secondary, 60);

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(outputDir, { recursive: true });

for (const shot of shots) {
  const output = resolve(outputDir, shot.file);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, createImage(shot));
}
