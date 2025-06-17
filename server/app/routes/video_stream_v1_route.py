from fastapi import APIRouter, WebSocket
from app.services.video_stream_v1_service import VideoStreamV1Service


router = APIRouter(prefix="/video-stream-v1", tags=["VIDEO STREAM V1"])


@router.websocket("/{user_id}/{websocket_duration}")
async def websocket(websocket: WebSocket, user_id: str, websocket_duration: int):
    """
    Endpoint สำหรับ WebSocket เพื่อรับสตรีมวิดีโอจาก Client

    Parameters:
    - websocket: อ็อบเจกต์ WebSocket ที่ใช้ในการสื่อสาร
    - user_id: รหัสของผู้ใช้ที่เชื่อมต่อ
    - websocket_duration: ระยะเวลาการเชื่อมต่อ
    """
    video_stream_service = VideoStreamV1Service(user_id, websocket_duration)
    await video_stream_service.websocket_connection(websocket)
