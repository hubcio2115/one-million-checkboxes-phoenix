defmodule MillionCheckboxesWeb.CheckboxesSocket do
  alias MillionCheckboxesWeb.CheckboxesChannel
  use Phoenix.Socket

  channel "room:checkboxes", CheckboxesChannel

  @impl true
  def connect(_params, socket, _connect_info), do: {:ok, socket}

  @impl true
  def id(_socket), do: nil
end
