"use client";

import { useEffect, useRef, useState } from "react";

import { useInView } from "@/src/hooks/useInView";
import { ExpandableSection } from "@/src/components/PortfolioGallery/ExpandableSection";

export type GalleryItem = {
  id: string;
  label: string;
  showTm?: boolean;
  src?: string;
  aspectRatio?: number;
};

export type GalleryMode = "sections" | "flat";
export type GridView = "1" | "2" | "3" | "4" | "6";
type SectionGridView = "2" | "3" | "4";

export type GallerySection = {
  id: string;
  title: React.ReactNode;
  description?: string;
  items: GalleryItem[];
  defaultView?: SectionGridView;
};

function isVideoSrc(src: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(src);
}

/** Section 1: 3D work – 3 videos from public/videos. */
const SECTION_1_VIDEOS: GalleryItem[] = [
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
];

/** Section 2: Qbicle – images from public/images/qbicle. */
const SECTION_2_QBICLE_IMAGES: GalleryItem[] = [
  {
    id: "qb-4",
    label: "qbicle 4",
    src: "/images/qbicle/e88ecd164700707.63fb7be12e07e.jpg",
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
    id: "qb-7",
    label: "qbicle 7",
    src: "/images/qbicle/b1f91b164700707.63fb7be12f267.jpg",
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
];

const SECTION_1_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";

const SECTION_2_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.";

const DEFAULT_SECTIONS: GallerySection[] = [
  {
    id: "gallery-3d",
    title: <span className="text-[16px] font-bold text-black">3D</span>,
    description: SECTION_1_DESCRIPTION,
    items: SECTION_1_VIDEOS,
    defaultView: "3",
  },
  {
    id: "gallery-qbicle",
    title: (
      <span className="text-[16px] font-bold text-black">
        Qbicle Brand Identity and UI/UX
      </span>
    ),
    description: SECTION_2_DESCRIPTION,
    items: SECTION_2_QBICLE_IMAGES,
    defaultView: "3",
  },
];

function getGridClass(view: GridView) {
  switch (view) {
    case "1":
      return "grid grid-cols-1 gap-6";
    case "2":
      return "grid grid-cols-2 gap-6";
    case "3":
      return "grid grid-cols-3 gap-6";
    case "4":
      return "grid grid-cols-4 gap-6";
    case "6":
      return "grid grid-cols-6 gap-6";
    default:
      return "grid grid-cols-3 gap-6";
  }
}

function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);

    update();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    // Safari fallback
    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  return reducedMotion;
}

function ProjectBlock({
  item,
  reducedMotion,
}: {
  item: GalleryItem;
  reducedMotion: boolean;
}) {
  const mediaSrc = item.src;
  const isVideo = mediaSrc ? isVideoSrc(mediaSrc) : false;

  const { ref, inView, hasEntered } = useInView({
    rootMargin: "600px 0px",
    threshold: 0.01,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isVideo) return;
    if (!hasEntered) return;

    const video = videoRef.current;
    if (!video) return;

    if (reducedMotion) {
      video.pause();
      return;
    }

    if (inView) {
      void video.play().catch(() => {
        // Autoplay can be blocked by browser policy; we fail silently.
      });
    } else {
      video.pause();
    }
  }, [hasEntered, inView, isVideo, reducedMotion]);

  return (
    <article className="flex flex-col">
      <div
        ref={ref}
        className="w-full overflow-hidden max-h-[300px] bg-neutral-100"
        role={isVideo ? "application" : "img"}
        aria-label={item.label}
      >
        {mediaSrc && isVideo ? (
          <video
            ref={videoRef}
            src={hasEntered ? mediaSrc : undefined}
            className="block w-full h-auto max-h-[300px] object-contain bg-black"
            muted
            loop
            playsInline
            preload="none"
          />
        ) : mediaSrc ? (
          <img
            src={mediaSrc}
            alt={item.label}
            loading="lazy"
            decoding="async"
            className="block w-full h-auto max-h-[300px] object-contain"
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

function getDefaultSectionView(section: GallerySection): SectionGridView {
  return section.defaultView ?? "3";
}

function getViewIcon(view: GridView) {
  switch (view) {
    case "1":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="currentColor"
          aria-hidden
        >
          <rect x="1" y="1" width="12" height="12" rx="0.5" />
        </svg>
      );
    case "2":
      return (
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
      );
    case "3":
      return (
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
      );
    case "4":
      return (
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
      );
    case "6":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="currentColor"
          aria-hidden
        >
          <rect x="1" y="1" width="3" height="5" rx="0.5" />
          <rect x="5.5" y="1" width="3" height="5" rx="0.5" />
          <rect x="10" y="1" width="3" height="5" rx="0.5" />
          <rect x="1" y="8" width="3" height="5" rx="0.5" />
          <rect x="5.5" y="8" width="3" height="5" rx="0.5" />
          <rect x="10" y="8" width="3" height="5" rx="0.5" />
        </svg>
      );
    default:
      return null;
  }
}

function ViewToggleButton({
  label,
  value,
  activeValue,
  onClick,
  className = "flex h-8 w-8 items-center justify-center rounded transition-colors",
}: {
  label: string;
  value: GridView;
  activeValue: GridView;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`${className} ${
        activeValue === value
          ? "bg-black text-white"
          : "bg-gray-200 text-black hover:bg-gray-300"
      }`}
    >
      {getViewIcon(value)}
    </button>
  );
}

