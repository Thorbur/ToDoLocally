import asyncio
import websockets

FILE_PATH = "ToDoLocally_db.json"


# create handler for each connection
async def handler(websocket: websockets.WebSocketServerProtocol, path: str) -> None:
    data = await websocket.recv()
    try:
        with open(FILE_PATH, "w") as db_file:
            db_file.write(data)
        reply = f"Data successfully received and stored."
    except Exception as e:
        reply = f"Error occurred: {e}"
    await websocket.send(reply)


start_server = websockets.serve(handler, "localhost", 8888)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
