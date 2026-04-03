defmodule MillionCheckboxesWeb.Router do
  use MillionCheckboxesWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {MillionCheckboxesWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug Inertia.Plug
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", MillionCheckboxesWeb do
    pipe_through :browser

    get "/", ProfileController, :index
  end

  # Other scopes may use custom stacks.
  scope "/api", MillionCheckboxesWeb do
    pipe_through :api

    get "/export", CheckboxController, :export
  end
end
