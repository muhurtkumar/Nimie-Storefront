import {useEffect, useRef, useState} from 'react';

export function LazyVideo({
  src,
  fallbackSrc,
  poster,
  className,
  style,
  ariaLabel,
  ariaHidden = false,
  loop = true,
  eager = false,
}) {
  const videoRef = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(eager);
  const [shouldLoad, setShouldLoad] = useState(eager);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (!('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry.isIntersecting);
        if (entry.isIntersecting) setShouldLoad(true);
      },
      {rootMargin: '200px 0px'},
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !shouldLoad) return;

    if (isNearViewport) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isNearViewport, shouldLoad]);

  return (
    <video
      ref={videoRef}
      src={fallbackSrc ? undefined : shouldLoad ? src : undefined}
      poster={poster}
      muted
      playsInline
      loop={loop}
      preload={eager ? 'auto' : 'none'}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden || undefined}
      className={className}
      style={style}
    >
      {fallbackSrc && shouldLoad ? (
        <>
          <source src={src} type="video/quicktime" />
          <source src={fallbackSrc} type="video/webm" />
        </>
      ) : null}
    </video>
  );
}
