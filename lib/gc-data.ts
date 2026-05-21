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

export const E_WALLETS = ["DANA", "GoPay", "ShopeePay", "OVO", "BNI"];

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

export const LEADERBOARD: Leader[] = [
  { rank: 1, name: "Nabila Putri", faculty: "Fakultas Ekonomi dan Bisnis", points: 5620 },
  { rank: 2, name: "Rizky Pratama", faculty: "Fakultas Teknik", points: 4830 },
  { rank: 3, name: "Fajar Ramadhan", faculty: "Fakultas Ilmu Sosial dan Ilmu Politik", points: 4210 },
  { rank: 4, name: "Amelia Safitri", faculty: "Fakultas Pertanian", points: 3980 },
  { rank: 5, name: "Dimas Maulana", faculty: "Fakultas Teknik", points: 3450 },
  { rank: 6, name: "Siti Aisyah", faculty: "Fakultas Hukum", points: 3180 },
  { rank: 7, name: "Alya Prameswari", faculty: "Fakultas Ilmu Komputer", points: 3010 },
  { rank: 8, name: "Bagas Arya", faculty: "Fakultas Arsitektur dan Desain", points: 2875 },
  { rank: 9, name: "Mira Ananda", faculty: "Fakultas Ekonomi dan Bisnis", points: 2640 },
  { rank: 10, name: "Hanif Akbar", faculty: "Fakultas Teknik", points: 2510 },
];

export const WEEKLY = [18, 26, 24, 31, 45, 52, 63];
export const WEEK_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function cx(...values: Array<string | false | null | undefined>) {
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
