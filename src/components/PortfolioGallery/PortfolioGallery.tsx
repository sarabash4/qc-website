"use client";

import { useCallback, useMemo, useState } from "react";

/** Base height for one row unit (rowSpan 1). Row height = base × max(rowSpan in row). */
const BASE_ROW_HEIGHT_PX = 200;

export type GalleryItem = {
  id: string;
  label: string;
  showTm?: boolean;
  /** Image or video URL. Aspect ratio is measured on load and drives grid layout. */
  src?: string;
  /** Optional pre-set aspect ratio (width/height). Used until the media loads and overwrites it. */
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

/** Derive colSpan/rowSpan from aspect ratio (width/height). Wide = more cols, tall = more rows. */
function spanFromAspectRatio(aspectRatio: number): {
  colSpan: number;
  rowSpan: number;
} {
  const colSpan = aspectRatio >= 1.3 ? 2 : 1;
  const rowSpan = aspectRatio <= 0.75 ? 2 : 1;
  return { colSpan, rowSpan };
}

/** Pack items left-to-right; row height = tallest item in that row. Uses aspect ratios to derive spans. */
function computeGridLayout(
  columns: number,
  items: GalleryItem[],
  aspectRatios: Record<string, number>,
): {
  gridTemplateRows: string;
  placements: { gridRow: string; gridColumn: string }[];
} {
  const rows: {
    height: number;
    items: { index: number; col: number; colSpan: number; rowSpan: number }[];
  }[] = [];
  let currentRow = {
    height: 1,
    usedCols: 0,
    items: [] as {
      index: number;
      col: number;
      colSpan: number;
      rowSpan: number;
    }[],
  };

  items.forEach((item, index) => {
    const ratio = aspectRatios[item.id] ?? item.aspectRatio ?? 1;
    const { colSpan: rawColSpan, rowSpan } = spanFromAspectRatio(ratio);
    const colSpan = Math.min(rawColSpan, columns);
    if (currentRow.usedCols + colSpan > columns) {
      rows.push(currentRow);
      currentRow = { height: 1, usedCols: 0, items: [] };
    }
    currentRow.items.push({
      index,
      col: currentRow.usedCols,
      colSpan,
      rowSpan,
    });
    currentRow.usedCols += colSpan;
    currentRow.height = Math.max(currentRow.height, rowSpan);
  });
  rows.push(currentRow);

  const gridRowHeights: string[] = [];
  rows.forEach((r) => {
    for (let i = 0; i < r.height; i++) {
      gridRowHeights.push(`${BASE_ROW_HEIGHT_PX}px`);
    }
  });

  const placements: { gridRow: string; gridColumn: string }[] = [];
  let gridRowStart = 1;
  rows.forEach((r) => {
    r.items.forEach(({ index, col, colSpan, rowSpan: itemRowSpan }) => {
      placements[index] = {
        gridRow:
          itemRowSpan > 1
            ? `${gridRowStart} / span ${itemRowSpan}`
            : `${gridRowStart}`,
        gridColumn: colSpan > 1 ? `${col + 1} / span ${colSpan}` : `${col + 1}`,
      };
    });
    gridRowStart += r.height;
  });

  return {
    gridTemplateRows: gridRowHeights.join(" "),
    placements,
  };
}

const VOTRA_DESCRIPTION =
  "Collaborating on a visual identity for an experimental health-tech brand, focusing on technology, wellness, human emotion, refined sensitivity, and future-forward aesthetics. Objectives include creating a logo system, art direction, and immersive visuals.";

type GridCols = "1" | "2" | "3" | "4";

const COLUMN_COUNT: Record<GridCols, number> = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
};

function ProjectBlock({
  item,
  placement,
  onAspectRatio,
  compact,
}: {
  item: GalleryItem;
  placement: { gridRow: string; gridColumn: string };
  onAspectRatio?: (id: string, width: number, height: number) => void;
  compact?: boolean;
}) {
  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (img.naturalWidth && img.naturalHeight) {
        onAspectRatio?.(item.id, img.naturalWidth, img.naturalHeight);
      }
    },
    [item.id, onAspectRatio],
  );

  const handleVideoLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      if (video.videoWidth && video.videoHeight) {
        onAspectRatio?.(item.id, video.videoWidth, video.videoHeight);
      }
    },
    [item.id, onAspectRatio],
  );

  const mediaSrc = item.src;
  const isVideo = mediaSrc ? isVideoSrc(mediaSrc) : false;

  return (
    <article className="flex flex-col min-h-0 h-full" style={placement}>
      <div
        className={
          compact
            ? "aspect-square w-full overflow-hidden "
            : "min-h-0 flex-1 w-full overflow-hidden "
        }
        role={isVideo ? "application" : "img"}
        aria-label={item.label}
      >
        {mediaSrc && isVideo ? (
          <video
            src={mediaSrc}
            className="h-full w-full object-contain bg-black"
            muted
            loop
            playsInline
            autoPlay
            onLoadedMetadata={handleVideoLoadedMetadata}
          />
        ) : mediaSrc ? (
          <img
            src={mediaSrc}
            alt={item.label}
            className="h-full w-full object-cover"
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">
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
  const [view, setView] = useState<GridCols>("2");
  const [expanded, setExpanded] = useState(false);
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});

  const items = itemsProp ?? DEFAULT_ITEMS;
  const columns = COLUMN_COUNT[view];
  const layout = useMemo(
    () => computeGridLayout(columns, items, aspectRatios),
    [columns, items, aspectRatios],
  );

  const handleAspectRatio = useCallback(
    (id: string, width: number, height: number) => {
      const ratio = width / height;
      setAspectRatios((prev) =>
        prev[id] === ratio ? prev : { ...prev, [id]: ratio },
      );
    },
    [],
  );

  const gridClass =
    view === "1"
      ? "grid grid-cols-1 gap-[15px]"
      : view === "2"
        ? "grid grid-cols-2 gap-[15px]"
        : view === "3"
          ? "grid grid-cols-3 gap-[15px]"
          : "grid grid-cols-4 gap-[15px]";
  const gridStyle = {
    gridTemplateRows: layout.gridTemplateRows,
  };

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
            {/* Mobile: 1-grid and 2-grid only */}
            <button
              type="button"
              aria-label="1 column grid"
              onClick={() => setView("1")}
              className={`flex h-8 w-8 items-center justify-center rounded transition-colors lg:hidden ${
                view === "1"
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
                <rect x="1" y="1" width="12" height="12" rx="0.5" />
              </svg>
            </button>
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
            {/* Laptop: 3-grid and 4-grid (2-grid shown above) */}
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

        {/* Full grid: row height = tallest item in row; items wrap when they don't fit. Layout is driven by image aspect ratios. */}
        <div className={`${gridClass} pt-4`} style={gridStyle}>
          {items.map((item, i) => (
            <ProjectBlock
              key={item.id}
              item={item}
              placement={
                layout.placements[i] ?? { gridRow: "1", gridColumn: "1" }
              }
              onAspectRatio={handleAspectRatio}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
