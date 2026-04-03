defmodule MillionCheckboxesWeb.ProfileController do
  alias Ecto.Changeset
  alias MillionCheckboxes.BitPacker
  alias MillionCheckboxes.BoolStore
  use MillionCheckboxesWeb, :controller

  @columns 40
  @rows_per_chunk 200

  @search_types %{
    page: :integer
  }

  @spec index(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def index(conn, _params) do
    query_params = conn.query_params

    changeset =
      {%{}, @search_types}
      |> Changeset.cast(query_params, Map.keys(@search_types))
      |> Changeset.validate_number(:page, greater_than: 0)

    page = Changeset.get_field(changeset, :page, 1)
    total_rows = div(BoolStore.total_bools(), @columns)
    total_pages = ceil(total_rows / @rows_per_chunk)

    bits_per_chunk = @rows_per_chunk * @columns
    from = (page - 1) * bits_per_chunk
    to = min(from + bits_per_chunk - 1, BoolStore.total_bools() - 1)

    chunk_base64 =
      BoolStore.get_chunk(from, to)
      |> BitPacker.pack_bools()
      |> Base.encode64()

    paginated = %{
      data: [chunk_base64],
      meta: %{
        page_name: "page",
        current_page: page,
        previous_page: if(page > 1, do: page - 1),
        next_page: if(page < total_pages, do: page + 1)
      }
    }

    conn
    |> assign_prop(:checkboxes, inertia_scroll(paginated))
    |> assign_prop(:rows_per_chunk, @rows_per_chunk)
    |> render_inertia("HomePage")
  end
end