export default function PortfolioGallery({
  mode = "sections",
  sections = [],
  items = [],
}: {
  mode?: GalleryMode;
  sections?: GallerySection[];
  items?: GalleryItem[];
}) {
  const resolvedSections =
    sections.length > 0 ? sections : mode === "sections" ? DEFAULT_SECTIONS : [];
  const [sectionViews, setSectionViews] = useState<Record<string, GridView>>(() =>
    resolvedSections.reduce<Record<string, GridView>>((acc, section) => {
      acc[section.id] = getDefaultSectionView(section);
      return acc;
    }, {}),
  );
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    () =>
      resolvedSections.reduce<Record<string, boolean>>((acc, section) => {
        acc[section.id] = false;
        return acc;
      }, {}),
  );
  const [flatView, setFlatView] = useState<GridView>("1");
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      className="w-full bg-white"
      style={{ fontFamily: "var(--font-family-base)" }}
    >
      {mode === "flat" ? (
        <>
          <div className="flex items-center justify-end gap-1 pb-4">
            <ViewToggleButton
              label="1 column grid"
              value="1"
              activeValue={flatView}
              onClick={() => setFlatView("1")}
            />
            <ViewToggleButton
              label="6 column grid"
              value="6"
              activeValue={flatView}
              onClick={() => setFlatView("6")}
            />
          </div>
          <div className={`${getGridClass(flatView)} grid-auto-rows-auto pt-2`}>
            {items.map((item) => (
              <ProjectBlock
                key={item.id}
                item={item}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </>
      ) : (
        resolvedSections.map((section, index) => {
          const sectionView =
            sectionViews[section.id] === "2" ||
            sectionViews[section.id] === "3" ||
            sectionViews[section.id] === "4"
              ? sectionViews[section.id]
              : getDefaultSectionView(section);

          return (
            <div
              key={section.id}
              className={index === 0 ? "" : "pt-8 sm:pt-10 lg:pt-12"}
              style={index === 0 ? undefined : { paddingTop: "16px" }}
            >
              <ExpandableSection
                id={section.id}
                title={section.title}
                description={section.description ?? ""}
                expanded={expandedSections[section.id] ?? false}
                onToggle={() =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    [section.id]: !prev[section.id],
                  }))
                }
                titleTag="div"
                containerClassName=""
                headerClassName={index === 0 ? "bg-white" : "bg-white pb-1"}
                titleClassName=""
                descriptionPanelClassName="bg-white"
                renderHeader={({ titleNode, toggleButton }) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 bg-white"
                    style={{ paddingBottom: "16px" }}
                  >
                    <div className="flex items-center gap-2">
                      {titleNode}
                      {toggleButton}
                    </div>

                    <div className="flex items-center gap-1">
                      <ViewToggleButton
                        label="2 column grid"
                        value="2"
                        activeValue={sectionView}
                        onClick={() =>
                          setSectionViews((prev) => ({
                            ...prev,
                            [section.id]: "2",
                          }))
                        }
                      />
                      <ViewToggleButton
                        label="3 column grid"
                        value="3"
                        activeValue={sectionView}
                        onClick={() =>
                          setSectionViews((prev) => ({
                            ...prev,
                            [section.id]: "3",
                          }))
                        }
                        className="hidden h-8 w-8 items-center justify-center rounded transition-colors lg:flex"
                      />
                      <ViewToggleButton
                        label="4 column grid"
                        value="4"
                        activeValue={sectionView}
                        onClick={() =>
                          setSectionViews((prev) => ({
                            ...prev,
                            [section.id]: "4",
                          }))
                        }
                        className="hidden h-8 w-8 items-center justify-center rounded transition-colors lg:flex"
                      />
                    </div>
                  </div>
                )}
              >
                <div className={`${getGridClass(sectionView)} pt-2 grid-auto-rows-auto`}>
                  {section.items.map((item) => (
                    <ProjectBlock
                      key={item.id}
                      item={item}
                      reducedMotion={reducedMotion}
                    />
                  ))}
                </div>
              </ExpandableSection>
            </div>
          );
        })
      )}
    </section>
  );
}
