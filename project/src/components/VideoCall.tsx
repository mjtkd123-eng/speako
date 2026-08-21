import { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MonitorUp,
  Loader2,
  AlertCircle,
  Radio,
  Clock,
} from 'lucide-react';
import { useVideo } from '@/lib/video-context';
import { t, type UiLang } from '@/i18n';
import { Room, RoomEvent, Track } from 'livekit-client';

type Props = {
  uiLang: UiLang;
  onLeave: () => void;
};

export default function VideoCall({ uiLang, onLeave }: Props) {
  const { status, room, error, usage, leaveRoom, callDuration } = useVideo();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const livekitRoomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const dailyIframeRef = useRef<HTMLDivElement>(null);

  // ── Daily.co: embed via iframe ──
  useEffect(() => {
    if (status !== 'active' || !room || room.provider !== 'daily') return;

    // Build Daily.co iframe URL with token
    const url = room.token
      ? `${room.roomUrl}?t=${room.token}`
      : room.roomUrl;

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allow =
      'camera; microphone; fullscreen; display-capture; autoplay; clipboard-write';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '16px';
    iframe.referrerPolicy = 'no-referrer';

    if (dailyIframeRef.current) {
      dailyIframeRef.current.innerHTML = '';
      dailyIframeRef.current.appendChild(iframe);
    }

    return () => {
      if (dailyIframeRef.current) {
        dailyIframeRef.current.innerHTML = '';
      }
    };
  }, [status, room]);

  // ── LiveKit: connect via livekit-client SDK ──
  useEffect(() => {
    if (status !== 'active' || !room || room.provider !== 'livekit') return;

    let cancelled = false;
    const lkRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    livekitRoomRef.current = lkRoom;

    lkRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
        const stream = new MediaStream();
        stream.addTrack(track.mediaStreamTrack);
        setRemoteStream(stream);
      }
    });

    lkRoom.on(RoomEvent.TrackUnsubscribed, () => {
      setRemoteStream(null);
    });

    lkRoom.on(RoomEvent.LocalTrackPublished, (pub) => {
      if (pub.track && (pub.track.kind === Track.Kind.Video || pub.track.kind === Track.Kind.Audio)) {
        const stream = new MediaStream();
        stream.addTrack(pub.track.mediaStreamTrack);
        setLocalStream(stream);
      }
    });

    (async () => {
      try {
        await lkRoom.prepareConnection(room.roomUrl, room.token ?? '');
        await lkRoom.connect(room.roomUrl, room.token ?? '');
        await lkRoom.localParticipant.setCameraEnabled(true);
        await lkRoom.localParticipant.setMicrophoneEnabled(true);
        if (cancelled) {
          lkRoom.disconnect();
          return;
        }
        // Set local stream from camera
        const localTrack = lkRoom.localParticipant.getTrackPublication(Track.Source.Camera);
        if (localTrack?.track) {
          const stream = new MediaStream();
          stream.addTrack(localTrack.track.mediaStreamTrack);
          setLocalStream(stream);
        }
      } catch (err) {
        console.error('LiveKit connect error:', err);
      }
    })();

    return () => {
      cancelled = true;
      lkRoom.disconnect();
      livekitRoomRef.current = null;
      setLocalStream(null);
      setRemoteStream(null);
    };
  }, [status, room]);

  // ── Attach streams to video elements (LiveKit) ──
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ── Toggle controls ──
  const toggleMic = async () => {
    if (room?.provider === 'livekit' && livekitRoomRef.current) {
      await livekitRoomRef.current.localParticipant.setMicrophoneEnabled(!micOn);
    }
    setMicOn((m) => !m);
  };

  const toggleCam = async () => {
    if (room?.provider === 'livekit' && livekitRoomRef.current) {
      await livekitRoomRef.current.localParticipant.setCameraEnabled(!camOn);
    }
    setCamOn((c) => !c);
  };

  const handleLeave = async () => {
    if (room?.provider === 'livekit' && livekitRoomRef.current) {
      livekitRoomRef.current.disconnect();
    }
    await leaveRoom();
    onLeave();
  };

  // ── Connecting / Error states ──
  if (status === 'connecting') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
        <p className="text-sm font-medium text-ink-500">
          {t('video', 'connecting', uiLang)}
        </p>
      </div>
    );
  }

  if (status === 'error' || (!room && status !== 'active')) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-error-500" />
        <p className="max-w-md text-center text-sm text-ink-500">
          {t('video', 'failedToConnect', uiLang)}
        </p>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <PhoneOff className="h-10 w-10 text-ink-400" />
        <p className="text-sm font-medium text-ink-500">
          {t('video', 'callEnded', uiLang)}
        </p>
      </div>
    );
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const remainingMin = usage ? Math.floor(usage.remaining_seconds / 60) : 0;

  return (
    <div className="flex min-h-[60vh] flex-col gap-4">
      {/* Provider badge + usage info */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
              room?.provider === 'daily'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-accent-100 text-accent-700'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            {room?.provider === 'daily' ? 'Daily.co' : 'LiveKit'}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-ink-500">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(callDuration)}
          </span>
        </div>
        {room?.provider === 'daily' && usage && (
          <span className="text-xs font-medium text-ink-400">
            {uiLang === 'KR'
              ? `이번 달 무료 한도: ${remainingMin.toLocaleString()}분 남음`
              : `Free limit: ${remainingMin.toLocaleString()} min left`}
          </span>
        )}
      </div>

      {/* Video area */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-ink-900">
        {room?.provider === 'daily' ? (
          <div ref={dailyIframeRef} className="h-full min-h-[400px] w-full" />
        ) : (
          <div className="relative h-full min-h-[400px] w-full">
            {/* Remote video (main) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white/60">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm">
                    {t('video', 'waitingForTutor', uiLang)}
                  </span>
                </div>
              </div>
            )}
            {/* Local video (picture-in-picture) */}
            <div className="absolute bottom-4 right-4 h-32 w-44 overflow-hidden rounded-xl border-2 border-white/20 bg-ink-800 shadow-lg sm:h-40 sm:w-56">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full -scale-x-100 object-cover"
              />
              {!localStream && (
                <div className="absolute inset-0 flex items-center justify-center text-white/40">
                  <VideoOff className="h-6 w-6" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggleMic}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            micOn
              ? 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              : 'bg-error-500 text-white hover:bg-error-600'
          }`}
          aria-label={micOn ? t('video', 'mute', uiLang) : t('video', 'unmute', uiLang)}
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleCam}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            camOn
              ? 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              : 'bg-error-500 text-white hover:bg-error-600'
          }`}
          aria-label={camOn ? t('video', 'turnOffCamera', uiLang) : t('video', 'turnOnCamera', uiLang)}
        >
          {camOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>
        <button
          onClick={handleLeave}
          className="flex h-12 items-center gap-2 rounded-full bg-error-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-error-600"
        >
          <PhoneOff className="h-5 w-5" />
          {t('video', 'leaveCall', uiLang)}
        </button>
      </div>
    </div>
  );
}
