defmodule MillionCheckboxes.BitPackerTest do
  use ExUnit.Case

  alias MillionCheckboxes.BitPacker

  @moduledoc """
  Tests for the BitPacker module.

  Instructions for implementing each test:
  1. Run: mix test test/million_checkboxes/bit_packer_test.exs
  2. Watch for failures and implement accordingly
  """

  describe "pack_bools/1" do
    # TEST 1: Empty list
    # Purpose: Verify that packing an empty list returns an empty binary
    # Implementation: Assert that pack_bools([]) returns <<>>
    # Expected: An empty binary with 0 bytes
    test "packs empty list" do
      result = BitPacker.pack_bools([])
      assert result == <<>>
    end

    # TEST 2: Single boolean values
    # Purpose: Verify that single booleans are packed correctly
    # Implementation: 
    #   - Pack [true] and verify the binary is <<1::1>> (which is 1 bit set to 1)
    #   - Pack [false] and verify the binary is <<0::1>> (which is 1 bit set to 0)
    # Expected: Correctly packed single bits
    test "packs single true" do
      result = BitPacker.pack_bools([true])
      assert result == <<1::1>>
    end

    test "packs single false" do
      result = BitPacker.pack_bools([false])
      assert result == <<0::1>>
    end

    # TEST 3: Full byte (8 booleans)
    # Purpose: Verify that 8 booleans pack into a single byte correctly
    # Implementation:
    #   - Pack [true, false, true, false, false, false, false, false]
    #   - Verify the result is a single byte with value 0b10100000 (160 in decimal)
    #   - You can also test other byte patterns (all true, all false, alternating)
    # Expected: Correct byte values for various 8-boolean patterns
    test "packs full byte (8 booleans)" do
      result = BitPacker.pack_bools([true, false, true, false, false, false, false, false])
      # Verify this packs to a single byte with the expected bit pattern
      assert byte_size(result) == 1
      # The byte should be 0b10100000 = 160 in decimal
      assert result == <<160>>
    end

    # TEST 4: Multiple bytes
    # Purpose: Verify that more than 8 booleans pack into multiple bytes
    # Implementation:
    #   - Pack 16 booleans (should create 2 bytes)
    #   - Pack 17 booleans (should create 3 bytes, with last byte partially filled)
    #   - Verify the byte_size is correct
    # Expected: Correct number of bytes for various input lengths
    test "packs multiple bytes" do
      # 16 booleans should create 2 bytes
      result = BitPacker.pack_bools(List.duplicate(true, 16))
      assert byte_size(result) == 2
    end

    # TEST 5: Large input (performance/stress test)
    # Purpose: Verify the function works with large inputs and returns correct size
    # Implementation:
    #   - Pack 1_000_000 booleans (the full store size)
    #   - Verify byte_size is 125_000 (1_000_000 bits / 8 bits per byte)
    #   - Verify the result is a valid binary
    # Expected: A ~125KB binary with correct size
    test "packs large input (1 million booleans)" do
      large_list = List.duplicate(false, 1_000_000)
      result = BitPacker.pack_bools(large_list)

      # 1 million booleans = 1_000_000 bits = 125_000 bytes
      assert byte_size(result) == 125_000
      assert is_binary(result)
    end

    # TEST 6: Mixed patterns
    # Purpose: Verify that alternating true/false patterns pack correctly
    # Implementation:
    #   - Create a pattern like [true, false, true, false, ...]
    #   - Verify the resulting bytes match the expected alternating bit pattern
    #   - Example: [true, false, true, false, true, false, true, false] → 0b10101010 (170)
    # Expected: Correct byte values for alternating patterns
    test "packs alternating pattern" do
      pattern = [true, false, true, false, true, false, true, false]
      result = BitPacker.pack_bools(pattern)

      assert byte_size(result) == 1
      # 10101010 in binary = 170 in decimal
      assert result == <<170>>
    end
  end
end
