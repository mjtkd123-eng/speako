"use client";

import { useEffect, useRef, useState } from "react";

export function VodPlayer({ purchaseId }: { purchaseId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`/api/vod/${purchaseId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "권한이 없습니다.");
        setSrc(json.src);
        setTitle(json.title);
        if (videoRef.current && json.progress > 0 && videoRef.current.duration) {
          videoRef.current.currentTime = (json.progress / 100) * videoRef.current.duration;
        }
      })
      .catch((err: Error) => setError(err.message));
  }, [purchaseId]);

  async function reportProgress() {
    const video = videoRef.current;
    if (!video?.duration) return;
    const progress = Math.round((video.currentTime / video.duration) * 100);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId, progress }),
    });
  }

  if (error) {
    return <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">{title || "학습하기"}</h1>
      {src ? (
        <video
          ref={videoRef}
          className="aspect-video w-full rounded-3xl bg-black"
          src={src}
          controls
          onPause={reportProgress}
          onEnded={reportProgress}
        />
      ) : (
        <div className="aspect-video animate-pulse rounded-3xl bg-ink-100" />
      )}
    </div>
  );
}
