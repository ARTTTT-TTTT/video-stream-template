from fastapi import APIRouter


from app.routes import (
    video_stream_v1_route,
    video_stream_v2_route,
)


api_router = APIRouter()

api_router.include_router(video_stream_v1_route.router)
api_router.include_router(video_stream_v2_route.router)
