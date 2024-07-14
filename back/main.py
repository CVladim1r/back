from fastapi import FastAPI, WebSocket
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from routers import api, ws  # Adjust import paths as per your project structure

app = FastAPI()

# CORS settings for regular HTTP requests
origins = [
    "http://localhost:3000",  # Update with your React app's URL
    # Add more origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Add more methods as needed
    allow_headers=["*"],
)

# WebSocket CORS middleware
class WebSocketCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['access-control-allow-origin'] = '*'
        response.headers['access-control-allow-headers'] = '*'
        return response

app.add_middleware(WebSocketCORSMiddleware)

# Include your API and WebSocket routers
app.include_router(api.router, prefix="/api")
app.include_router(ws.router, prefix="/ws")

# Example route
@app.get("/")
async def read_root():
    return {"Hello": "World"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
