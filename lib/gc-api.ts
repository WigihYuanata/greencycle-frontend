/**
 * GreenCycle API client
 * All requests hit process.env.NEXT_PUBLIC_API_URL as the base URL.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function authHeaders(token?: string | null): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

// ──────────────────────────────────────────────
// Pydantic-matched response types
// ──────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  npm: string;
  name: string;
  email: string;
}

export interface LeaderEntry {
  peringkat: number;
  nama: string;
  npm: string;
  fakultas: string;
  total_point: number;
}

export interface LeaderboardResponse {
  Top_10_GreenCycle: LeaderEntry[];
}

export interface DashboardResponse {
  profil: {
    npm: string;
    name: string;
    faculty: string;
    email: string;
  };
  statistik_finansial: {
    "total poin didapat": number;
    poin_berhasil_ditukar: number;
    sisa_saldo_aktif: number;
  };
  kontribusi_botol: {
    botol_kecil: number;
    botol_sedang: number;
    botol_besar: number;
    total_kontribusi_lingkungan: number;
  };
  aset_mahasiswa: {
    voucher_diskon_aktif: { kode: string; Cafee: string }[];
    jadwal_penjemputan: string;
  };
}

export interface VoucherCatalogItem {
  id: number;
  name: string;
  point_cost: number;
  cafe_name: string;
  description: string | null;
  is_active: boolean;
}

export interface RedeemResponse {
  status: string;
  voucher_code: string;
  qr_code_url: string;
  cafe_name: string;
  sisa_point: number;
}

export interface PickUpOrderResponse {
  id: number;
  scheduled_day: string;
  status: string;
  created_at: string;
}

export interface ForgotPinResponse {
  message: string;
}

export interface ResetPinResponse {
  message: string;
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export async function apiLogin(npm: string, pin: string): Promise<TokenResponse> {
  const res = await fetch(`${BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ npm, pin }),
  });
  return handleResponse<TokenResponse>(res);
}

export async function apiRegister(data: {
  npm: string;
  name: string;
  faculty: string;
  email: string;
  pin: string;
}): Promise<UserResponse> {
  const res = await fetch(`${BASE}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<UserResponse>(res);
}

export async function apiForgotPin(npm: string): Promise<ForgotPinResponse> {
  const res = await fetch(`${BASE}/auth/forgot-pin/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ npm }),
  });
  return handleResponse<ForgotPinResponse>(res);
}

export async function apiResetPin(data: {
  npm: string;
  kode_verifikasi: string;
  new_pin: string;
}): Promise<ResetPinResponse> {
  const res = await fetch(`${BASE}/auth/reset-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<ResetPinResponse>(res);
}

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export async function apiFetchDashboard(token: string): Promise<DashboardResponse> {
  const res = await fetch(`${BASE}/dashboard/`, {
    headers: authHeaders(token),
  });
  return handleResponse<DashboardResponse>(res);
}

// ──────────────────────────────────────────────
// Leaderboard
// ──────────────────────────────────────────────

export async function apiFetchLeaderboard(): Promise<LeaderboardResponse> {
  const res = await fetch(`${BASE}/leaderboard/`);
  return handleResponse<LeaderboardResponse>(res);
}

// ──────────────────────────────────────────────
// Vouchers
// ──────────────────────────────────────────────

export async function apiFetchVouchers(): Promise<VoucherCatalogItem[]> {
  const res = await fetch(`${BASE}/vouchers/available`);
  return handleResponse<VoucherCatalogItem[]>(res);
}

export async function apiRedeemVoucher(
  token: string,
  catalog_id: number,
): Promise<RedeemResponse> {
  const res = await fetch(`${BASE}/redeem/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ catalog_id }),
  });
  return handleResponse<RedeemResponse>(res);
}

// ──────────────────────────────────────────────
// Pick-up orders
// ──────────────────────────────────────────────

export async function apiCreatePickupOrder(
  token: string,
  data: { pickup_address: string; contact_number: string; scheduled_day: "Sabtu" | "Minggu" },
): Promise<PickUpOrderResponse> {
  const res = await fetch(`${BASE}/pickup/order/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<PickUpOrderResponse>(res);
}

export async function apiGetMyPickupOrders(token: string): Promise<PickUpOrderResponse[]> {
  const res = await fetch(`${BASE}/pickup/my-orders`, {
    headers: authHeaders(token),
  });
  return handleResponse<PickUpOrderResponse[]>(res);
}

// ──────────────────────────────────────────────
// SWR fetcher factories (used by hooks)
// ──────────────────────────────────────────────

export function makeDashboardFetcher(token: string | null) {
  return token ? () => apiFetchDashboard(token) : null;
}

export function makeLeaderboardFetcher() {
  return () => apiFetchLeaderboard();
}

export function makeVouchersFetcher() {
  return () => apiFetchVouchers();
}

// ──────────────────────────────────────────────
// Global platform statistics
// Derived from the leaderboard since the backend does not expose a dedicated
// aggregate endpoint. We sum total_point across ALL leaderboard entries and
// count unique faculties to serve as real, data-backed platform-wide numbers.
// ──────────────────────────────────────────────

export interface GlobalStatsResult {
  /**
   * Sum of ALL Transaction.points earned across all students in the leaderboard.
   * Backend: SUM(Transaction.points) per user, joined & limited to top-10.
   * This is gross points earned — NOT net after redemption.
   */
  totalPoints: number;
  /**
   * Estimated total bottles recycled by all leaderboard students.
   * Derived: totalPoints ÷ weighted-average points per bottle (20 pts).
   * Small=10pts, Medium=20pts, Large=30pts → avg = 20 pts/bottle.
   */
  totalBottles: number;
  /** Number of unique faculties represented in the leaderboard */
  facultiesCount: number;
  /**
   * Number of students who have at least one transaction (leaderboard entry count).
   * The leaderboard only includes users with transactions (JOIN on Transaction).
   */
  activeContributors: number;
}

const AVG_PTS_PER_BOTTLE = 20; // (10+20+30) / 3

export async function apiFetchGlobalStats(): Promise<GlobalStatsResult> {
  const data = await apiFetchLeaderboard();
  const entries = data.Top_10_GreenCycle;

  const totalPoints = entries.reduce((sum, e) => sum + (e.total_point ?? 0), 0);
  const totalBottles = Math.round(totalPoints / AVG_PTS_PER_BOTTLE);
  const uniqueFaculties = new Set(entries.map((e) => e.fakultas).filter(Boolean));

  return {
    totalPoints,
    totalBottles,
    facultiesCount: uniqueFaculties.size,
    // leaderboard JOIN only returns users with ≥1 transaction, so this is real
    activeContributors: entries.length,
  };
}

export function makeGlobalStatsFetcher() {
  return () => apiFetchGlobalStats();
}
