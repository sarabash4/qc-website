"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Vec2 = { x: number; y: number };

type Segment = {
  active: boolean;
  x: number;
  y: number;
  bornAt: number;
  lifeMs: number;
  srcIndex: number;
  appliedSrcIndex: number;
  rotationDeg: number;
};

const DEFAULT_IMAGES = [
  "/images/qbicle/0bb1ab164700707.63fb7be1302e7.jpg",
  "/images/qbicle/b1f91b164700707.63fb7be12f267.jpg",
  "/images/qbicle/b78afe164700707.63fb7be12afd1.jpg",
  "/images/qbicle/c58d35164700707.63fb7be132398.jpg",
  "/images/qbicle/caa804164700707.63fb7be1313e9.jpg",
  "/images/qbicle/d54369164700707.63fb7be12c17b.jpg",
  "/images/qbicle/e88ecd164700707.63fb7be12e07e.jpg",
];

// -----------------------------
// Tuning constants (premium feel)
// -----------------------------
const MAX_ITEMS = 18;

const IMAGE_W = 150;
const IMAGE_H = 200;

// Spacing is computed from image size so it stays visually cohesive if you change IMAGE_W/H.
// Desired gap between images (edge-to-edge, approximately).
// Internally we space by center-to-center distance ≈ min(IMAGE_W, IMAGE_H) + EDGE_GAP_PX.
const EDGE_GAP_PX = 20;
const SPACING_MIN_PX = 10;
const SPACING_MAX_PX = 600;

// Pointer smoothing (higher = more responsive). Uses dt-based exponential smoothing.
const POINTER_SMOOTH_HZ = 18;

// How strongly each older segment eases toward the segment ahead (higher = tighter cohesion).
const FOLLOW_HZ = 26;

// Ignore ultra-tiny movement to prevent micro-jitter noise.
const MICRO_MOVE_PX = 0.35;

// Lifetime controls the ribbon length / persistence.
const LIFETIME_MS = 980;

// Visual styling tweaks.
const ROTATE_RANDOM_DEG = 2.25;
const ROTATE_FROM_VELOCITY = 0.0016; // deg per (px/s) applied on spawn
const ROTATE_MAX_DEG = 6;

const SCALE_END = 0.92;
const DEPTH_SCALE = 0.06; // newer items slightly larger (parallax feel)
const SPEED_FOR_MAX_BREATH = 1400; // px/s
const SPEED_BREATH_SCALE = 0.035;

// Spawn (materialize) animation: cinematic unfold + soft fade-in.
// Computed inside RAF (no CSS transitions) and multiplies with end-of-life fade-out.
const SPAWN_DURATION_MS = 240;
const SPAWN_SCALE_FROM = 0.7;
const SPAWN_OPACITY_MAX = 0.9;

