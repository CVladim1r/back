from fastapi import FastAPI, WebSocket
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from routers import api, ws

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class WebSocketCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['access-control-allow-origin'] = '*'
        response.headers['access-control-allow-headers'] = '*'
        return response

app.add_middleware(WebSocketCORSMiddleware)

app.include_router(api.router, prefix="/api")
app.include_router(ws.router, prefix="/ws")

@app.get("/")
async def read_root():
    return {"Messqge": "Server Working!"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
