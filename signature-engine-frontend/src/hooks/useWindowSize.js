import { useEffect, useState } from "react";

/**
 * useWindowSize
 *
 * Responsibilities:
 * - Track viewport width & height
 * - Update on resize
 *
 * Usage:
 * const { width, height, isMobile } = useWindowSize();
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  return {
    width: size.width,
    height: size.height,
    isMobile: size.width <= 768,
  };
}
