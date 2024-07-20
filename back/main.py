from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from core.config import settings
from core.middleware import WebSocketCORSMiddleware
from routers import api, ws
import os

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.getenv('TESTING'):
    app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(WebSocketCORSMiddleware)

app.include_router(api.router, prefix="/api")
app.include_router(ws.router, prefix="/ws")

@app.get("/")
async def read_root():
    return {"Hello": "World"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
