export function base64ToBuffer(base64: string) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export function getBit(buf: Uint8Array, index: number) {
  return ((buf[Math.floor(index / 8)] >> (7 - (index % 8))) & 1) === 1;
}

/**
 * Sets a bit at a given position mutating the original buffer.
 */
export function setBit(buf: Uint8Array, index: number, value: boolean) {
  const byteIdx = Math.floor(index / 8);
  const bitIdx = 7 - (index % 8);

  if (value) {
    buf[byteIdx] |= 1 << bitIdx;
  } else {
    buf[byteIdx] &= ~(1 << bitIdx);
  }
}
