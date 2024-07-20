from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import Response

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
