"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";

type TitleTag = "h2" | "h3" | "span" | "p" | "div";

export function ExpandableSection({
  id,
  title,
  description,
  expanded,
  onToggle,
  titleTag = "h2",
  containerClassName = "",
  headerClassName = "",
  titleClassName = "text-[16px] font-bold text-black",
  titleAndToggleClassName = "flex items-center gap-2",
  descriptionClassName = "max-w-[720px] pb-4 text-left text-[16px] tracking-[-0.02em] leading-[120%] text-black",
  toggleButtonClassName = "flex h-8 w-8 min-h-8 min-w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded text-black transition-colors hover:bg-black/5 active:bg-black/10 [&_img]:hover:opacity-80 [&_img]:active:opacity-90",
  descriptionPanelClassName = "z-20 bg-white",
  renderHeader,
  children,
}: {
  id: string;
  title: ReactNode;
  description: ReactNode;
  expanded: boolean;
  onToggle: () => void;
  titleTag?: TitleTag;
  containerClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  titleAndToggleClassName?: string;
  descriptionClassName?: string;
  descriptionPanelClassName?: string;
  toggleButtonClassName?: string;
  renderHeader?: (args: {
    expanded: boolean;
    titleNode: ReactNode;
    toggleButton: ReactNode;
  }) => ReactNode;
  children?: ReactNode;
}) {
  const Title = titleTag;
  const contentId = `${id}-content`;

  // Measure description height so we can animate an overlay panel open/closed
  // without pushing layout below (panel is absolutely positioned).
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const [descriptionHeight, setDescriptionHeight] = useState(0);

  useLayoutEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;

    const measure = () => setDescriptionHeight(el.scrollHeight);
    measure();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => measure());
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [description]);

  const titleNode = <Title className={titleClassName}>{title}</Title>;
  const toggleButton = (
    <button
      type="button"
      aria-label={expanded ? "Collapse" : "Expand"}
      aria-expanded={expanded}
      aria-controls={contentId}
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}
      className={toggleButtonClassName}
    >
      <Image
        src={expanded ? "/icons/minus.svg" : "/icons/plus.svg"}
        alt=""
        width={16}
        height={16}
        className="h-4 w-4 select-none object-contain pointer-events-none"
        aria-hidden
      />
    </button>
  );

  return (
    <div className={`relative ${containerClassName}`}>
      {/* z-30 ensures the overlay panel sits above any content rendered below */}
      <div className={`relative z-30 ${headerClassName}`}>
        {typeof renderHeader === "function" ? (
          renderHeader({ expanded, titleNode, toggleButton })
        ) : (
          <div className={titleAndToggleClassName}>
            {titleNode}
            {toggleButton}
          </div>
        )}

        {/* Overlay description panel (does not affect layout below). */}
        <div
          id={contentId}
          style={{
            height: expanded ? descriptionHeight : 0,
            opacity: expanded ? 1 : 0,
            transitionProperty: "height, opacity",
            willChange: "height, opacity",
          }}
          className={`pointer-events-none absolute left-0 right-0 top-full overflow-hidden duration-300 ease-out motion-reduce:transition-none ${descriptionPanelClassName} ${
            expanded ? "pointer-events-auto" : ""
          }`}
          aria-hidden={!expanded}
          role="region"
        >
          <div ref={descriptionRef}>
            <p className={descriptionClassName}>{description}</p>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
