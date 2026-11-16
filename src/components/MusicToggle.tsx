"use client";

/**
 * MusicToggle — small play/pause button for the Sisi lounge track.
 *
 * Default: silent. The audio file is NEVER fetched until the user taps
 * play (preload="none"), so it adds 0 KB to the initial page load.
 * Loops the 3:39 lounge track at reduced volume while playing.
 */
import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/sisi-lounge.mp3";

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;
    const onEnded = () => setPlaying(false);
    const onError = () => {
      setFailed(true);
      setPlaying(false);
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
    };
  }, []);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio || failed) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setFailed(true);
      setPlaying(false);
    }
  }

  if (failed) return null;

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} preload="none" loop />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Jeda musik" : "Putar musik lounge"}
        title={playing ? "Jeda musik" : "Putar musik lounge"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-jungle text-cream transition-transform hover:scale-[1.06]"
      >
        {playing ? (
          <span
            aria-hidden="true"
            className="flex h-3.5 items-end gap-[2.5px]"
          >
            <span className="eq-bar w-[2.5px] rounded-full bg-lime" />
            <span
              className="eq-bar w-[2.5px] rounded-full bg-lime"
              style={{ animationDelay: "0.25s" }}
            />
            <span
              className="eq-bar w-[2.5px] rounded-full bg-lime"
              style={{ animationDelay: "0.5s" }}
            />
          </span>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 translate-x-[1px]"
          >
            <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
          </svg>
        )}
      </button>
    </>
  );
}
