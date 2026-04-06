import { Channel, Socket } from "phoenix";
import { useEffect, useRef } from "react";

export function useCheckboxChannel(...listeners: Parameters<Channel["on"]>[]) {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    const socket = new Socket("/socket");
    socket.connect();

    const channel = socket.channel("room:checkboxes");

    channel
      .join()
      .receive("ok", (_resp) => {})
      .receive("error", (err) => {
        console.error(err);
      });

    for (const listener of listeners) {
      channel.on(...listener);
    }

    channelRef.current = channel;

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, []);

  return channelRef;
}
