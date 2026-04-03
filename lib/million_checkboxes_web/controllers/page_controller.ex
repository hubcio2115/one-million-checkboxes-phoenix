defmodule MillionCheckboxesWeb.PageController do
  use MillionCheckboxesWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
