"use client";

/**
 * HeroCourt3D — Stage 2 hero 3D layer (R3F, dynamic ssr:false).
 *
 * Mounted by HeroInteractive (client) inside #hero via portal, as an
 * absolute layer ABOVE the 2D frame-sequence canvas (#hero-canvas) and
 * BELOW the z-20 headline/CTA content. The 2D sequence stays as the
 * poster / fallback / LCP — this layer only crossfades in on top of it.
 *
 * Contract (docs/rebuild-stage-2-plan.md):
 * - Canvas R3F: dpr [1,2] (1 di lite), frameloop="demand".
 * - Scene = CourtModel prosedural (shared dengan viewer) + bola 3D
 *   sendiri (sphere lime + seam torus) yang menggelinding di baseline
 *   mengikuti scroll progress — CourtModel dipanggil showBall={false}
 *   supaya bola tidak dobel dan posisinya bisa dikontrol lewat ref
 *   tanpa re-render React tiap frame scroll.
 * - Kamera mengikuti scroll via waypoint CatmullRom; posisi kamera
 *   di-LERP menuju target di useFrame (jangan pernah set langsung di
 *   onUpdate ScrollTrigger). Satu-satunya input scroll adalah
 *   heroScroll.t yang ditulis ScrollTrigger hero di HeroInteractive.
 * - Intro (hanya jika !reducedMotion + tier full/lite — gate sudah
 *   memastikan komponen ini tidak di-mount kalau tidak lolos):
 *   tween intro.t -0.06 → 0 selama ~2,75 dtk (GSAP) + bola jatuh
 *   SATU KALI lalu diam; setelah itu parkir di scroll 0. TIDAK
 *   menganimasikan scroll halaman.
 * - Pause (prop `paused`): membekukan tween intro + pantulan bola.
 *   Kamera ikut scroll + bola gelinding tetap jalan (user-driven).
 * - Debug: window.__sisi3d.hero = { tier, calls, triangles } tiap frame.
 */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { CourtModel } from "./CourtModel";
import type { HeroScrollState, ThreeTier } from "@/lib/three/gate";

/** Lapangan 20×10 m, pusat di origin. Baseline belakang di x ≈ -9,2. */
const BALL_R = 0.18;
const BASELINE_X = -9.2;
const BASELINE_Z_MIN = -4;
const BASELINE_Z_MAX = 4;

/** Waypoint kamera (golden hour, orbit mengelilingi lapangan). */
const CAMERA_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(13, 5.5, 15),
  new THREE.Vector3(9, 3.5, -13),
  new THREE.Vector3(-11, 4.5, -11),
  new THREE.Vector3(-15, 6.5, 12),
]);
/** Posisi kamera sebelum intro (dolly masuk dari agak jauh/tinggi). */
const CAMERA_PRESTART = new THREE.Vector3(17, 8, 20);
const LOOK_AT = new THREE.Vector3(0, 1, 0);

/**
 * POLISH 16 Nov 2026 — framing mobile: di layar sempit (aspek < 0.9,
 * mis. 375×800) FOV 45 membuat lapangan terpotong dan kamera terasa
 * terlalu rendah/dekat, separuh bawah layar hitam. Di layar sempit:
 * FOV 58 + waypoint ditarik menjauh (x/z ×1.45, y ×1.3) supaya lapangan
 * terbaca penuh. Desktop tidak berubah.
 */
const NARROW_ASPECT = 0.9;
const NARROW_FOV = 58;
const WIDE_FOV = 45;
const NARROW_PATH_SCALE = 1.45;
const NARROW_PATH_LIFT = 1.3;

/**
 * Tinggi bola selama intro. blend 0 → 1 mengikuti tween intro.t
 * (-0.06 → 0): jatuh dari 2,4 m (ease-in), SATU pantulan, lalu diam
 * di 0,18 m. Setelah blend >= 0,8 bola sudah parkir.
 */
