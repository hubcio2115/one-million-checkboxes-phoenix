defmodule MillionCheckboxesWeb.CheckboxSocket do
  alias MillionCheckboxesWeb.CheckboxChannel
  use Phoenix.Socket

  channel "room:checkboxes", CheckboxChannel

  @impl true
  def connect(_params, socket, _connect_info), do: {:ok, socket}

  @impl true
  def id(_socket), do: nil
end
