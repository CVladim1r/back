from fastapi import FastAPI, WebSocket, Request
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from routers import api, ws

app = FastAPI()

origins = [
    "http://localhost:3000",
    "ws://localhost:3000",
    "http://localhost:5174",
    "ws://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WebSocketCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/ws"):
            response = Response()
            response.headers['access-control-allow-origin'] = '*'
            response.headers['access-control-allow-headers'] = '*'
            response.headers['access-control-allow-methods'] = '*'
            response.headers['access-control-allow-credentials'] = 'true'
            if request.method == "OPTIONS":
                return response
            response = await call_next(request)
            return response
        return await call_next(request)

app.add_middleware(WebSocketCORSMiddleware)

app.include_router(api.router, prefix="/api")
app.include_router(ws.router, prefix="/ws")

@app.get("/")
async def read_root():
    return {"Hello": "World"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
