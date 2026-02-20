"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useInView } from "@/src/hooks/useInView";

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

type GridView = "2" | "3" | "4";

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

export default function PortfolioGallery() {
  const [view, setView] = useState<GridView>("2");
  const [expanded1, setExpanded1] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

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
      {/* Section 1: 3D – title, expand, grid toggles, 3 videos */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white pb-4 sm:pb-6 lg:pb-8">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-bold text-black">3D</span>
            <button
              type="button"
              aria-label={expanded1 ? "Collapse" : "Expand"}
              onClick={(e) => {
                e.preventDefault();
                setExpanded1((prev) => !prev);
              }}
              className="flex h-8 w-8 min-h-8 min-w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded text-black transition-colors hover:bg-black/5 active:bg-black/10 [&_img]:hover:opacity-80 [&_img]:active:opacity-90"
            >
              <Image
                src={expanded1 ? "/icons/minus.svg" : "/icons/plus.svg"}
                alt=""
                width={16}
                height={16}
                className="w-4 h-4 select-none object-contain pointer-events-none"
                aria-hidden
              />
            </button>
          </div>
          {!expanded1 && (
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

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            expanded1 ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!expanded1}
        >
          <p className="max-w-[720px] pb-4 text-left text-[16px] tracking-[-0.02em] leading-[120%] text-black">
            {SECTION_1_DESCRIPTION}
          </p>
        </div>

        <div className={`${gridClass} pt-4 grid-auto-rows-auto`}>
          {SECTION_1_VIDEOS.map((item) => (
            <ProjectBlock
              key={item.id}
              item={item}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>

      {/* Section 2: Qbicle Brand Identity and UI/UX – title + icon, description overlay, qbicle images */}
      <div className="pt-8 sm:pt-10 lg:pt-12">
        <div className="flex flex-wrap items-center gap-3 bg-white pb-4 sm:pb-6 lg:pb-6">
          <h2 className="text-[16px] font-bold text-black">
            Qbicle Brand Identity and UI/UX
          </h2>
          <button
            type="button"
            aria-label={expanded2 ? "Collapse" : "Expand"}
            onClick={() => setExpanded2(!expanded2)}
            className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-black hover:opacity-70 cursor-pointer"
          >
            <Image
              src={expanded2 ? "/icons/minus.svg" : "/icons/plus.svg"}
              alt=""
              width={16}
              height={16}
              className="w-4 h-4 object-contain transition-opacity duration-200 ease-out"
              aria-hidden
            />
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            expanded2 ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!expanded2}
        >
          <p className="max-w-[720px] pb-4 text-left text-[16px] tracking-[-0.02em] leading-[120%] text-black">
            {SECTION_2_DESCRIPTION}
          </p>
        </div>

        <div className={`${gridClass} grid-auto-rows-auto pt-4`}>
          {SECTION_2_QBICLE_IMAGES.map((item) => (
            <ProjectBlock
              key={item.id}
              item={item}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
