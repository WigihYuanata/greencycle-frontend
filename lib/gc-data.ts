export type Screen = "home" | "dashboard" | "leaderboard" | "account";
export type AuthMode = "login" | "register" | "forgot";
export type MachineStatus = "active" | "pairing" | "connected";
export type ToastTone = "success" | "info" | "warning";

export type Toast = { text: string; tone: ToastTone };
export type Machine = {
  id: string;
  label: string;
  area: string;
  status: MachineStatus;
  owner?: string;
};
export type Activity = {
  title: string;
  meta: string;
  points: number;
  time: string;
  kind: "green" | "mint" | "slate";
};

/** Frontend leaderboard entry — mapped from the backend LeaderEntry schema */
export type Leader = {
  rank: number;
  name: string;
  faculty: string;
  points: number;
};

export type PairingSession = {
  machineId: string;
  expiresAt: number;
  stage: "waiting" | "success";
};

export const FACULTIES = [
  "Fakultas Teknik",
  "Fakultas Ekonomi dan Bisnis",
  "Fakultas Ilmu Sosial dan Ilmu Politik",
  "Fakultas Pertanian",
  "Fakultas Hukum",
  "Fakultas Ilmu Komputer",
  "Fakultas Arsitektur dan Desain",
];

export const MACHINES: Machine[] = [
  { id: "BIN-FT-01", label: "Smart BIN Teknik", area: "Fakultas Teknik", status: "active" },
  { id: "BIN-FEB-01", label: "Smart BIN FEB", area: "Fakultas Ekonomi dan Bisnis", status: "active" },
  { id: "BIN-FISIP-01", label: "Smart BIN FISIP", area: "Fakultas Ilmu Sosial dan Ilmu Politik", status: "active" },
  { id: "BIN-FH-01", label: "Smart BIN Hukum", area: "Fakultas Hukum", status: "active" },
  { id: "BIN-FIKOM-01", label: "Smart BIN Ilkom", area: "Fakultas Ilmu Komputer", status: "active" },
  { id: "BIN-FAPERTA-01", label: "Smart BIN Pertanian", area: "Fakultas Pertanian", status: "active" },
  { id: "BIN-FAD-01", label: "Smart BIN Desain", area: "Fakultas Arsitektur dan Desain", status: "active" },
];

export const HOME_QUESTIONS = [
  {
    q: "Bagaimana cara mulai memakai GreenCycle?",
    a: "Daftar, login, lalu hubungkan kartu ke Smart BIN terdekat sekali saja. Setelah itu cukup tap kartu saat setor botol.",
  },
  {
    q: "Apakah poin langsung masuk?",
    a: "Ya. Setelah botol berhasil diproses, poin muncul di dashboard dan riwayat transaksi.",
  },
  {
    q: "Apakah saldo bisa ditarik?",
    a: "Bisa. Penarikan saldo digital tersedia dari dashboard dengan konfirmasi PIN 6 digit.",
  },
];

export function cx(...values: Array<string | undefined | null | false>) {
  return values.filter(Boolean).join(" ");
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function digitsOnly(value: string, maxLength?: number) {
  const next = value.replace(/\D/g, "");
  return typeof maxLength === "number" ? next.slice(0, maxLength) : next;
}

export function isSixDigitPin(value: string) {
  return /^\d{6}$/.test(value.trim());
}

export function isValidNpm(value: string) {
  return /^\d{8,20}$/.test(value.trim());
}

export function isValidCampusEmail(value: string) {
  return /^[^\s@]+@student\.upnjatim\.ac\.id$/i.test(value.trim());
}

export function formatPoints(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// ─────────────────────────────────────────────────────────────────────────────
// Environmental impact constants (scientific sources)
//
// Source 1 — NIH / Gironi & Piemonte (2010), Env. Progress & Sustainable Energy
//   → 0.0114 kg CO2-eq PREVENTED per 500 mL PET bottle recycled
//     (vs. virgin PET production pathway)
//
// Source 2 — Water Footprint Network / Pacific Institute (Gleick & Cooley 2009)
//   → Producing 1 kg PET resin requires ≈ 17.4 L water (cradle-to-gate)
//   → Average 500 mL PET bottle weighs ~23 g → 17.4 L × 0.023 = ~0.40 L
//   → Rounding to 0.4 L saved per bottle (conservative estimate)
//
// Point-to-bottle conversion:
//   Backend schema: kecil=10 pts, sedang=20 pts, besar=30 pts
//   Weighted average: (10+20+30)/3 = 20 pts per bottle
// ─────────────────────────────────────────────────────────────────────────────

/** kg CO2-eq prevented per 1 recycled PET bottle (NIH LCA study) */
export const CO2_PER_BOTTLE_KG = 0.0114;

/** litres of water saved per 1 recycled PET bottle (Pacific Institute / Gleick) */
export const WATER_PER_BOTTLE_L = 0.4;

/** average points earned per bottle (weighted mean of 10/20/30 point tiers) */
export const AVG_POINTS_PER_BOTTLE = 20;

export type ImpactStats = {
  /** total bottles recycled by all students (derived from total points) */
  totalBottles: number;
  /** litres of water saved (totalBottles × WATER_PER_BOTTLE_L) */
  waterLitres: number;
  /** kg CO2-eq emission prevented (totalBottles × CO2_PER_BOTTLE_KG) */
  co2Kg: number;
  /** number of faculties involved (from leaderboard unique faculty count) */
  facultiesCount: number;
};

/**
 * Compute real environmental impact from total points across all students.
 * `totalPoints` is the sum of all points earned by all students platform-wide.
 * `facultiesCount` is the number of unique faculties in the leaderboard.
 */
export function computeImpact(totalPoints: number, facultiesCount: number): ImpactStats {
  const totalBottles = Math.round(totalPoints / AVG_POINTS_PER_BOTTLE);
  return {
    totalBottles,
    waterLitres: Math.round(totalBottles * WATER_PER_BOTTLE_L),
    co2Kg: parseFloat((totalBottles * CO2_PER_BOTTLE_KG).toFixed(2)),
    facultiesCount,
  };
}

/**
 * Format litres into human-readable string.
 * < 1000 L → "420 L", >= 1000 → "1,2 kL"
 */
export function formatLitres(litres: number): string {
  if (litres >= 1000) {
    return new Intl.NumberFormat("id-ID", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(litres) + " L";
  }
  return `${new Intl.NumberFormat("id-ID").format(litres)} L`;
}

/**
 * Format kg CO2 into human-readable string.
 * < 1000 kg → "3,14 kg", >= 1000 → "1,2 ton"
 */
export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return new Intl.NumberFormat("id-ID", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(kg) + " ton CO₂";
  }
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(kg)} kg CO₂`;
}
