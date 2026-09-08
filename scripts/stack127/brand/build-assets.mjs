import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const originals = path.join(root, "public", "brand", "originals");
const logos = path.join(root, "public", "logos");

const wordmarkSource = path.join(originals, "stack127-wordmark-approved.png");

const darkBackground = { r: 16, g: 16, b: 16 };
const lightBackground = { r: 244, g: 242, b: 236 };
const darkInk = { r: 0, g: 0, b: 0 };
const lightInk = { r: 242, g: 242, b: 238 };

// The approved wordmark is off-white with a chartreuse dot on near-black.
// Threshold only the background; map both foreground colors to exact site tokens.
async function extractedLogo(source, ink, padding = 8, markOnly = false) {
  const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let index = 0; index < info.width * info.height; index += 1) {
    const offset = index * info.channels;
    const r = data[offset], g = data[offset + 1], b = data[offset + 2];
    const accent = g > r * 1.12 && g > b * 1.8;
    const brightness = Math.max(r, g, b);
    const alpha = Math.round(Math.max(0, Math.min(1, (brightness - 32) / 200)) * 255);
    const target = index * 4;
    rgba[target] = accent ? 186 : ink.r;
    rgba[target + 1] = accent ? 252 : ink.g;
    rgba[target + 2] = accent ? 60 : ink.b;
    rgba[target + 3] = alpha;
  }
  let output = sharp(rgba, { raw: { channels: 4, height: info.height, width: info.width } });
  // Crop at the empty column between k and 1 in the approved source.
  if (markOnly) output = sharp(await output.extract({ left: 1207, top: 0, width: info.width - 1207, height: info.height }).png().toBuffer());
  return output.trim({ background: { alpha: 0, b: 0, g: 0, r: 0 }, threshold: 1 })
    .extend({ background: { alpha: 0, b: 0, g: 0, r: 0 }, bottom: padding, left: padding, right: padding, top: padding })
    .png({ compressionLevel: 9 }).toBuffer();
}

async function squareMark(mark, background, size) {
  const inset = Math.round(size * 0.08);
  const resized = await sharp(mark)
    .resize({
      fit: "inside",
      height: size - inset * 2,
      kernel: sharp.kernel.lanczos3,
      width: size - inset * 2,
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  const metadata = await sharp(resized).metadata();

  return sharp({
    create: {
      background,
      channels: 3,
      height: size,
      width: size,
    },
  })
    .composite([{
      input: resized,
      left: Math.round((size - metadata.width) / 2),
      top: Math.round((size - metadata.height) / 2),
    }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function icoFromPngs(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(entries.length * 16);
  let offset = header.length + directory.length;

  entries.forEach(({ png, size }, index) => {
    const entry = index * 16;
    directory.writeUInt8(size === 256 ? 0 : size, entry);
    directory.writeUInt8(size === 256 ? 0 : size, entry + 1);
    directory.writeUInt8(0, entry + 2);
    directory.writeUInt8(0, entry + 3);
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(png.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });

  return Buffer.concat([header, directory, ...entries.map(({ png }) => png)]);
}

async function main() {
  await mkdir(logos, { recursive: true });

  const wordmarkOnLight = await extractedLogo(wordmarkSource, darkInk);
  const wordmarkOnDark = await extractedLogo(wordmarkSource, lightInk);
  const markOnLight = await extractedLogo(wordmarkSource, darkInk, 8, true);
  const markOnDark = await extractedLogo(wordmarkSource, lightInk, 8, true);

  await Promise.all([
    writeFile(path.join(logos, "stack127-wordmark-on-light.png"), wordmarkOnLight),
    writeFile(path.join(logos, "stack127-wordmark-on-dark.png"), wordmarkOnDark),
    writeFile(path.join(logos, "stack127-mark-on-light.png"), markOnLight),
    writeFile(path.join(logos, "stack127-mark-on-dark.png"), markOnDark),
  ]);

  const [darkSquare, lightSquare] = await Promise.all([
    squareMark(markOnDark, darkBackground, 1024),
    squareMark(markOnLight, lightBackground, 1024),
  ]);

  await Promise.all([
    writeFile(path.join(logos, "stack127-mark-dark-square.png"), darkSquare),
    writeFile(path.join(logos, "stack127-mark-light-square.png"), lightSquare),
  ]);

  const faviconSizes = [16, 32, 48, 180, 192, 512];
  const faviconEntries = await Promise.all(faviconSizes.map(async (size) => ({
    png: await sharp(darkSquare)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9 })
      .toBuffer(),
    size,
  })));
  const bySize = new Map(faviconEntries.map((entry) => [entry.size, entry.png]));

  await Promise.all([
    writeFile(path.join(root, "public", "favicon-16x16.png"), bySize.get(16)),
    writeFile(path.join(root, "public", "favicon-32x32.png"), bySize.get(32)),
    writeFile(path.join(root, "public", "favicon-48x48.png"), bySize.get(48)),
    writeFile(path.join(root, "public", "apple-touch-icon.png"), bySize.get(180)),
    writeFile(path.join(root, "public", "android-chrome-192x192.png"), bySize.get(192)),
    writeFile(path.join(root, "public", "android-chrome-512x512.png"), bySize.get(512)),
    writeFile(
      path.join(root, "public", "favicon.ico"),
      icoFromPngs(faviconEntries.filter(({ size }) => [16, 32, 48].includes(size))),
    ),
  ]);
}

await main();