const BASE_Z_INDEX = 1000;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function clamp(min: number, n: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function easeOutCubic(t: number) {
  const u = 1 - t;
  return 1 - u * u * u;
}

function easeInQuad(t: number) {
  return t * t;
}

function smoothingAlpha(hz: number, dtSec: number) {
  // If no time has passed (or dt is invalid), do not snap.
  if (!(dtSec > 0) || !Number.isFinite(dtSec)) return 0;
  return 1 - Math.exp(-hz * dtSec);
}

function spacingPxFromImageSize() {
  const base = Math.min(IMAGE_W, IMAGE_H);
  return clamp(SPACING_MIN_PX, base + EDGE_GAP_PX, SPACING_MAX_PX);
}

export default function CursorImageTrail() {
  const images = useMemo(() => DEFAULT_IMAGES, []);

  const imgElsRef = useRef<(HTMLImageElement | null)[]>([]);
  const segmentsRef = useRef<Segment[]>([]);
  const headRef = useRef<number>(-1);

  const emitCarryRef = useRef<number>(0);
  const targetRef = useRef<Vec2>({ x: 0, y: 0 });
  const smoothRef = useRef<Vec2>({ x: 0, y: 0 });
  const emitFromRef = useRef<Vec2>({ x: 0, y: 0 });
  const hasPointerRef = useRef<boolean>(false);

  const velocityRef = useRef<Vec2>({ x: 0, y: 0 });
  const lastSmoothRef = useRef<Vec2>({ x: 0, y: 0 });
  const srcCursorRef = useRef<number>(0);

  const rafRef = useRef<number | null>(null);
  const lastNowRef = useRef<number>(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media =
      typeof window !== "undefined"
        ? window.matchMedia("(pointer: fine) and (hover: hover)")
        : null;

    const updateIsDesktop = () => {
      setIsDesktop(Boolean(media?.matches));
    };

    updateIsDesktop();
    media?.addEventListener?.("change", updateIsDesktop);

    return () => {
      media?.removeEventListener?.("change", updateIsDesktop);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    document.body.classList.add("cursor-none");
    return () => {
      document.body.classList.remove("cursor-none");
    };
  }, [images, isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    // Preload to avoid hitching on first spawns.
    for (const src of images) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    }
  }, [images, isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    if (segmentsRef.current.length !== MAX_ITEMS) {
      segmentsRef.current = Array.from({ length: MAX_ITEMS }, () => ({
        active: false,
        x: -9999,
        y: -9999,
        bornAt: 0,
        lifeMs: LIFETIME_MS,
        srcIndex: 0,
        appliedSrcIndex: -1,
        rotationDeg: 0,
      }));
      headRef.current = -1;
      emitCarryRef.current = 0;
      hasPointerRef.current = false;
      lastNowRef.current = 0;
      srcCursorRef.current = Math.floor(Math.random() * images.length);
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;

      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;

      if (!hasPointerRef.current) {
        hasPointerRef.current = true;
        emitCarryRef.current = 0;
        smoothRef.current.x = e.clientX;
        smoothRef.current.y = e.clientY;
        lastSmoothRef.current.x = e.clientX;
        lastSmoothRef.current.y = e.clientY;
        emitFromRef.current.x = e.clientX;
        emitFromRef.current.y = e.clientY;
        velocityRef.current.x = 0;
        velocityRef.current.y = 0;
        // Warm-start RAF timing to avoid a big first dt-driven update.
        lastNowRef.current = performance.now();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [images, isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    const segmentSpacingPx = spacingPxFromImageSize();
    const VELOCITY_SMOOTH_HZ = 22;
    const DT_SMOOTH_MAX = 1 / 30;
    const DT_VELOCITY_MAX = 1 / 45;

    const spawnAt = (x: number, y: number, now: number) => {
      const next = (headRef.current + 1) % MAX_ITEMS;
      headRef.current = next;

      const seg = segmentsRef.current[next]!;
      seg.active = true;
      seg.x = x;
      seg.y = y;
      seg.bornAt = now;
      seg.lifeMs = LIFETIME_MS;

      srcCursorRef.current = (srcCursorRef.current + 1) % images.length;
      seg.srcIndex = srcCursorRef.current;
      seg.appliedSrcIndex = -1;

      const v = velocityRef.current;
      const tilt =
        clamp(
          -ROTATE_MAX_DEG,
          (v.y + v.x * 0.25) * ROTATE_FROM_VELOCITY,
          ROTATE_MAX_DEG,
        ) + rand(-ROTATE_RANDOM_DEG, ROTATE_RANDOM_DEG);
      seg.rotationDeg = clamp(-ROTATE_MAX_DEG, tilt, ROTATE_MAX_DEG);
    };

    const tick = (now: number) => {
      const lastNow = lastNowRef.current;
      let dt = lastNow > 0 ? (now - lastNow) / 1000 : 0;
      lastNowRef.current = now;

      // Clamp huge deltas (tab switch) to avoid big jumps.
      dt = Math.min(dt, 0.05);
      // If we don't have a meaningful dt yet, skip updates this frame to avoid snapping.
      if (!(dt > 0)) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      if (hasPointerRef.current) {
        const target = targetRef.current;
        const smooth = smoothRef.current;

        const dtSmooth = Math.min(dt, DT_SMOOTH_MAX);
        const a = smoothingAlpha(POINTER_SMOOTH_HZ, dtSmooth);
        smooth.x += (target.x - smooth.x) * a;
        smooth.y += (target.y - smooth.y) * a;

        // Ensure the trail appears immediately on first movement.
        if (headRef.current < 0) {
          emitFromRef.current.x = smooth.x;
          emitFromRef.current.y = smooth.y;
          spawnAt(smooth.x, smooth.y, now);
        }

        if (dt > 0) {
          const ls = lastSmoothRef.current;
          const dtVel = Math.min(dt, DT_VELOCITY_MAX);
          const vx = (smooth.x - ls.x) / dtVel;
          const vy = (smooth.y - ls.y) / dtVel;
          // Light velocity smoothing to avoid noisy direction flips.
          const va = smoothingAlpha(VELOCITY_SMOOTH_HZ, dtSmooth);
          velocityRef.current.x += (vx - velocityRef.current.x) * va;
          velocityRef.current.y += (vy - velocityRef.current.y) * va;
          ls.x = smooth.x;
          ls.y = smooth.y;
        }

        let carry = emitCarryRef.current;
        // Distance-based emission along the smoothed cursor path.
        const from = emitFromRef.current;
        const dx0 = smooth.x - from.x;
        const dy0 = smooth.y - from.y;
        const dist0 = Math.hypot(dx0, dy0);

        if (dist0 > MICRO_MOVE_PX) {
          let dx = dx0;
          let dy = dy0;
          let dist = dist0;

          // Emit 1..N segments to maintain consistent spacing even on fast moves.
          while (dist >= segmentSpacingPx) {
            const inv = 1 / dist;
            carry = 0;
            const ux = dx * inv;
            const uy = dy * inv;

            from.x += ux * segmentSpacingPx;
            from.y += uy * segmentSpacingPx;

            spawnAt(from.x, from.y, now);

            dx = smooth.x - from.x;
            dy = smooth.y - from.y;
            dist = Math.hypot(dx, dy);

            if (dist <= MICRO_MOVE_PX) break;
          }

          // Carry the remainder so we don't burst on small initial moves.
          emitCarryRef.current = carry + dist;
        }
      }

      // Cohesion pass: each older segment follows the segment ahead while
      // maintaining a target spacing (prevents spacing compression).
      const followA = smoothingAlpha(FOLLOW_HZ, Math.min(dt, DT_SMOOTH_MAX));
      const head = headRef.current;
      if (head >= 0 && followA > 0) {
        for (let i = 1; i < MAX_ITEMS; i++) {
          const idx = (head - i + MAX_ITEMS) % MAX_ITEMS;
          const nextIdx = (head - (i - 1) + MAX_ITEMS) % MAX_ITEMS;
          const seg = segmentsRef.current[idx]!;
          const next = segmentsRef.current[nextIdx]!;
          if (!seg.active || !next.active) continue;

          const dx = seg.x - next.x;
          const dy = seg.y - next.y;
          const d = Math.hypot(dx, dy);
          if (d > 0.0001) {
            const ux = dx / d;
            const uy = dy / d;
            const tx = next.x + ux * segmentSpacingPx;
            const ty = next.y + uy * segmentSpacingPx;
            seg.x += (tx - seg.x) * followA;
            seg.y += (ty - seg.y) * followA;
          } else {
            // If two segments coincide, push it back along current velocity.
            const v = velocityRef.current;
            const vd = Math.hypot(v.x, v.y);
            const ux = vd > 0.0001 ? -v.x / vd : -1;
            const uy = vd > 0.0001 ? -v.y / vd : 0;
            const tx = next.x + ux * segmentSpacingPx;
            const ty = next.y + uy * segmentSpacingPx;
            seg.x += (tx - seg.x) * followA;
            seg.y += (ty - seg.y) * followA;
          }
        }
      }

      // Apply DOM writes in newest->oldest order to keep z layering intentional.
      if (head >= 0) {
        const v = velocityRef.current;
        const speed = Math.hypot(v.x, v.y);
        const speedT = clamp01(speed / SPEED_FOR_MAX_BREATH);

        for (let i = 0; i < MAX_ITEMS; i++) {
          const idx = (head - i + MAX_ITEMS) % MAX_ITEMS;
          const seg = segmentsRef.current[idx]!;
          const el = imgElsRef.current[idx];
          if (!el) continue;

          if (!seg.active) {
            el.style.opacity = "0";
            continue;
          }

          const t = clamp01((now - seg.bornAt) / seg.lifeMs);
          if (t >= 1) {
            seg.active = false;
            el.style.opacity = "0";
            continue;
          }

          if (seg.appliedSrcIndex !== seg.srcIndex) {
            el.src = images[seg.srcIndex]!;
            seg.appliedSrcIndex = seg.srcIndex;
          }

          // Spawn materialize (early lifetime) + end-of-life fade-out (late lifetime).
          const spawnT = clamp01((now - seg.bornAt) / SPAWN_DURATION_MS);
          const spawnEase = easeOutCubic(spawnT);
          const fadeOut = 1 - easeInQuad(t);
          const opacity = SPAWN_OPACITY_MAX * spawnEase * fadeOut;

          const ageEase = easeOutCubic(t);
          const baseScale = lerp(1, SCALE_END, ageEase);
          const depth = 1 + DEPTH_SCALE * (1 - i / Math.max(1, MAX_ITEMS - 1));
          const breathe = 1 + SPEED_BREATH_SCALE * speedT * (1 - t);
          const scale = baseScale * depth * breathe;

          el.style.opacity = opacity.toFixed(4);
          el.style.zIndex = String(BASE_Z_INDEX + (MAX_ITEMS - i));
          const spawnScale = lerp(SPAWN_SCALE_FROM, 1, spawnEase);
          const sx = scale * spawnScale;
          const sy = scale * spawnScale;
          const rot = seg.rotationDeg * spawnEase;
          el.style.transform = `translate3d(${seg.x}px, ${seg.y}px, 0) translate(-50%, -50%) rotate(${rot}deg) scale3d(${sx}, ${sy}, 1)`;
        }
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [images, isDesktop]);

  if (!isDesktop) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={{ contain: "layout style paint" }}
    >
      {Array.from({ length: MAX_ITEMS }).map((_, i) => (
        <img
          // Stable pool: we reuse DOM nodes (no mount/unmount) for smooth 60fps.
          key={i}
          ref={(node) => {
            imgElsRef.current[i] = node;
          }}
          src={images[0]}
          alt=""
          width={IMAGE_W}
          height={IMAGE_H}
          draggable={false}
          decoding="async"
          style={{ width: IMAGE_W, height: IMAGE_H, zIndex: BASE_Z_INDEX + i }}
          className="fixed left-0 top-0 h-[120px] w-[100px] select-none rounded-md opacity-0 object-cover shadow-[0_12px_40px_rgba(0,0,0,0.55)] will-change-[transform,opacity]"
        />
      ))}
    </div>
  );
}
