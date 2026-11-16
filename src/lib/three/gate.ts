/**
 * Three.js capability gate — Sisi Padel Club & Villa, Rebuild Stage 2.
 *
 * Menentukan tier render 3D berdasarkan kapabilitas perangkat, supaya
 * perangkat lemah / tanpa WebGL2 / hemat-data tidak pernah dipaksa
 * me-render scene 3D (hero & viewer jatuh kembali ke 2D/foto).
 *
 * Dipanggil HANYA dari client component (dynamic ssr:false). Di server
 * (typeof window === "undefined") selalu kembalikan "off".
 */

export type ThreeTier = "full" | "lite" | "off";

/** Satu-satunya sumber progress scroll hero — dibaca kamera 3D di useFrame. */
export type HeroScrollState = { t: number; invalidate?: () => void };

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function hasWebGL2(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * "off" jika: tidak ada WebGL2, save-data aktif, deviceMemory < 4,
 * atau hardwareConcurrency < 4.
 * "lite" jika: lolos "off" tapi deviceMemory <= 4 atau hardwareConcurrency <= 4
 * (DPR 1, tanpa AA, tanpa shadow — diatur pemanggil Canvas).
 * "full" jika di atas itu.
 *
 * deviceMemory / hardwareConcurrency yang undefined (browser tidak
 * mengeksposnya) tidak menggagalkan cek — dianggap mampu.
 */
export function getThreeTier(): ThreeTier {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "off";
  if (!hasWebGL2()) return "off";

  const nav = navigator as NavigatorWithHints;

  if (nav.connection?.saveData) return "off";

  const mem = nav.deviceMemory;
  if (typeof mem === "number" && Number.isFinite(mem) && mem < 4) return "off";

  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && Number.isFinite(cores) && cores < 4) return "off";

  if (
    (typeof mem === "number" && Number.isFinite(mem) && mem <= 4) ||
    (typeof cores === "number" && Number.isFinite(cores) && cores <= 4)
  ) {
    return "lite";
  }

  return "full";
}

/** true jika user mengaktifkan "reduce motion" di OS/browser. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
