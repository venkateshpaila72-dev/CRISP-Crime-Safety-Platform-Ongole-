import { useEffect } from "react";

export default function useLiveZones(onRefresh) {

  useEffect(() => {

    let socket;
    let reconnectTimeout;
    let closed = false;

    const connect = () => {

      socket = new WebSocket(
        `${import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000"}/ws/live`
      );

      socket.onopen = () => {

        console.log("✅ Live updates connected");

      };

      socket.onmessage = (event) => {

        const message = JSON.parse(event.data);

        switch (message.type) {

          case "incident_added":

          case "zone_updated":

          case "refresh_map":

          case "heatmap_updated":

          case "new_locality":

            onRefresh();

            break;

          default:

            break;

        }

      };

      socket.onerror = (err) => {

        console.error("WebSocket error", err);

      };

      socket.onclose = () => {

        console.log("🔌 WebSocket disconnected");

        if (!closed) {

          reconnectTimeout = setTimeout(connect, 3000);

        }

      };

    };

    connect();

    return () => {

      closed = true;

      clearTimeout(reconnectTimeout);

      if (
        socket &&
        (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        )
      ) {

        socket.close();

      }

    };

  }, [onRefresh]);

}