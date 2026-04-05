import { describe, expect, test } from "vitest";
import { getBit, setBit } from "../binary-utils";

describe("setBit", () => {
  test("sets the MSB (index 0)", () => {
    const buffer = new Uint8Array(1).fill(0b00000000);
    setBit(buffer, 0, true);

    expect(buffer[0]).toBe(0b10000000);
  });

  test("sets the LSB (index 7)", () => {
    const buffer = new Uint8Array(1).fill(0b00000000);
    setBit(buffer, 7, true);

    expect(buffer[0]).toBe(0b00000001);
  });

  test("clears a bit", () => {
    const buffer = new Uint8Array(1).fill(0b11111111);
    setBit(buffer, 0, false);

    expect(buffer[0]).toBe(0b01111111);
  });

  test("operates on the correct byte in a multi-byte buffer", () => {
    const buffer = new Uint8Array(2).fill(0b00000000);
    setBit(buffer, 8, true); // first bit of second byte

    expect(buffer[0]).toBe(0);
    expect(buffer[1]).toBe(0b10000000);
  });

  test("mutates the buffer in place", () => {
    const buffer = new Uint8Array(1).fill(0);
    const ref = buffer;

    setBit(buffer, 0, true);
    expect(buffer).toBe(ref);
  });
});

describe("getBit", () => {
  test("returns true for a set bit", () => {
    const buffer = new Uint8Array(1).fill(0b00000100);
    const bit = getBit(buffer, 5);

    expect(bit).toBe(true);
  });

  test("returns false for an unset bit", () => {
    const buffer = new Uint8Array(1).fill(0b00000000);
    const bit = getBit(buffer, 0);

    expect(bit).toBe(false);
  });

  test("reads from the correct byte in a multi-byte buffer", () => {
    const buffer = new Uint8Array(2).fill(0b00000000);
    buffer[1] = 0b10000000;

    const bit1 = getBit(buffer, 8);
    const bit2 = getBit(buffer, 9);

    expect(bit1).toBe(true);
    expect(bit2).toBe(false);
  });
});
