const isProd = process.env.NODE_ENV === 'production';
const isLocal = process.env.NODE_ENV === 'development';

const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true';

// * Video stream V1
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

// * Video stream V2
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL;
const STUN_URL = process.env.NEXT_PUBLIC_STUN_URL;
const TURN_URL = process.env.NEXT_PUBLIC_TURN_URL;

export {
  isLocal,
  isProd,
  LIVEKIT_URL,
  SERVER_URL,
  showLogger,
  STUN_URL,
  TURN_URL,
  WS_URL,
};
