from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.websocket_manager import manager

router = APIRouter(
    tags=["websocket"]
)


@router.websocket("/ws/live")
async def websocket_endpoint(
    websocket: WebSocket,
):

    await manager.connect(websocket)

    try:

        await manager.system_message(
            "Connected to Ongole SafeMap Live Server"
        )

        while True:

            data = await websocket.receive_text()

            if data == "ping":

                await manager.send_personal_message(
                    {
                        "type": "pong"
                    },
                    websocket,
                )

    except WebSocketDisconnect:

        await manager.disconnect(
            websocket
        )

    except Exception:

        await manager.disconnect(
            websocket
        )