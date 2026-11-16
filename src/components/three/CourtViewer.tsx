"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { CourtModel, type TimeOfDay } from "./CourtModel";
import type { ThreeTier } from "@/lib/three/gate";

/**
 * CourtViewer — interactive 3D court viewer (Rebuild Stage 2).
 *
 * Canvas R3F (frameloop="demand", DPR <= 2) + procedural CourtModel.
 * All controls are DOM buttons outside the canvas (keyboard-accessible):
 * Day/Night lighting, DOM zoom +/-, Reset, 2 hotspots (Surface + Glass).
 * No auto-rotate, no Upper/Main switcher, no Sunset preset (per plan).
 * Lighting changes only swap CourtModel props — the Canvas is never
 * remounted. Touch devices get a tap-to-activate overlay so page scroll
 * is never hijacked by the canvas before the user opts in.
 */

/** All viewer copy — filled by Courts.tsx (server) from messages, never hardcoded. */
export interface CourtViewerStrings {
  title: string;
  activate: string;
  day: string;
  night: string;
  lightingLabel: string;
  reset: string;
  zoomIn: string;
  zoomOut: string;
  hotspotSurface: string;
  hotspotSurfaceBody: string;
  hotspotGlass: string;
  hotspotGlassBody: string;
  close: string;
}

export interface CourtViewerProps {
  tier: ThreeTier;
  /** True while the tab is hidden or the viewer is out of the viewport. */
  paused: boolean;
  strings: CourtViewerStrings;
}

type Vec3 = [number, number, number];
type CameraView = { position: Vec3; target: Vec3 };

/** Court is 20 x 10 m; default view frames it from the corner.
 * POLISH 16 Nov 2026: kamera lama [16,10,16] fov 42 memotong sudut
 * dekat lapangan di bawah frame; [19,12,19] fov 46 malah terlalu jauh
 * (lapangan cuma ~45% frame, banyak ruang kosong). Tengahnya: [17.5,11,17.5]
 * fov 44 — lapangan utuh dengan margin, mengisi ~65% frame. */
const DEFAULT_VIEW: CameraView = {
  position: [17.5, 11, 17.5],
  target: [0, 0.8, 0],
};
/** Low close-up on the red turf. */
const SURFACE_VIEW: CameraView = {
  position: [7, 2.4, 9],
  target: [0, 0.4, 0],
};
/** Wide view of the back glass wall. */
const GLASS_VIEW: CameraView = {
  position: [-13, 5, 9],
  target: [0, 1.6, -5],
};

const MIN_DISTANCE = 7;
const MAX_DISTANCE = 34;

type Sisi3dDebug = {
  hero?: { tier: string; calls: number; triangles: number };
  viewer?: { tier: string; calls: number; triangles: number };
};

type ControlsHandle = ComponentRef<typeof OrbitControls>;
type HotspotId = "surface" | "glass";

const CHIP =
  "rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase transition-colors";
const CHIP_ON = "border-lime bg-lime text-jungle";
const CHIP_OFF = "border-sand/30 bg-jungle/55 text-sand hover:border-lime/60";

/**
 * Rig inside the Canvas: lerps the camera toward the active tween target
 * in useFrame (never sets the camera position directly), writes the
 * window.__sisi3d.viewer debug object, and registers invalidate() with the
 * parent so DOM buttons (zoom / reset / hotspot) can kick off one new
 * frame — with frameloop="demand" no frame renders without invalidate().
 * Also re-renders once when the lighting changes.
 */
