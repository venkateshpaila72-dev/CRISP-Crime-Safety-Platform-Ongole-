from fastapi import WebSocket
from typing import List
import asyncio
import json


class WebSocketManager:

    def __init__(self):

        self.active_connections: List[WebSocket] = []

        self.lock = asyncio.Lock()

    # -------------------------------------------------------
    # CONNECT
    # -------------------------------------------------------

    async def connect(
        self,
        websocket: WebSocket,
    ):

        await websocket.accept()

        async with self.lock:

            self.active_connections.append(
                websocket
            )

    # -------------------------------------------------------
    # DISCONNECT
    # -------------------------------------------------------

    async def disconnect(
        self,
        websocket: WebSocket,
    ):

        async with self.lock:

            if websocket in self.active_connections:

                self.active_connections.remove(
                    websocket
                )

    # -------------------------------------------------------
    # SEND TO ONE
    # -------------------------------------------------------

    async def send_personal_message(
        self,
        message: dict,
        websocket: WebSocket,
    ):

        try:

            await websocket.send_text(
                json.dumps(message)
            )

        except Exception:

            pass

    # -------------------------------------------------------
    # BROADCAST
    # -------------------------------------------------------

    async def broadcast(
        self,
        message: dict,
    ):

        dead_connections = []

        for connection in self.active_connections:

            try:

                await connection.send_text(
                    json.dumps(message)
                )

            except Exception:

                dead_connections.append(
                    connection
                )

        for connection in dead_connections:

            await self.disconnect(
                connection
            )

    # -------------------------------------------------------
    # ZONE UPDATED
    # -------------------------------------------------------

    async def zone_updated(
        self,
        zone_name: str,
    ):

        await self.broadcast(

            {

                "type": "zone_updated",

                "zone": zone_name

            }

        )

    # -------------------------------------------------------
    # INCIDENT ADDED
    # -------------------------------------------------------

    async def incident_added(
        self,
        incident: dict,
    ):

        await self.broadcast(

            {

                "type": "incident_added",

                "incident": incident

            }

        )

    # -------------------------------------------------------
    # REFRESH MAP
    # -------------------------------------------------------

    async def refresh_map(self):

        await self.broadcast(

            {

                "type": "refresh_map"

            }

        )

    # -------------------------------------------------------
    # NEW LOCALITY
    # -------------------------------------------------------

    async def new_locality(
        self,
        locality: str,
    ):

        await self.broadcast(

            {

                "type": "new_locality",

                "locality": locality

            }

        )

    # -------------------------------------------------------
    # HEATMAP UPDATED
    # -------------------------------------------------------

    async def heatmap_updated(self):

        await self.broadcast(

            {

                "type": "heatmap_updated"

            }

        )

    # -------------------------------------------------------
    # SYSTEM MESSAGE
    # -------------------------------------------------------

    async def system_message(
        self,
        text: str,
    ):

        await self.broadcast(

            {

                "type": "system",

                "message": text

            }

        )

    # -------------------------------------------------------
    # CONNECTION COUNT
    # -------------------------------------------------------

    def count(self):

        return len(
            self.active_connections
        )


manager = WebSocketManager()