function introBallY(blend: number): number {
  if (blend >= 0.8) return BALL_R;
  if (blend < 0.55) {
    const p = blend / 0.55;
    return 2.4 - (2.4 - BALL_R) * p * p;
  }
  const p = (blend - 0.55) / 0.25;
  return BALL_R + 0.55 * Math.sin(p * Math.PI);
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function HeroRig({
  heroScroll,
  tier,
  paused,
  onFirstFrame,
}: {
  heroScroll: HeroScrollState;
  tier: ThreeTier;
  paused: boolean;
  onFirstFrame?: () => void;
}) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);

  // --- Kamera responsif: layar sempit = FOV lebar + waypoint menjauh ---
  const isNarrow = size.width / size.height < NARROW_ASPECT;
  const cameraPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        CAMERA_PATH.points.map(
          (p) =>
            new THREE.Vector3(
              p.x * (isNarrow ? NARROW_PATH_SCALE : 1),
              p.y * (isNarrow ? NARROW_PATH_LIFT : 1),
              p.z * (isNarrow ? NARROW_PATH_SCALE : 1),
            ),
        ),
      ),
    [isNarrow],
  );
  const cameraPrestart = useMemo(
    () =>
      new THREE.Vector3(
        CAMERA_PRESTART.x * (isNarrow ? NARROW_PATH_SCALE : 1),
        CAMERA_PRESTART.y * (isNarrow ? NARROW_PATH_LIFT : 1),
        CAMERA_PRESTART.z * (isNarrow ? NARROW_PATH_SCALE : 1),
      ),
    [isNarrow],
  );
  // FOV ikut aspek (frameloop demand: invalidate setelah ubah proyeksi).
  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const nextFov = isNarrow ? NARROW_FOV : WIDE_FOV;
    if (persp.fov !== nextFov) {
      persp.fov = nextFov;
      persp.updateProjectionMatrix();
      invalidate();
    }
  }, [isNarrow, camera, invalidate]);

  const ballRef = useRef<THREE.Group>(null);
  const prevBallZ = useRef(BASELINE_Z_MIN);
  /** Intro progress: tween GSAP -0.06 → 0 (lihat kontrak plan). */
  const intro = useRef({ t: -0.06 });
  const introTween = useRef<gsap.core.Tween | null>(null);
  const introDone = useRef(false);
  const firstFrameSent = useRef(false);
  const onFirstFrameRef = useRef(onFirstFrame);
  const tmpTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    onFirstFrameRef.current = onFirstFrame;
  }, [onFirstFrame]);

  // frameloop="demand": satu-satunya jalan render ulang adalah
  // invalidate() — daftarkan ke shared ref supaya ScrollTrigger hero
  // (HeroInteractive) bisa memicunya tanpa listener scroll tambahan.
  useEffect(() => {
    heroScroll.invalidate = () => invalidate();
    return () => {
      heroScroll.invalidate = undefined;
    };
  }, [heroScroll, invalidate]);

  // Intro: tween -0.06 → 0, ~2,75 dtk. Tiap tick invalidate supaya
  // frameloop demand tetap jalan selama intro.
  useEffect(() => {
    introTween.current = gsap.to(intro.current, {
      t: 0,
      duration: 2.75,
      ease: "power2.out",
      onUpdate: () => heroScroll.invalidate?.(),
      onComplete: () => {
        introDone.current = true;
        heroScroll.invalidate?.();
      },
    });
    return () => {
      introTween.current?.kill();
      introTween.current = null;
    };
  }, [heroScroll]);

  // Pause = bekukan tween intro (bola ikut beku di udara kalau intro
  // belum selesai). Resume = lanjutkan tween.
  useEffect(() => {
    introTween.current?.paused(paused);
    if (!paused) heroScroll.invalidate?.();
  }, [paused, heroScroll]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = THREE.MathUtils.clamp(heroScroll.t, 0, 1);

    // --- Kamera: lerp menuju waypoint untuk t (jangan set langsung) ---
    const target = cameraPath.getPoint(t, tmpTarget.current);
    if (!introDone.current) {
      // Selama intro, kamera dolly dari PRESTART ke waypoint t.
      // blend 0 → 1 dipetakan dari tween intro.t (-0.06 → 0).
      const blend = THREE.MathUtils.clamp(1 + intro.current.t / 0.06, 0, 1);
      camera.position.lerpVectors(cameraPrestart, target, easeOutCubic(blend));
    } else {
      camera.position.lerp(target, 1 - Math.exp(-dt * 5));
    }
    camera.lookAt(LOOK_AT);

    // --- Bola: gelinding di baseline mengikuti t (pola Alcaraz) ---
    const ball = ballRef.current;
    if (ball) {
      const z = BASELINE_Z_MIN + (BASELINE_Z_MAX - BASELINE_Z_MIN) * t;
      const dz = z - prevBallZ.current;
      prevBallZ.current = z;
      // Gelinding sepanjang sumbu z → rotasi di sumbu x.
      ball.rotation.x += dz / BALL_R;
      const blend = introDone.current
        ? 1
        : THREE.MathUtils.clamp(1 + intro.current.t / 0.06, 0, 1);
      ball.position.set(BASELINE_X, introBallY(blend), z);
    }

    // --- Debug untuk verifikasi pusat ---
    const w = window as unknown as { __sisi3d?: Record<string, unknown> };
    w.__sisi3d = {
      ...(w.__sisi3d ?? {}),
      hero: {
        tier,
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      },
    };

    // Frame pertama selesai dirender (rAF berikutnya = sudah ter-paint)
    // → parent boleh mulai crossfade 600 ms.
    if (!firstFrameSent.current) {
      firstFrameSent.current = true;
      requestAnimationFrame(() => onFirstFrameRef.current?.());
    }
  });

  return (
    <>
      {/* CourtModel self-contained: langit golden hour + fog + ground
          termasuk di dalam (kontrak plan). */}
      <CourtModel variant="main" timeOfDay="day" showBall={false} />
      {/* Bola hero: kontrol penuh via ref (gelinding + pantulan intro).
          CourtModel TIDAK merender bola (showBall={false}) supaya tidak
          dobel. */}
      <group ref={ballRef} position={[BASELINE_X, BALL_R, BASELINE_Z_MIN]}>
        <mesh castShadow>
          <sphereGeometry args={[BALL_R, 24, 24]} />
          <meshStandardMaterial color="#D9FF3F" roughness={0.55} />
        </mesh>
        {/* Seam putih (torus tipis melingkari bola). */}
        <mesh>
          <torusGeometry args={[BALL_R, 0.012, 8, 32]} />
          <meshStandardMaterial color="#F3EFE6" roughness={0.5} />
        </mesh>
      </group>
    </>
  );
}