function ViewerRig({
  tweenRef,
  controlsRef,
  invalidateRef,
  paused,
  tier,
  timeOfDay,
}: {
  tweenRef: { current: CameraView | null };
  controlsRef: { current: ControlsHandle | null };
  invalidateRef: { current: (() => void) | null };
  paused: boolean;
  tier: ThreeTier;
  timeOfDay: TimeOfDay;
}) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    invalidateRef.current = invalidate;
    return () => {
      invalidateRef.current = null;
    };
  }, [invalidate, invalidateRef]);

  // Lighting is a prop change only — re-render one frame, never remount.
  useEffect(() => {
    invalidate();
  }, [timeOfDay, invalidate]);

  useFrame((state, delta) => {
    const { calls, triangles } = gl.info.render;
    const w = window as unknown as { __sisi3d?: Sisi3dDebug };
    w.__sisi3d = {
      ...(w.__sisi3d ?? {}),
      viewer: { tier, calls, triangles },
    };

    if (paused) return;
    const tween = tweenRef.current;
    if (!tween) return;

    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 5);
    camera.position.x += (tween.position[0] - camera.position.x) * k;
    camera.position.y += (tween.position[1] - camera.position.y) * k;
    camera.position.z += (tween.position[2] - camera.position.z) * k;

    const controls = controlsRef.current;
    if (controls) {
      controls.target.x += (tween.target[0] - controls.target.x) * k;
      controls.target.y += (tween.target[1] - controls.target.y) * k;
      controls.target.z += (tween.target[2] - controls.target.z) * k;
      controls.update();
    }

    const posDone =
      Math.hypot(
        tween.position[0] - camera.position.x,
        tween.position[1] - camera.position.y,
        tween.position[2] - camera.position.z,
      ) < 0.05;
    const tgtDone = controls
      ? Math.hypot(
          tween.target[0] - controls.target.x,
          tween.target[1] - controls.target.y,
          tween.target[2] - controls.target.z,
        ) < 0.05
      : true;

    if (posDone && tgtDone) {
      camera.position.set(...tween.position);
      if (controls) {
        controls.target.set(...tween.target);
        controls.update();
      }
      tweenRef.current = null;
    } else {
      // Keep the demand loop alive only while the tween is running.
      state.invalidate();
    }
  });

  return null;
}

