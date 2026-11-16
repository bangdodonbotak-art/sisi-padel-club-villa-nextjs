/**
 * CourtModel — lapangan padel prosedural (dipakai HERO 3D + COURT VIEWER).
 * Rebuild Stage 2 — Agen SETUP.
 *
 * - Ukuran padel asli: lapangan 20 x 10 m, net di x = 0.
 * - NOL tekstur / NOL file aset: semua warna prosedural.
 * - Material murah mobile: MeshStandardMaterial saja (bukan Physical).
 * - SATU shadow light max (directional, castShadow).
 * - Self-contained: lampu + langit/fog + ground termasuk di dalam.
 * - Draw calls: 31 tanpa bola, 33 dengan bola (target < 40).
 * - TIDAK import dari file lain kecuali three / @react-three/fiber.
 *   (gate.ts sengaja TIDAK diimport di sini — tier diputuskan pemanggil Canvas.)
 */

import type { JSX } from "react";
import { useEffect } from "react";
import type { ThreeElements } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// R3F v9: import tipe di atas memuat augmentasi JSX IntrinsicElements
// (mesh, group, boxGeometry, ...) dari three-types.d.ts. Tanpa ini tsc
// menolak elemen R3F di file yang tidak mengimpor @react-three/fiber.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _FiberElements = ThreeElements;

export type TimeOfDay = "day" | "night";

export type CourtModelProps = {
  /** default "main"; beda aksen kecil saja (warna tape net). */
  variant?: "upper" | "main";
  /** default "day"; ubah lampu / langit / floodlight. */
  timeOfDay?: TimeOfDay;
  /** default false. */
  showBall?: boolean;
  /** default [0, 0.18, 0]. Bola dibuat agak besar (r 0.18) supaya terbaca di kamera jauh. */
  ballPosition?: [number, number, number];
};

// --- Palet (disamakan dengan foto hero: golden hour, turf merah) ---
// POLISH 16 Nov 2026: warna-warna gelap diangkat supaya tidak render
// hitam di SwiftShader/HP — pagar + net + ground tadinya nyaris hitam
// (#1d2b22/#20241f/#14261b) dan menutupi lapangan dari kamera.
const PALETTE = {
  turf: "#b04027", // merah bata lapangan (sedikit lebih terang)
  turfNight: "#8a3120",
  line: "#f5f2e8",
  ground: "#22402a", // jungle gelap — hijau tua yang terbaca, bukan hitam
  groundNight: "#122619",
  glass: "#cfe8e4",
  fence: "#5a6b58", // pagar mesh terang (dulu #1d2b22 nyaris hitam)
  pole: "#3a4045",
  net: "#4d574a", // jaring terang (dulu #20241f = balok hitam)
  ball: "#d9ff3f", // lime Sisi
  skyDay: "#f2b877", // senja hangat
  fogDay: "#e9b083",
  skyNight: "#0b1526",
  fogNight: "#0d1828",
} as const;

const LINE_Y = 0.02;
const GLASS_H = 3;
const FENCE_H = 1;

function Lines() {
  // Tiap strip garis = 1 mesh (total 7). Material ditulis inline sebagai
  // child — R3F tidak menerima elemen JSX lewat prop `material`.
  const line = (position: [number, number, number], size: [number, number, number]) => (
    <mesh key={`${position[0]}:${position[2]}`} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={PALETTE.line} roughness={0.85} metalness={0} />
    </mesh>
  );
  return (
    <group>
      {/* boundary: 2 panjang (20 m) + 2 pendek (10 m) */}
      {line([0, LINE_Y, -5], [20, 0.012, 0.12])}
      {line([0, LINE_Y, 5], [20, 0.012, 0.12])}
      {line([-10, LINE_Y, 0], [0.12, 0.012, 10])}
      {line([10, LINE_Y, 0], [0.12, 0.012, 10])}
      {/* service line: 3 m dari net, tiap sisi */}
      {line([-3, LINE_Y, 0], [0.12, 0.012, 10])}
      {line([3, LINE_Y, 0], [0.12, 0.012, 10])}
      {/* center service line: di antara kedua service line */}
      {line([0, LINE_Y, 0], [6, 0.012, 0.12])}
    </group>
  );
}

