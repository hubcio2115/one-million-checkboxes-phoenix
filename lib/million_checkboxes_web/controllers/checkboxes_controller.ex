defmodule MillionCheckboxesWeb.CheckboxController do
  alias MillionCheckboxes.BitPacker
  alias MillionCheckboxes.BoolStore
  alias Ecto.Changeset

  use MillionCheckboxesWeb, :controller

  @search_types %{
    from: :integer,
    to: :integer
  }

  @spec export(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def export(conn, _params) do
    query_params = conn.query_params

    changeset =
      {%{}, @search_types}
      |> Changeset.cast(query_params, Map.keys(@search_types))
      |> Changeset.validate_number(:from, greater_than: 0)
      |> Changeset.validate_number(:to, greater_than: 0, less_than: BoolStore.total_bools())

    from = Changeset.get_field(changeset, :from)
    to = Changeset.get_field(changeset, :to)

    binary_data =
      case {from, to} do
        {nil, nil} -> BoolStore.get_all()
        {nil, to} -> BoolStore.get_chunk(0, to)
        {from, nil} -> BoolStore.get_chunk(from, BoolStore.total_bools() - 1)
        {from, to} -> BoolStore.get_chunk(from, to)
      end
      |> BitPacker.pack_bools()

    conn
    |> put_resp_header("content-type", "application/octet-stream")
    |> put_resp_header("content-length", byte_size(binary_data) |> Integer.to_string())
    |> send_resp(200, binary_data)
  end
end
