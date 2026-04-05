defmodule MillionCheckboxesWeb.CheckboxesChannel do
  alias MillionCheckboxes.BoolStore
  use Phoenix.Channel

  def join("room:checkboxes", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("checked", %{"index" => index, "checked" => checked}, socket) do
    with :ok <- BoolStore.set(index, checked) do
      broadcast!(socket, "checked", %{index: index, checked: checked})
      {:noreply, socket}
    else
      {:error, reason} ->
        {:reply, {:error, %{message: reason}}, socket}
    end
  end
end
