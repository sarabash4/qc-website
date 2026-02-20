"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type UseInViewOptions = {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  initialInView?: boolean;
};

export function useInView(options: UseInViewOptions = {}) {
  const {
    root = null,
    rootMargin = "0px",
    threshold = 0,
    initialInView = false,
  } = options;

  const [node, setNode] = useState<Element | null>(null);
  const [inView, setInView] = useState<boolean>(initialInView);
  const [hasEntered, setHasEntered] = useState<boolean>(initialInView);

  const thresholdKey = useMemo(() => {
    return Array.isArray(threshold) ? threshold.join(",") : String(threshold);
  }, [threshold]);

  const ref = useCallback((el: Element | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => {
        setInView(true);
        setHasEntered(true);
      });
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isIntersecting = Boolean(entry?.isIntersecting);
        setInView(isIntersecting);
        if (isIntersecting) setHasEntered(true);
      },
      { root, rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, root, rootMargin, thresholdKey, threshold]);

  return { ref, inView, hasEntered };
}

