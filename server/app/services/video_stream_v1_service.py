import cv2
import numpy
import asyncio

from typing import Dict
from fastapi import (
    WebSocket,
    WebSocketDisconnect,
)


class VideoStreamV1Service:
    def __init__(self, user_id: str, websocket_duration: int):
        self._active_connections: Dict[str, WebSocket] = {}
        self._latest_frame: Dict[str, bytes] = {}
        self.user_id = user_id
        self.websocket_duration = websocket_duration

    async def websocket_connection(self, websocket: WebSocket):
        await websocket.accept()
        connection_key = self.user_id
        self._active_connections[connection_key] = websocket

        print(f"[CONNECTED] WebSocket \n user_id: {self.user_id} \n ===")

        try:
            await asyncio.wait_for(
                asyncio.gather(
                    self._receive_frames(websocket, connection_key),
                    self._send_processed_frames(websocket, connection_key),
                ),
                timeout=self.websocket_duration,
            )
        except WebSocketDisconnect:
            print(f"[DISCONNECTED] WebSocket (Client closed) \n user_id: {self.user_id} \n ===")
        except asyncio.TimeoutError:
            print(
                f"[TIMEOUT] WebSocket for {connection_key} ended after {self.websocket_duration} seconds."
            )
        except Exception as e:
            print(f"[ERROR] WebSocket \n user_id: {self.user_id} \n error: {e} \n ===")
        finally:
            print(f"[CLEANUP] Resources for {self.user_id} released.")
            if connection_key in self._active_connections:
                del self._active_connections[connection_key]
            if connection_key in self._latest_frame:
                del self._latest_frame[connection_key]

    async def _receive_frames(self, websocket: WebSocket, connection_key: str):
        """
        เมธอดสำหรับรับเฟรมวิดีโอจาก Client และเก็บไว้ใน _latest_frame
        """
        while True:
            try:
                data = await websocket.receive_bytes()
                self._latest_frame[connection_key] = data
            except WebSocketDisconnect:
                print(f"[RECEIVE_TASK] Client disconnected for {connection_key}.")
                break
            except Exception as e:
                print(f"[RECEIVE_TASK_ERROR] for {connection_key}: {e}")
                break

    async def _send_processed_frames(self, websocket: WebSocket, connection_key: str):
        """
        เมธอดสำหรับประมวลผลและส่งเฟรมวิดีโอที่ประมวลผลแล้วกลับไปให้ Client
        """
        while True:
            if connection_key in self._latest_frame:
                data = self._latest_frame[connection_key]
                try:
                    nparr = numpy.frombuffer(data, numpy.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                    if frame is not None:
                        text = f"connection_key: {connection_key}"
                        cv2.putText(
                            frame,
                            text,
                            (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1,
                            (0, 255, 0),
                            2,
                            cv2.LINE_AA,
                        )

                        _, encoded_image = cv2.imencode(".jpg", frame)

                        await websocket.send_bytes(encoded_image.tobytes())
                    else:
                        print(f"[WARNING] Could not decode frame for {connection_key}.")

                except Exception as e:
                    print(f"[PROCESS_SEND_ERROR] for {connection_key}: {e}")
                    break

            await asyncio.sleep(0.033)  # * 1/30 = 0.0333... (30 FPS)