export default function HeroCourt3D({
  heroScroll,
  tier,
  paused,
  onFirstFrame,
  onContextLost,
  onContextRestored,
}: {
  heroScroll: HeroScrollState;
  tier: ThreeTier;
  paused: boolean;
  onFirstFrame?: () => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}) {
  const onContextLostRef = useRef(onContextLost);
  const onContextRestoredRef = useRef(onContextRestored);

  useEffect(() => {
    onContextLostRef.current = onContextLost;
  }, [onContextLost]);
  useEffect(() => {
    onContextRestoredRef.current = onContextRestored;
  }, [onContextRestored]);

  return (
    <Canvas
      dpr={tier === "lite" ? 1 : [1, 2]}
      frameloop="demand"
      shadows={tier === "full"}
      camera={{ fov: 45, near: 0.1, far: 220, position: [13, 5.5, 15] }}
      gl={{
        antialias: tier === "full",
        powerPreference: "high-performance",
        alpha: false,
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          // Cegah default (yang mematikan canvas) supaya R3F bisa restore.
          e.preventDefault();
          onContextLostRef.current?.();
        });
        gl.domElement.addEventListener("webglcontextrestored", () => {
          // Minta satu frame baru begitu konteks pulih, lalu parent
          // boleh crossfade lagi ke 3D.
          heroScroll.invalidate?.();
          onContextRestoredRef.current?.();
        });
      }}
      style={{ height: "100%", width: "100%" }}
    >
      <HeroRig
        heroScroll={heroScroll}
        tier={tier}
        paused={paused}
        onFirstFrame={onFirstFrame}
      />
    </Canvas>
  );
}
