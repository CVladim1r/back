from fastapi import FastAPI, WebSocket
import random
import uvicorn

# Create application
app = FastAPI(title='WebSocket Example')

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print('A new websocket connection established.')
    await websocket.accept()
    try:
        while True:
            # Wait for any message from the client
            message = await websocket.receive_text()
            print(f"Received message from client: {message}")
            
            # Send a random value back to the client
            resp = {'value': random.uniform(0, 1)}
            await websocket.send_json(resp)
    except Exception as e:
        print(f"WebSocket error occurred: {e}")
    finally:
        await websocket.close()
        print('WebSocket connection closed.')

if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=8000)
