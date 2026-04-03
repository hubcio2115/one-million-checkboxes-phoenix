defmodule MillionCheckboxes.BitPacker do
  @moduledoc """
  Handles efficient conversion of boolean values to packed binary format.
  """

  # Functions to implement:
  # - pack_bools(bools_enumerable) - Takes an enumerable of bools, returns packed binary
  # - Other helper functions as needed

  @spec pack_bools(list(boolean())) :: bitstring()
  def pack_bools([]) do
    <<>>
  end

  def pack_bools(bools_enumerable) do
    bools_enumerable
    |> Enum.chunk_every(8)
    |> Enum.map(fn byte ->
      for b <- byte, into: <<>> do
        if b, do: <<1::1>>, else: <<0::1>>
      end
    end)
    |> Enum.into(<<>>)
  end
end
