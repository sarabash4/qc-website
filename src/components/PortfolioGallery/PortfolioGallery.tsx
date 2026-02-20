"use client";

import { useState } from "react";

export type GalleryItem = {
  id: string;
  label: string;
  showTm?: boolean;
  src?: string;
  aspectRatio?: number;
};

function isVideoSrc(src: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(src);
}

/** Gallery items from public/videos and public/images/qbicle. */
const DEFAULT_ITEMS: GalleryItem[] = [
  {
    id: "v-deftones",
    label: "deftones_story.mp4",
    src: "/videos/deftones_story.mp4",
    aspectRatio: 6 / 19,
  },
  {
    id: "v-parku",
    label: "parku_story.mp4",
    src: "/videos/parku_story.mp4",
    aspectRatio: 6 / 19,
  },
  {
    id: "v-aphex",
    label: "aphex_story.mp4",
    src: "/videos/aphex_story.mp4",
    aspectRatio: 6 / 19,
  },
  {
    id: "qb-1",
    label: "qbicle 1",
    src: "/images/qbicle/0bb1ab164700707.63fb7be1302e7.jpg",
  },
  {
    id: "qb-2",
    label: "qbicle 2",
    src: "/images/qbicle/caa804164700707.63fb7be1313e9.jpg",
  },
  {
    id: "qb-3",
    label: "qbicle 3",
    src: "/images/qbicle/b78afe164700707.63fb7be12afd1.jpg",
  },
  {
    id: "qb-4",
    label: "qbicle 4",
    src: "/images/qbicle/e88ecd164700707.63fb7be12e07e.jpg",
  },
  {
    id: "qb-5",
    label: "qbicle 5",
    src: "/images/qbicle/d54369164700707.63fb7be12c17b.jpg",
  },
  {
    id: "qb-6",
    label: "qbicle 6",
    src: "/images/qbicle/c58d35164700707.63fb7be132398.jpg",
  },
  {
    id: "qb-7",
    label: "qbicle 7",
    src: "/images/qbicle/b1f91b164700707.63fb7be12f267.jpg",
  },
];

const VOTRA_DESCRIPTION =
  "Collaborating on a visual identity for an experimental health-tech brand, focusing on technology, wellness, human emotion, refined sensitivity, and future-forward aesthetics. Objectives include creating a logo system, art direction, and immersive visuals.";

type GridView = "2" | "3" | "4";

function ProjectBlock({ item }: { item: GalleryItem }) {
  const mediaSrc = item.src;
  const isVideo = mediaSrc ? isVideoSrc(mediaSrc) : false;

  return (
    <article className="flex flex-col">
      <div
        className="w-full overflow-hidden max-h-[600px]"
        role={isVideo ? "application" : "img"}
        aria-label={item.label}
      >
        {mediaSrc && isVideo ? (
          <video
            src={mediaSrc}
            className="block w-full h-auto max-h-[600px] object-contain bg-black"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : mediaSrc ? (
          <img
            src={mediaSrc}
            alt={item.label}
            className="block w-full h-auto max-h-[600px] object-contain"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-gray-100 text-gray-500">
            <span className="flex items-baseline gap-0.5 text-3xl font-medium sm:text-4xl">
              V
              {item.showTm && (
                <span className="text-xs font-normal align-top">TM</span>
              )}
            </span>
          </div>
        )}
      </div>
      <p className="mt-2 shrink-0 text-xs text-black/80 sm:mt-3 sm:text-sm lg:mt-4 lg:text-sm">
        {item.label}
      </p>
    </article>
  );
}

type PortfolioGalleryProps = {
  items?: GalleryItem[];
};

export default function PortfolioGallery(props?: PortfolioGalleryProps) {
  const { items: itemsProp } = props ?? {};
  const [view, setView] = useState<GridView>("2");
  const [expanded, setExpanded] = useState(false);

  const items = itemsProp ?? DEFAULT_ITEMS;

  const gridClass =
    view === "2"
      ? "grid grid-cols-2 gap-6"
      : view === "3"
        ? "grid grid-cols-3 gap-6"
        : "grid grid-cols-4 gap-6";

  return (
    <section
      className="w-full bg-white"
      style={{ fontFamily: "var(--font-family-base)" }}
    >
      {/* Title row: "Votra" bold, "Identity, 2025" lighter grey, + / collapse icon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white pb-4 sm:pb-6 lg:pb-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-black sm:text-base lg:text-base">
            Votra,
          </span>
          <span className="text-sm font-normal text-gray-600 sm:text-base lg:text-base">
            Identity, 2025
          </span>
          <button
            type="button"
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={() => setExpanded(!expanded)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-black text-black hover:opacity-70"
          >
            {expanded ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <line x1="2" y1="6" x2="10" y2="6" />
              </svg>
            ) : (
              <span className="text-lg leading-none">+</span>
            )}
          </button>
        </div>
        {!expanded && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="2 column grid"
              onClick={() => setView("2")}
              className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${
                view === "2"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
                aria-hidden
              >
                <rect x="1" y="1" width="5" height="12" rx="0.5" />
                <rect x="8" y="1" width="5" height="12" rx="0.5" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="3 column grid"
              onClick={() => setView("3")}
              className={`hidden h-8 w-8 items-center justify-center rounded transition-colors lg:flex ${
                view === "3"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
                aria-hidden
              >
                <rect x="1" y="1" width="3" height="12" rx="0.5" />
                <rect x="5.5" y="1" width="3" height="12" rx="0.5" />
                <rect x="10" y="1" width="3" height="12" rx="0.5" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="4 column grid"
              onClick={() => setView("4")}
              className={`hidden h-8 w-8 items-center justify-center rounded transition-colors lg:flex ${
                view === "4"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
                aria-hidden
              >
                <rect x="1" y="1" width="5" height="5" rx="0.5" />
                <rect x="8" y="1" width="5" height="5" rx="0.5" />
                <rect x="1" y="8" width="5" height="5" rx="0.5" />
                <rect x="8" y="8" width="5" height="5" rx="0.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Grid area: description overlays on top when expanded, with smooth transition */}
      <div className="relative">
        {/* Overlay: full width, content height, white bg, smooth transition */}
        <div
          className={`absolute top-0 left-0 right-0 z-10 w-full bg-white transition-all duration-300 ease-out ${
            expanded
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!expanded}
        >
          <p
            className={`max-w-[720px] py-4 text-left text-sm leading-relaxed text-black transition-all duration-300 ease-out sm:text-base ${
              expanded ? "translate-y-0" : "-translate-y-2"
            }`}
          >
            {VOTRA_DESCRIPTION}
          </p>
        </div>

        {/* Responsive grid: 2, 3, or 4 columns; gap between items; media max height 600px, aspect ratio preserved. */}
        <div className={`${gridClass} pt-4 grid-auto-rows-auto`}>
          {items.map((item) => (
            <ProjectBlock key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
