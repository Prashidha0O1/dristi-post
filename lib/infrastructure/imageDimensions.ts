/**
 * Reads pixel dimensions straight out of an image file's header, for exactly
 * the four types `supabaseStorage.ts` allows.
 *
 * Hand-rolled rather than pulling in `sharp` or `image-size`: only four formats
 * are in play, all four carry their dimensions within the first few dozen bytes,
 * and none of the decoding, resizing or twenty-odd extra formats those libraries
 * bring along are wanted here.
 *
 * Returns `null` for anything it cannot confidently read. Callers must treat
 * `null` as a rejection, not wave it through — see `assertAdImageFitsSlot`.
 */
export function readImageDimensions(
  buffer: Buffer,
): { width: number; height: number } | null {
  if (buffer.length < 10) return null;

  // PNG: 8-byte signature, then the IHDR chunk. Big-endian uint32s at 16 and 20.
  if (buffer.length >= 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  // GIF: logical screen descriptor — little-endian uint16s at 6 and 8. That's
  // the canvas size, which is what a fixed-size slot cares about.
  if (buffer.toString("latin1", 0, 3) === "GIF") {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  // WebP: a RIFF container whose dimension offsets depend on the codec chunk at
  // byte 12 — lossy, lossless and extended each encode them differently.
  if (
    buffer.length >= 16 &&
    buffer.toString("latin1", 0, 4) === "RIFF" &&
    buffer.toString("latin1", 8, 12) === "WEBP"
  ) {
    return readWebp(buffer);
  }

  // JPEG: no fixed offset. The size lives in a SOF segment that can sit tens of
  // kilobytes in, past EXIF and colour-profile segments.
  if (buffer.readUInt16BE(0) === 0xffd8) {
    return readJpeg(buffer);
  }

  return null;
}

function readWebp(buffer: Buffer): { width: number; height: number } | null {
  const chunk = buffer.toString("latin1", 12, 16);

  // Lossy: 3-byte sync code, then 14-bit dimensions in the next two uint16s.
  if (chunk === "VP8 " && buffer.length >= 30) {
    if (buffer.toString("latin1", 23, 26) !== "\x9d\x01\x2a") return null;
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  // Lossless: both dimensions packed into one little-endian uint32, 14 bits
  // each, each stored one less than the real value.
  if (chunk === "VP8L" && buffer.length >= 25) {
    if (buffer[20] !== 0x2f) return null;
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  // Extended — what animated WebP uses. 24-bit little-endian canvas size, again
  // stored one less than the real value.
  if (chunk === "VP8X" && buffer.length >= 30) {
    return {
      width: buffer.readUIntLE(24, 3) + 1,
      height: buffer.readUIntLE(27, 3) + 1,
    };
  }

  return null;
}

function readJpeg(buffer: Buffer): { width: number; height: number } | null {
  let pos = 2; // past the SOI marker

  while (pos + 1 < buffer.length) {
    if (buffer[pos] !== 0xff) return null; // desynced: malformed or truncated

    // Runs of 0xFF are legal padding ahead of a marker.
    while (pos < buffer.length && buffer[pos] === 0xff) pos++;
    if (pos >= buffer.length) return null;

    const marker = buffer[pos];
    pos++;

    // RSTn and TEM carry no payload, so there is no length field to skip.
    if ((marker >= 0xd0 && marker <= 0xd9) || marker === 0x01) continue;

    if (pos + 1 >= buffer.length) return null;
    const length = buffer.readUInt16BE(pos);
    if (length < 2) return null; // a lying length would otherwise loop forever

    // Any SOFn is a frame header: 0xC0 baseline, 0xC2 progressive, and the rest.
    // 0xC4/0xC8/0xCC fall inside the range but are DHT/JPG/DAC, not frames.
    const isFrameHeader =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isFrameHeader) {
      // length(2) + precision(1), then height BEFORE width — the usual trap.
      // Width is the uint16 at pos+5, so it occupies pos+5 and pos+6 and needs
      // `pos + 7 <= length`. Using `>=` here rejected every JPEG whose SOF is
      // the final segment, which is the common case for a cropped export.
      if (pos + 7 > buffer.length) return null;
      return {
        height: buffer.readUInt16BE(pos + 3),
        width: buffer.readUInt16BE(pos + 5),
      };
    }

    pos += length;
  }

  return null;
}
