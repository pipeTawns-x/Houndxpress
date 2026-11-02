import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useMediaQuery } from "../../hooks/useMediaQuery.ts";

/** Static poster remains visible if playback is unavailable or motion is reduced. */
export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const [paused, setPaused] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const stopped = reduced || paused || unavailable;
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    function sync() {
      if (!element) return;
      if (stopped || document.hidden) element.pause();
      else
        void element.play().catch(() => {
          setUnavailable(true);
        });
    }
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      element.pause();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [stopped]);
  return (
    <>
      <div className="brand-hero__media">
        <img
          src="/media/hero-poster.webp"
          width={1344}
          height={752}
          alt="Vista ilustrativa de un tráiler en un corredor fronterizo"
          className="brand-hero__poster"
        />
        <video
          ref={video}
          src={reduced ? undefined : "/media/hero.mp4"}
          poster="/media/hero-poster.webp"
          width={1344}
          height={752}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className={stopped ? "brand-hero__video brand-hero__video--paused" : "brand-hero__video"}
          onError={() => setUnavailable(true)}
        />
      </div>
      {!reduced && !unavailable ? (
        <button
          type="button"
          className="brand-hero__motion"
          aria-pressed={paused}
          onClick={() => {
            setPaused((value) => !value);
            document.documentElement.dataset.motion = paused ? "on" : "off";
          }}
        >
          {paused ? <Play aria-hidden="true" size={16} /> : <Pause aria-hidden="true" size={16} />}
          {paused ? "Activar movimiento" : "Pausar movimiento"}
        </button>
      ) : null}
    </>
  );
}