function Net({ accent }: { accent: string }) {
  return (
    <group>
      {/* tiang net */}
      <mesh position={[0, 0.525, -5.05]}>
        <cylinderGeometry args={[0.05, 0.05, 1.05, 10]} />
        <meshStandardMaterial color={PALETTE.pole} roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.525, 5.05]}>
        <cylinderGeometry args={[0.05, 0.05, 1.05, 10]} />
        <meshStandardMaterial color={PALETTE.pole} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* bidang jaring — POLISH: dulu #20241f opacity 0.85 = balok hitam
          10 m di tengah lapangan; kini lebih terang + tembus pandang.
          FrontSide (bukan DoubleSide) supaya hanya satu blend pass. */}
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[0.02, 0.88, 10]} />
        <meshStandardMaterial
          color={PALETTE.net}
          roughness={0.9}
          metalness={0}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
      {/* tape atas net */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.06, 0.05, 10.1]} />
        <meshStandardMaterial color={accent} roughness={0.7} metalness={0} />
      </mesh>
    </group>
  );
}

function GlassWalls() {
  // POLISH: opacity 0.16 → 0.24 + emissive kecil supaya kaca tidak
  // jatuh hitam saat latarnya gelap; tetap tembus pandang.
  const glass = (position: [number, number, number], size: [number, number, number]) => (
    <mesh key={`${position[0]}:${position[2]}`} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={PALETTE.glass}
        roughness={0.08}
        metalness={0.1}
        transparent
        opacity={0.24}
        emissive="#a8c8c0"
        emissiveIntensity={0.18}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
  return (
    <group>
      {/* dinding kaca belakang (x = +/-10), 10 m x 3 m */}
      {glass([-10, GLASS_H / 2, 0], [0.05, GLASS_H, 10])}
      {glass([10, GLASS_H / 2, 0], [0.05, GLASS_H, 10])}
      {/* dinding kaca samping: 4 m pertama tiap ujung, tiap sisi */}
      {([-5, 5] as const).flatMap((z) =>
        ([-8, 8] as const).map((x) => glass([x, GLASS_H / 2, z], [4, GLASS_H, 0.05])),
      )}
    </group>
  );
}

function Fences() {
  // POLISH: pagar mesh — dulu #1d2b22 opacity 0.5 DoubleSide = dua blend
  // pass yang menutupi separuh lapangan jadi hitam dari kamera. Kini
  // warna terang + opacity 0.3 + FrontSide (satu blend pass saja).
  const fence = (position: [number, number, number], size: [number, number, number]) => (
    <mesh key={`${position[0]}:${position[2]}`} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={PALETTE.fence}
        roughness={0.9}
        metalness={0.2}
        transparent
        opacity={0.3}
        depthWrite={false}
      />
    </mesh>
  );
  return (
    <group>
      {/* pagar di atas kaca belakang (3-4 m) */}
      {fence([-10, GLASS_H + FENCE_H / 2, 0], [0.05, FENCE_H, 10])}
      {fence([10, GLASS_H + FENCE_H / 2, 0], [0.05, FENCE_H, 10])}
      {/* pagar samping: sisa 12 m tengah, tiap sisi */}
      {fence([0, GLASS_H / 2, -5], [12, GLASS_H, 0.05])}
      {fence([0, GLASS_H / 2, 5], [12, GLASS_H, 0.05])}
    </group>
  );
}

function Floodlights({ night }: { night: boolean }) {
  const poles: [number, number][] = [
    [-11.5, -6.5],
    [-11.5, 6.5],
    [11.5, -6.5],
    [11.5, 6.5],
  ];
  return (
    <group>
      {poles.map(([x, z]) => (
        <group key={`${x}:${z}`}>
          <mesh position={[x, 3, z]}>
            <cylinderGeometry args={[0.09, 0.11, 6, 8]} />
            <meshStandardMaterial color={PALETTE.pole} roughness={0.6} metalness={0.5} />
          </mesh>
          {/* kepala sorot, miring menghadap lapangan */}
          <mesh
            position={[x * 0.96, 6.1, z * 0.94]}
            rotation={[z > 0 ? 0.5 : -0.5, 0, x > 0 ? 0.35 : -0.35]}
          >
            <boxGeometry args={[0.9, 0.35, 0.3]} />
            <meshStandardMaterial
              color="#2c3134"
              roughness={0.5}
              metalness={0.4}
              emissive="#ffe9b0"
              emissiveIntensity={night ? 2.4 : 0.12}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Ball({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.18, 24, 16]} />
        <meshStandardMaterial color={PALETTE.ball} roughness={0.55} metalness={0} />
      </mesh>
      {/* seam putih prosedural (torus tipis mengelilingi bola) */}
      <mesh rotation={[0.6, 0, 0.9]}>
        <torusGeometry args={[0.18, 0.012, 8, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0} />
      </mesh>
    </group>
  );
}

/**
 * Langit + fog HARUS di-set lewat scene (useThree), BUKAN sebagai elemen
 * `<color attach="background">` / `<fog attach="fog">` di dalam <group> —
 * attach menarget parent langsung, dan Group tidak punya properti
 * background/fog, jadi langit jadi hitam (bug ketemu di verifikasi pusat
 * Stage 2: sky hitam di hero + viewer). Komponen ini me-mount di dalam
 * CourtModel tapi menulis ke scene — tetap self-contained.
 */
function SceneEnvironment({ night }: { night: boolean }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.background = new THREE.Color(
      night ? PALETTE.skyNight : PALETTE.skyDay,
    );
    scene.fog = new THREE.Fog(
      night ? PALETTE.fogNight : PALETTE.fogDay,
      night ? 30 : 45,
      night ? 95 : 115,
    );
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, night]);
  return null;
}

export function CourtModel({
  variant = "main",
  timeOfDay = "day",
  showBall = false,
  ballPosition = [0, 0.18, 0],
}: CourtModelProps): JSX.Element {
  const night = timeOfDay === "night";
  const accent = variant === "upper" ? "#ffffff" : PALETTE.ball;

  return (
    <group>
      {/* langit + fog (via scene — lihat SceneEnvironment di atas) */}
      <SceneEnvironment night={night} />

      {/* lampu: SATU shadow light (directional) + ambient + hemisphere
          + fill dingin dari sisi berlawanan (tanpa shadow) supaya sisi
          yang membelakangi matahari tidak jatuh gelap.
          POLISH: intensitas siang diangkat (ambient 0.55→1.0, hemi
          0.5→0.9, dir 2.1→3.0) — dengan lampu fisik three.js, nilai lama
          membuat turf jadi coklat gelap/hitam di SwiftShader.
          Malam juga diangkat (dir 0.5→1.4, ambient 0.22→0.55) supaya
          lapangan tetap terbaca saat mode Malam — sebelumnya nyaris hitam. */}
      <ambientLight intensity={night ? 0.55 : 1.0} color={night ? "#8fb0ff" : "#ffe0b8"} />
      <hemisphereLight
        args={[
          night ? "#1d2f4d" : "#ffd9a0",
          night ? "#0c1a12" : "#3a5a3a",
          night ? 0.7 : 0.9,
        ]}
      />
      <directionalLight
        castShadow
        position={night ? [-14, 18, -8] : [16, 22, 10]}
        intensity={night ? 1.4 : 3.0}
        color={night ? "#b9ccff" : "#ffb45e"}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-far={70}
      />
      {/* fill: angkat sisi yang membelakangi matahari (tanpa shadow) */}
      <directionalLight
        position={night ? [12, 10, 12] : [-12, 10, -14]}
        intensity={night ? 0.5 : 0.7}
        color={night ? "#8fb0ff" : "#cfe0ff"}
      />

      {/* ground sekeliling (jungle gelap) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial
          color={night ? PALETTE.groundNight : PALETTE.ground}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* turf lapangan 20 x 10 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color={night ? PALETTE.turfNight : PALETTE.turf}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      <Lines />
      <Net accent={accent} />
      <GlassWalls />
      <Fences />
      <Floodlights night={night} />
      {showBall ? <Ball position={ballPosition} /> : null}
    </group>
  );
}
