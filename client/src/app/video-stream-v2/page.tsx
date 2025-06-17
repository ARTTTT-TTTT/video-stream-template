'use client';

import { LiveKitRoom, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect, useState } from 'react';
import '@livekit/components-styles';

import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { LIVEKIT_URL, SERVER_URL, STUN_URL, TURN_URL } from '@/constants/env';

interface DeviceInfo {
  deviceId: string;
  label: string;
}

export default function VideoStreamV2() {
  const [token, setToken] = useState<string | null>(null);
  const [turnCreds, setTurnCreds] = useState<{
    username: string;
    credential: string;
  } | null>(null);
  const [videoDevices, setVideoDevices] = useState<DeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    const init = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(
        (device) => device.kind === 'videoinput',
      );
      setVideoDevices(
        videoInputs.map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId}`,
        })),
      );

      if (videoInputs.length > 0) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }

      const res = await fetch(
        `${SERVER_URL}/video-stream-v2/token?identity=${crypto.randomUUID()}&room=myroom`,
      );
      const data = await res.json();
      setToken(data.token);

      const turnRes = await fetch(
        `${SERVER_URL}/video-stream-v2/turn_credentials`,
      );
      const turnData = await turnRes.json();
      setTurnCreds(turnData);
    };
    init();
  }, []);

  if (!token || !turnCreds)
    return <div className='p-4 text-center'>Loading...</div>;

  return (
    <main className='flex h-screen w-screen flex-col items-center justify-center gap-4 p-4'>
      {/* ... ส่วนเลือกกล้อง ... */}
      {videoDevices.length > 0 && (
        <div className='flex items-center gap-2'>
          <label htmlFor='camera-select' className='text-sm font-medium'>
            Select Camera:
          </label>
          <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
            <SelectTrigger id='camera-select' className='w-[200px]'>
              <SelectValue placeholder='Choose Camera' />
            </SelectTrigger>
            <SelectContent>
              {videoDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <LiveKitRoom
        key={selectedDeviceId}
        token={token}
        serverUrl={LIVEKIT_URL}
        connect={true}
        video={
          selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
        }
        audio={false}
        connectOptions={{
          autoSubscribe: true,
          rtcConfig: {
            iceTransportPolicy: 'all',
            iceServers: [
              { urls: [`${STUN_URL}`] },
              {
                urls: [`${TURN_URL}?transport=udp`],
                username: turnCreds.username,
                credential: turnCreds.credential,
              },
              {
                urls: [`${TURN_URL}?transport=tcp`],
                username: turnCreds.username,
                credential: turnCreds.credential,
              },
            ],
          },
        }}
      >
        <VideoGrid />
      </LiveKitRoom>
    </main>
  );
}

function VideoGrid() {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);

  return (
    <div className='grid grid-cols-2 gap-6 p-2'>
      {tracks.map(({ publication, participant }) => (
        <Card key={participant.identity} className='rounded-2xl p-2 shadow-lg'>
          <video
            ref={(ref) => {
              if (ref && publication && publication.track) {
                publication.track.attach(ref);
              }
            }}
            autoPlay
            muted={participant.isLocal}
            className='h-auto w-full rounded-xl'
          />
          <div className='mt-2 text-center text-sm text-gray-600'>
            {participant.identity} {participant.isLocal && '(You)'}
          </div>
        </Card>
      ))}
    </div>
  );
}
