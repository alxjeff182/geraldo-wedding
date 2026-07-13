import { useCallback, useEffect, useRef, useState } from "react";

function syncPlayingState(
  audio: HTMLAudioElement,
  setPlayingState: (value: boolean) => void
) {
  setPlayingState(!audio.paused && !audio.ended);
}

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);

  const setPlayingState = useCallback((value: boolean) => {
    playingRef.current = value;
    setPlaying(value);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const sync = () => syncPlayingState(audio, setPlayingState);

    audio.addEventListener("play", sync);
    audio.addEventListener("playing", sync);
    audio.addEventListener("pause", sync);
    audio.addEventListener("ended", sync);

    const onVisibility = () => {
      if (!audioRef.current) return;
      if (document.visibilityState === "visible" && playingRef.current) {
        void audioRef.current.play().catch(() => undefined);
      } else if (document.visibilityState === "hidden") {
        audioRef.current.pause();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    sync();

    return () => {
      audio.removeEventListener("play", sync);
      audio.removeEventListener("playing", sync);
      audio.removeEventListener("pause", sync);
      audio.removeEventListener("ended", sync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [setPlayingState]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const startPlayback = () => {
      const result = audio.play();
      if (result) {
        void result
          .then(() => syncPlayingState(audio, setPlayingState))
          .catch(() => setPlayingState(false));
      } else {
        syncPlayingState(audio, setPlayingState);
      }
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startPlayback();
      return;
    }

    const onCanPlay = () => {
      audio.removeEventListener("canplay", onCanPlay);
      startPlayback();
    };

    audio.addEventListener("canplay", onCanPlay);
    audio.load();
  }, [setPlayingState]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlayingState(false);
  }, [setPlayingState]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  const preload = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
  }, []);

  return { audioRef, playing, play, pause, toggle, preload };
}
