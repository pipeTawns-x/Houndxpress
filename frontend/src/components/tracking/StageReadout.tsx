import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery.ts";

/** The final value is always available to assistive technology and without animation. */
export function StageReadout({ value }: { value: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const [frame, setFrame] = useState<{ target: number; value: number } | null>(null);
  useEffect(() => {
    if (
      reduced ||
      document.documentElement.dataset.motion === "off" ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    let animation = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const started = performance.now();
      function draw(now: number) {
        const progress = Math.min(1, (now - started) / 600);
        setFrame({ target: value, value: Math.round(value * (1 - Math.pow(1 - progress, 3))) });
        if (progress < 1) animation = requestAnimationFrame(draw);
      }
      animation = requestAnimationFrame(draw);
    });
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animation);
    };
  }, [reduced, value]);
  return (
    <p ref={ref} className="guide-card__progress">
      <span className="visually-hidden">Etapa {value} de 5</span>
      <span aria-hidden="true">Etapa {reduced || frame?.target !== value ? value : frame.value} de 5</span>
    </p>
  );
}
