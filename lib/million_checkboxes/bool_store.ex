defmodule MillionCheckboxes.BoolStore do
  @moduledoc """
  A concurrent in-memory store for managing one million booleans with efficient index-based access.

  Uses ETS (Erlang Term Storage) to handle concurrent updates safely.
  Each entry in the ETS table stores a boolean value indexed by its position (0 to 999,999).
  """

  use GenServer

  @total_bools 1_000_000

  @spec total_bools() :: integer()
  def total_bools(), do: @total_bools

  @typep ets_state :: :ets.tid() | atom()

  defguard is_index(index)
           when is_integer(index) and
                  index >= 0 and
                  index < @total_bools

  # Client API

  @doc """
  Starts the BoolStore GenServer.

  Returns `{:ok, pid}` on success.
  """
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Retrieves the boolean value at the specified index.

  Returns `true` or `false` if the index is valid.
  Raises `{:error, :invalid_index}` if the index is out of bounds.
  """
  def get(index) when is_index(index) do
    GenServer.call(__MODULE__, {:get, index})
  end

  @doc """
  Returns all boolean values from index 0 to 999,999 as an enumerable.
  Returns a lazy stream to avoid loading all values into memory at once.
  """
  def get_all() do
    GenServer.call(__MODULE__, :get_all)
  end

  @doc """
  Returns all boolean values from index 0 to 999,999 as an enumerable.
  Returns a lazy stream to avoid loading all values into memory at once.
  """
  def get_chunk(from, to) when is_index(from) and is_index(to) do
    GenServer.call(__MODULE__, {:get_chunk, from, to})
  end

  @doc """
  Sets the boolean value at the specified index.

  Returns `:ok` on success.
  Raises `{:error, :invalid_index}` if the index is out of bounds.
  """
  def set(index, value) when is_boolean(value) do
    GenServer.call(__MODULE__, {:set, index, value})
  end

  @doc """
  Toggles the boolean value at the specified index (true becomes false, false becomes true).

  Returns the new boolean value after toggling.
  Raises `{:error, :invalid_index}` if the index is out of bounds.
  """
  def toggle(index) when is_index(index) do
    GenServer.call(__MODULE__, {:toggle, index})
  end

  # Server Callbacks

  @impl true
  @spec init(keyword() | map()) :: {:ok, ets_state()} | {:stop, term()} | :ignore
  def init(_opts) do
    table = :ets.new(:bool_store, [:set, :protected])
    {:ok, table}
  end

  @impl true
  @spec handle_call({:get, integer()}, GenServer.from(), ets_state()) ::
          {:reply, boolean(), ets_state()}
  def handle_call({:get, index}, _from, state) do
    case :ets.lookup(state, index) do
      [{_, value}] -> {:reply, value, state}
      _ -> {:reply, false, state}
    end
  end

  @impl true
  @spec handle_call({:set, integer(), boolean()}, GenServer.from(), ets_state()) ::
          {:reply, :ok, ets_state()}
  def handle_call({:set, index, value}, _from, state) do
    :ets.insert(state, {index, value})
    {:reply, :ok, state}
  end

  @impl true
  @spec handle_call({:toggle, integer()}, GenServer.from(), ets_state()) ::
          {:reply, boolean(), ets_state()}
  def handle_call({:toggle, index}, _from, state) do
    new_value =
      case :ets.lookup(state, index) do
        [{_, value}] -> !value
        _ -> true
      end

    :ets.insert(state, {index, new_value})
    {:reply, new_value, state}
  end

  @impl true
  @spec handle_call(:get_all, GenServer.from(), ets_state()) ::
          {:reply, list(boolean()), ets_state()}
  def handle_call(:get_all, _from, state) do
    data =
      for i <- 0..(@total_bools - 1) do
        case :ets.lookup(state, i) do
          [{_, value}] -> value
          _ -> false
        end
      end

    {:reply, data, state}
  end

  @impl true
  @spec handle_call({:get_chunk, integer(), integer()}, GenServer.from(), ets_state()) ::
          {:reply, list(boolean()), ets_state()}
  def handle_call({:get_chunk, from, to}, _from, state) do
    data =
      for i <- from..to do
        case :ets.lookup(state, i) do
          [{_, value}] -> value
          _ -> false
        end
      end

    {:reply, data, state}
  end

  @impl true
  def handle_call(_msg, _from, state), do: {:reply, {:error, :invalid_index}, state}
end
