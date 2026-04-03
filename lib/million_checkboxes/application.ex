defmodule MillionCheckboxes.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      MillionCheckboxesWeb.Telemetry,
      {DNSCluster,
       query: Application.get_env(:million_checkboxes, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: MillionCheckboxes.PubSub},
      # Start a worker by calling: MillionCheckboxes.Worker.start_link(arg)
      # {MillionCheckboxes.Worker, arg},

      MillionCheckboxes.BoolStore,

      # Start the SSR process pool
      # You must specify a `path` option to locate the directory where the `ssr.js` file lives.
      {Inertia.SSR, path: Path.join([Application.app_dir(:million_checkboxes), "priv"])},

      # Start to serve requests, typically the last entry
      MillionCheckboxesWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: MillionCheckboxes.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    MillionCheckboxesWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