export default function CourtViewer({ tier, paused, strings }: CourtViewerProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [activeHotspot, setActiveHotspot] = useState<HotspotId | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  /** Touch only: canvas stays inert until the user taps the overlay. */
  const [active, setActive] = useState(false);
  const controlsRef = useRef<ControlsHandle | null>(null);
  const tweenRef = useRef<CameraView | null>(null);
  const invalidateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const goTo = useCallback((view: CameraView) => {
    tweenRef.current = view;
    invalidateRef.current?.();
  }, []);

  /** Dolly the camera along its view axis, clamped to [min, max] distance. */
  const zoomBy = useCallback((factor: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    tweenRef.current = null; // a manual zoom cancels any running tween
    const camera = controls.object;
    const t = controls.target;
    const dx = camera.position.x - t.x;
    const dy = camera.position.y - t.y;
    const dz = camera.position.z - t.z;
    const len = Math.hypot(dx, dy, dz);
    if (len === 0) return;
    const next = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, len * factor));
    const s = next / len;
    camera.position.set(t.x + dx * s, t.y + dy * s, t.z + dz * s);
    controls.update();
    invalidateRef.current?.();
  }, []);

  const handleHotspot = useCallback(
    (id: HotspotId) => {
      setActiveHotspot(id);
      goTo(id === "surface" ? SURFACE_VIEW : GLASS_VIEW);
    },
    [goTo],
  );

  const handleReset = useCallback(() => {
    setActiveHotspot(null);
    goTo(DEFAULT_VIEW);
  }, [goTo]);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-sand/20 bg-jungle sm:aspect-[16/10]">
        <div
          role="img"
          aria-label={strings.title}
          className={`absolute inset-0 ${isTouch && !active ? "pointer-events-none" : ""}`}
        >
          <Canvas
            dpr={tier === "lite" ? 1 : [1, 2]}
            frameloop="demand"
            camera={{
              position: DEFAULT_VIEW.position,
              fov: 44,
              near: 0.1,
              far: 300,
            }}
            gl={{ antialias: tier === "full", powerPreference: "high-performance" }}
          >
            {/* POLISH: bola parkir DI ATAS lapangan saat rest (di tengah
                sisi kanan, terbaca dari kamera default) — sebelumnya tidak
                ada bola di viewer, dan bola DOM hero yang melayang di
                langit di atas viewer sudah disembunyikan (HeroInteractive). */}
            <CourtModel
              timeOfDay={timeOfDay}
              showBall
              ballPosition={[5, 0.18, 2.5]}
            />
            <OrbitControls
              ref={controlsRef}
              makeDefault
              enablePan={false}
              enableZoom={false}
              minDistance={MIN_DISTANCE}
              maxDistance={MAX_DISTANCE}
              minPolarAngle={Math.PI * 0.1}
              maxPolarAngle={Math.PI * 0.495}
              target={DEFAULT_VIEW.target}
              onStart={() => {
                // A manual drag cancels any running camera tween.
                tweenRef.current = null;
              }}
            />
            <ViewerRig
              tweenRef={tweenRef}
              controlsRef={controlsRef}
              invalidateRef={invalidateRef}
              paused={paused}
              tier={tier}
              timeOfDay={timeOfDay}
            />
          </Canvas>
        </div>

        {/* Touch only: tap-to-activate overlay. Before activation the canvas
            wrapper has pointer-events:none, so page scroll works on phones. */}
        {isTouch && !active && (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="absolute inset-0 z-10 flex items-center justify-center bg-jungle/65 px-6 text-center"
          >
            <span className="rounded-full border border-lime/60 bg-jungle/80 px-5 py-3 text-xs font-semibold tracking-[0.16em] text-lime uppercase">
              {strings.activate}
            </span>
          </button>
        )}
        {isTouch && active && (
          <button
            type="button"
            onClick={() => setActive(false)}
            aria-label={strings.close}
            className="absolute top-3 right-3 z-10 rounded-full border border-sand/30 bg-jungle/80 px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-sand uppercase"
          >
            {strings.close}
          </button>
        )}
      </div>

      {/* DOM toolbar — all controls live outside the canvas. */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label={strings.lightingLabel}
          className="flex items-center gap-2"
        >
          <span className="text-xs font-semibold tracking-[0.16em] text-sand/70 uppercase">
            {strings.lightingLabel}
          </span>
          <button
            type="button"
            aria-pressed={timeOfDay === "day"}
            onClick={() => setTimeOfDay("day")}
            className={`${CHIP} ${timeOfDay === "day" ? CHIP_ON : CHIP_OFF}`}
          >
            {strings.day}
          </button>
          <button
            type="button"
            aria-pressed={timeOfDay === "night"}
            onClick={() => setTimeOfDay("night")}
            className={`${CHIP} ${timeOfDay === "night" ? CHIP_ON : CHIP_OFF}`}
          >
            {strings.night}
          </button>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => zoomBy(1.25)}
            aria-label={strings.zoomOut}
            title={strings.zoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-sand/30 bg-jungle/55 text-lg leading-none text-sand transition-colors hover:border-lime/60"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => zoomBy(0.8)}
            aria-label={strings.zoomIn}
            title={strings.zoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-sand/30 bg-jungle/55 text-lg leading-none text-sand transition-colors hover:border-lime/60"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleReset}
            className={`${CHIP} ${CHIP_OFF}`}
          >
            {strings.reset}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={activeHotspot === "surface"}
          onClick={() => handleHotspot("surface")}
          className={`${CHIP} ${activeHotspot === "surface" ? CHIP_ON : CHIP_OFF}`}
        >
          {strings.hotspotSurface}
        </button>
        <button
          type="button"
          aria-pressed={activeHotspot === "glass"}
          onClick={() => handleHotspot("glass")}
          className={`${CHIP} ${activeHotspot === "glass" ? CHIP_ON : CHIP_OFF}`}
        >
          {strings.hotspotGlass}
        </button>
      </div>

      {activeHotspot && (
        <div className="mt-4 rounded-2xl border border-sand/20 bg-jungle/55 p-5">
          <div className="flex items-start justify-between gap-4">
            <h4 className="font-display text-2xl font-bold">
              {activeHotspot === "surface"
                ? strings.hotspotSurface
                : strings.hotspotGlass}
            </h4>
            <button
              type="button"
              onClick={() => setActiveHotspot(null)}
              aria-label={strings.close}
              className="shrink-0 rounded-full border border-sand/30 px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-sand uppercase transition-colors hover:border-lime/60"
            >
              {strings.close}
            </button>
          </div>
          <p className="mt-2 text-sm text-sand/85">
            {activeHotspot === "surface"
              ? strings.hotspotSurfaceBody
              : strings.hotspotGlassBody}
          </p>
        </div>
      )}
    </div>
  );
}
