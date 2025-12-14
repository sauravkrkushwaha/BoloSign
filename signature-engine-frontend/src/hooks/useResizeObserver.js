import { useEffect, useState } from "react";

/**
 * useResizeObserver
 *
 * Responsibilities:
 * - Observe size of a DOM element
 * - Return live width & height
 *
 * Usage:
 * const { width, height, ref } = useResizeObserver();
 * <div ref={ref} />
 */
export function useResizeObserver() {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const ref = (node) => {
    if (!node) return;

    const observer = new ResizeObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const { width, height } =
          entry.contentRect;

        setSize({
          width,
          height,
        });
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  };

  return {
    ref,
    width: size.width,
    height: size.height,
  };
}
