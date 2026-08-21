import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

export type VideoProvider = 'daily' | 'livekit';
export type CallStatus = 'idle' | 'connecting' | 'active' | 'ended' | 'error';

export type ProviderUsage = {
  provider: VideoProvider;
  daily_seconds: number;
  daily_limit_seconds: number;
  remaining_seconds: number;
  switched: boolean;
};

export type VideoRoom = {
  provider: VideoProvider;
  roomUrl: string;
  token: string | null;
  callId: string;
  roomName: string;
  usage: ProviderUsage;
};

type VideoContextValue = {
  status: CallStatus;
  room: VideoRoom | null;
  error: string | null;
  usage: ProviderUsage | null;
  joinRoom: (lessonId: string | null, participantName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  callDuration: number;
};

const VideoContext = createContext<VideoContextValue | null>(null);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [room, setRoom] = useState<VideoRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<ProviderUsage | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const callEdgeFunction = useCallback(async (payload: Record<string, unknown>) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/video-ops`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // Never surface the backend's own error text to the interface.
      console.error('video-ops request failed', res.status);
      throw new Error('VIDEO_OP_FAILED');
    }
    return res.json();
  }, []);

  const joinRoom = useCallback(
    async (lessonId: string | null, participantName: string) => {
      setStatus('connecting');
      setError(null);
      setCallDuration(0);
      try {
        // The room name is generated server-side so it cannot be guessed or reused.
        const data = await callEdgeFunction({
          action: 'create-room',
          lessonId,
          participantName,
        });

        setRoom(data as VideoRoom);
        setUsage(data.usage as ProviderUsage);
        setStatus('active');

        durationTimer.current = setInterval(() => {
          setCallDuration((d) => d + 1);
        }, 1000);
      } catch (err) {
        console.error('join room failed', err);
        setError('JOIN_FAILED');
        setStatus('error');
      }
    },
    [callEdgeFunction],
  );

  const leaveRoom = useCallback(async () => {
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }

    if (room?.callId) {
      try {
        await callEdgeFunction({ action: 'end-call', callId: room.callId });
      } catch {
        // Non-fatal: call already ended or network issue
      }
    }

    setStatus('ended');
    setRoom(null);
    setCallDuration(0);
  }, [room, callEdgeFunction]);

  return (
    <VideoContext.Provider
      value={{ status, room, error, usage, joinRoom, leaveRoom, callDuration }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error('useVideo must be used within VideoProvider');
  return ctx;
}
