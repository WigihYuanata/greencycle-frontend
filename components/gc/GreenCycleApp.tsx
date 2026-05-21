"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import useSWR from "swr";

import {
  Screen, AuthMode, Machine, Toast, ToastTone, PairingSession,
  Leader,
  MACHINES,
  cx, formatCompact, isSixDigitPin, isValidNpm, isValidCampusEmail,
  computeImpact, formatLitres, formatCO2,
} from "@/lib/gc-data";
import {
  apiLogin, apiRegister, apiForgotPin, apiResetPin,
  apiFetchDashboard, apiFetchLeaderboard, apiRedeemVoucher,
  LeaderEntry, VoucherCatalogItem,
  makeVouchersFetcher, makeLeaderboardFetcher, makeGlobalStatsFetcher,
} from "@/lib/gc-api";
import { useCountUp } from "@/hooks/use-count-up";

import HomeScreen from "@/components/gc/HomeScreen";
import DashboardScreen from "@/components/gc/DashboardScreen";
import LeaderboardScreen from "@/components/gc/LeaderboardScreen";
import AccountScreen from "@/components/gc/AccountScreen";
import PairingSheet from "@/components/gc/PairingSheet";
import RedeemSheet from "@/components/gc/RedeemSheet";
import BottomNav from "@/components/gc/BottomNav";
import ToastBanner from "@/components/gc/ToastBanner";
import DesktopSidebar from "@/components/gc/DesktopSidebar";
import UpnLogo from "@/components/gc/UpnLogo";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const TOKEN_KEY = "gc_token";

function saveToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* noop */ }
}

function loadToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* noop */ }
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function GreenCycleApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [now, setNow] = useState(Date.now());

  // Profile / balances / bottles — populated from /dashboard/
  const [profile, setProfile] = useState({
    name: "",
    npm: "",
    faculty: "",
    email: "",
  });
  const [balances, setBalances] = useState({ total: 0, redeemed: 0, active: 0 });
  const [bottles, setBottles] = useState({ small: 0, medium: 0, large: 0 });

  const [machines, setMachines] = useState<Machine[]>(MACHINES);
  const [heroFocus, setHeroFocus] = useState(0);
  const [leaderScope, setLeaderScope] = useState<"minggu" | "bulan" | "semua">("minggu");

  const [pairingSession, setPairingSession] = useState<PairingSession | null>(null);
  const [pairingPreviewMachine, setPairingPreviewMachine] = useState<string | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [pairingOpen, setPairingOpen] = useState(false);
  const [activeMachineId, setActiveMachineId] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ npm: "", pin: "" });
  const [registerForm, setRegisterForm] = useState({
    npm: "", name: "", faculty: "", email: "", pin: "", confirmPin: "",
  });
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotForm, setForgotForm] = useState({ npm: "", otp: "", pin: "", confirmPin: "" });
  const [redeemForm, setRedeemForm] = useState({ catalogId: 0, pin: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Restore session on mount ──
  useEffect(() => {
    const stored = loadToken();
    if (stored) {
      setToken(stored);
      setIsLoggedIn(true);
      setScreen("dashboard");
    }
  }, []);

  // ── SWR: dashboard (requires auth) ──
  const {
    data: dashboardData,
    mutate: mutateDashboard,
    isLoading: dashboardLoading,
  } = useSWR(
    token ? ["dashboard", token] : null,
    () => apiFetchDashboard(token!),
    { onError: (err) => emitToast(err.message, "warning") },
  );

  // Sync dashboard data into local state
  useEffect(() => {
    if (!dashboardData) return;
    const p = dashboardData.profil;
    setProfile({ name: p.name, npm: p.npm, faculty: p.faculty, email: p.email });
    const fin = dashboardData.statistik_finansial;
    setBalances({
      total: fin["total poin didapat"],
      redeemed: fin.poin_berhasil_ditukar,
      active: fin.sisa_saldo_aktif,
    });
    const b = dashboardData.kontribusi_botol;
    setBottles({ small: b.botol_kecil, medium: b.botol_sedang, large: b.botol_besar });
  }, [dashboardData]);

  // ── SWR: leaderboard (public) ──
  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
  } = useSWR("leaderboard", makeLeaderboardFetcher(), {
    onError: (err) => emitToast(err.message, "warning"),
  });

  const leaderboard: Leader[] = useMemo(() => {
    if (!leaderboardData) return [];
    return leaderboardData.Top_10_GreenCycle.map((e: LeaderEntry) => ({
      rank: e.peringkat,
      name: e.nama,
      faculty: e.fakultas,
      points: e.total_point,
    }));
  }, [leaderboardData]);

  // ── SWR: vouchers (public) ──
  const {
    data: vouchers,
    isLoading: vouchersLoading,
  } = useSWR<VoucherCatalogItem[]>("vouchers", makeVouchersFetcher(), {
    onError: (err) => emitToast(err.message, "warning"),
  });

  // ── SWR: global platform stats (public, derived from leaderboard) ──
  const { data: globalStats, isLoading: globalStatsLoading } = useSWR(
    "global-stats",
    makeGlobalStatsFetcher(),
    { revalidateOnFocus: false },
  );

  // ── Hero stats animated from real API data ──
  // Targets update once globalStats loads; useCountUp animates from 0 → real value.
  const heroBotol = useCountUp(globalStats?.totalBottles ?? 0);
  const heroMembers = useCountUp(globalStats?.activeContributors ?? 0);
  const heroPoints = useCountUp(globalStats?.totalPoints ?? 0);

  // ── Derived machine state ──
  const connectedMachine = useMemo(
    () => machines.find((m) => m.id === activeMachineId) ?? null,
    [machines, activeMachineId],
  );

  const pairingRemaining = pairingSession
    ? Math.max(0, Math.ceil((pairingSession.expiresAt - now) / 1000))
    : 0;

  const activeCount = machines.filter((m) => m.status === "active" || m.status === "connected").length;
  const connectedCount = machines.filter((m) => m.status === "connected").length;

  // ── Timers ──
  useEffect(() => {
    const interval = window.setInterval(() => setHeroFocus((p) => (p + 1) % 3), 4600);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!pairingSession) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [pairingSession]);

  useEffect(() => {
    if (!pairingSession) return;
    if (pairingRemaining > 0 || pairingSession.stage === "success") return;
    setMachines((prev) =>
      prev.map((m) =>
        m.id === pairingSession.machineId && m.status === "pairing"
          ? { ...m, status: "active", owner: undefined }
          : m,
      ),
    );
    setPairingSession(null);
    setPairingOpen(false);
    setToast({ text: "Sesi pairing habis. Coba lagi dari dashboard.", tone: "warning" });
  }, [pairingRemaining, pairingSession]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // ── Helpers ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const emitToast = useCallback(
    (text: string, tone: ToastTone = "success") => setToast({ text, tone }),
    [],
  );

  const openPairing = (machineId?: string) => {
    if (!isLoggedIn) {
      emitToast("Masuk dulu untuk menghubungkan kartu.", "info");
      setScreen("account");
      setAuthMode("login");
      return;
    }
    setPairingPreviewMachine(machineId ?? null);
    setPairingOpen(true);
  };

  const beginPairingLock = (machineId: string) => {
    if (pairingSession?.stage === "waiting") {
      emitToast("Masih ada sesi pairing aktif. Selesaikan dulu sesi sebelumnya.", "warning");
      return;
    }
    setMachines((prev) =>
      prev.map((m) => m.id === machineId ? { ...m, status: "pairing", owner: profile.name } : m),
    );
    setPairingSession({ machineId, expiresAt: Date.now() + 60000, stage: "waiting" });
    setPairingPreviewMachine(machineId);
    emitToast(`Pairing terkunci untuk ${machineId}. Tempelkan KTM dalam 60 detik.`, "success");
  };

  const tapCardToPair = () => {
    if (!pairingSession || pairingSession.stage !== "waiting") return;
    const machineId = pairingSession.machineId;
    setPairingSession({ ...pairingSession, stage: "success" });
    setMachines((prev) =>
      prev.map((m) => m.id === machineId ? { ...m, status: "connected", owner: profile.name } : m),
    );
    setActiveMachineId(machineId);
    setTimeout(() => {
      setPairingSession(null);
      setPairingOpen(false);
      setPairingPreviewMachine(null);
      emitToast("KTM Berhasil Terhubung! Anda siap mendaur ulang.", "success");
    }, 1800);
  };

  // ── Auth handlers (real API) ──
  const handleLogin = async () => {
    if (!isValidNpm(loginForm.npm)) { emitToast("NPM harus berupa 8–20 digit angka.", "warning"); return; }
    if (!isSixDigitPin(loginForm.pin)) { emitToast("PIN login harus 6 digit angka.", "warning"); return; }
    setIsSubmitting(true);
    try {
      const data = await apiLogin(loginForm.npm, loginForm.pin);
      saveToken(data.access_token);
      setToken(data.access_token);
      setIsLoggedIn(true);
      setScreen("dashboard");
      emitToast("Berhasil masuk. Selamat datang kembali.", "success");
    } catch (err: unknown) {
      emitToast(err instanceof Error ? err.message : "Gagal masuk.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!isValidNpm(registerForm.npm)) { emitToast("NPM harus berupa 8–20 digit angka.", "warning"); return; }
    if (!registerForm.name.trim()) { emitToast("Nama lengkap wajib diisi.", "warning"); return; }
    if (!registerForm.faculty) { emitToast("Fakultas wajib dipilih.", "warning"); return; }
    if (!isValidCampusEmail(registerForm.email)) { emitToast("Gunakan email kampus @student.upnjatim.ac.id.", "warning"); return; }
    if (!isSixDigitPin(registerForm.pin) || registerForm.pin !== registerForm.confirmPin) {
      emitToast("PIN harus 6 digit dan konfirmasi harus sama.", "warning"); return;
    }
    setIsSubmitting(true);
    try {
      await apiRegister({
        npm: registerForm.npm.trim(),
        name: registerForm.name.trim(),
        faculty: registerForm.faculty,
        email: registerForm.email.trim(),
        pin: registerForm.pin,
      });
      // Auto-login after registration
      const data = await apiLogin(registerForm.npm.trim(), registerForm.pin);
      saveToken(data.access_token);
      setToken(data.access_token);
      setIsLoggedIn(true);
      setScreen("dashboard");
      emitToast("Akun berhasil dibuat dan siap digunakan.", "success");
    } catch (err: unknown) {
      emitToast(err instanceof Error ? err.message : "Gagal mendaftar.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async () => {
    if (forgotStep === 1) {
      if (!isValidNpm(forgotForm.npm)) { emitToast("Masukkan NPM yang valid.", "warning"); return; }
      setIsSubmitting(true);
      try {
        await apiForgotPin(forgotForm.npm);
        setForgotStep(2);
        emitToast("OTP verifikasi dikirim ke email kampus.", "info");
      } catch (err: unknown) {
        emitToast(err instanceof Error ? err.message : "Gagal mengirim OTP.", "warning");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    if (!/^\d{6}$/.test(forgotForm.otp)) { emitToast("OTP harus 6 digit angka.", "warning"); return; }
    if (!isSixDigitPin(forgotForm.pin) || forgotForm.pin !== forgotForm.confirmPin) {
      emitToast("PIN baru harus 6 digit dan konfirmasi harus sama.", "warning"); return;
    }
    setIsSubmitting(true);
    try {
      await apiResetPin({
        npm: forgotForm.npm,
        kode_verifikasi: forgotForm.otp,
        new_pin: forgotForm.pin,
      });
      emitToast("PIN berhasil diperbarui.", "success");
      setAuthMode("login");
      setForgotStep(1);
      setForgotForm({ npm: "", otp: "", pin: "", confirmPin: "" });
    } catch (err: unknown) {
      emitToast(err instanceof Error ? err.message : "Gagal reset PIN.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeem = async (catalogId: number) => {
    if (!token) { emitToast("Masuk dulu untuk menukarkan voucher.", "info"); return; }
    setIsSubmitting(true);
    try {
      const res = await apiRedeemVoucher(token, catalogId);
      emitToast(`Voucher berhasil ditukar! Kode: ${res.voucher_code}`, "success");
      setRedeemOpen(false);
      mutateDashboard();
    } catch (err: unknown) {
      emitToast(err instanceof Error ? err.message : "Gagal menukar voucher.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Hero focus cycling values ──
  const currentHeroMachine = machines[heroFocus % machines.length];
  const heroFocusLabel = heroFocus === 0 ? "Kontributor aktif" : heroFocus === 1 ? "Smart BIN terdekat" : "Status kartu";
  const heroFocusValue =
    heroFocus === 0
      ? `${formatCompact(heroMembers)} mahasiswa`
      : heroFocus === 1
        ? (currentHeroMachine?.area ?? "Fakultas Teknik")
        : connectedMachine
          ? `Terhubung di ${connectedMachine.label}`
          : "Belum terhubung";

  const recentActivities = dashboardData
    ? dashboardData.aset_mahasiswa.voucher_diskon_aktif.slice(0, 3).map((v) => ({
        title: "Voucher aktif",
        meta: v.Cafee,
        points: 0,
        time: "Aktif",
        kind: "green" as const,
      }))
    : [];

  // ── Compute real environmental impact from live leaderboard data ──
  const impact = useMemo(() => {
    if (!globalStats) return null;
    // Use pre-computed totalBottles from API (consistent with hero pills above)
    return computeImpact(globalStats.totalPoints, globalStats.facultiesCount || MACHINES.length);
  }, [globalStats]);

  const impactCards = useMemo(() => [
    {
      label: "Botol didaur ulang",
      value: impact ? `${new Intl.NumberFormat("id-ID").format(impact.totalBottles)}` : "—",
      helper: globalStatsLoading
        ? "Memuat data..."
        : "Total botol nyata dari seluruh mahasiswa yang terlibat.",
      loading: globalStatsLoading,
      source: "Dihitung dari total poin platform ÷ rata-rata 20 poin/botol",
    },
    {
      label: "Air lebih terjaga",
      value: impact ? formatLitres(impact.waterLitres) : "—",
      helper: globalStatsLoading
        ? "Memuat data..."
        : "Estimasi air yang terhemat dari produksi resin PET baru.",
      loading: globalStatsLoading,
      source: "0,4 L per botol · Pacific Institute / Gleick & Cooley (2009)",
    },
    {
      label: "Emisi berkurang",
      value: impact ? formatCO2(impact.co2Kg) : "—",
      helper: globalStatsLoading
        ? "Memuat data..."
        : "Emisi CO₂ yang dicegah dibanding produksi PET virgin.",
      loading: globalStatsLoading,
      source: "0,0114 kg CO₂ per botol · NIH LCA / Gironi & Piemonte (2010)",
    },
    {
      label: "Fakultas terlibat",
      value: impact ? `${impact.facultiesCount}` : `${MACHINES.length}`,
      helper: "Berdasarkan fakultas yang muncul di papan peringkat aktif.",
      loading: false,
      source: "Data langsung dari leaderboard platform",
    },
  ], [impact, globalStatsLoading]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ambient blobs */}
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-72 h-72 rounded-full bg-emerald-400/6 blur-3xl" />
      </div>

      {/* TOPBAR */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <UpnLogo size={28} />
          <div>
            <p className="font-bold text-xs md:text-sm leading-none text-foreground">GreenCycle</p>
            <p className="text-[9px] md:text-[10px] text-muted-foreground leading-none mt-0.5">UPNVJT · Smart Recycling</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Notifikasi"
            className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className={cx(
            "hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border",
            isLoggedIn
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-secondary border-border text-muted-foreground",
          )}>
            <span className={cx("w-1.5 h-1.5 rounded-full", isLoggedIn ? "bg-emerald-400" : "bg-muted-foreground/40")} />
            {isLoggedIn ? "Aktif" : "Masuk"}
          </div>
          {/* hamburger — mobile only, triggers DesktopSidebar drawer */}
          <div id="sidebar-menu-trigger" className="lg:hidden" />
        </div>
      </header>

      {/* DESKTOP LAYOUT: sidebar + content */}
      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-0 lg:min-h-[calc(100vh-57px)]">
        {/* LEFT SIDEBAR — desktop only */}
        <DesktopSidebar
          isLoggedIn={isLoggedIn}
          profile={profile}
          balances={balances}
          leaderboard={leaderboard}
          leaderboardLoading={leaderboardLoading}
          activeScreen={screen}
          onNavigate={setScreen}
        />

        {/* MAIN CONTENT */}
        <main className="lg:overflow-y-auto lg:h-[calc(100vh-57px)]">
          <div className="max-w-2xl mx-auto pb-28 lg:pb-8 lg:px-6 lg:pt-4">
            <AnimatePresence mode="wait">
              {screen === "home" && (
                <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <HomeScreen
                    heroBotol={heroBotol}
                    heroMembers={heroMembers}
                    heroPoints={heroPoints}
                    liveFacts={[
                      { label: "Smart BIN aktif", value: "7" },
                      { label: "Kontributor aktif", value: "2.350+" },
                      { label: "Poin ditukar", value: "845.600+" },
                    ]}
                    heroFocusLabel={heroFocusLabel}
                    heroFocusValue={heroFocusValue}
                    currentMachine={currentHeroMachine}
                    connectedCount={connectedCount}
                    activeCount={activeCount}
                    machines={machines}
                    activities={recentActivities}
                    impactCards={impactCards}
                    liveStrip={[
                      { label: "Smart BIN aktif", value: `${MACHINES.length}`, loading: false },
                      { label: "Kontributor aktif", value: globalStats ? `${globalStats.activeContributors}` : "—", loading: globalStatsLoading },
                      { label: "Total poin terkumpul", value: globalStats ? `${new Intl.NumberFormat("id-ID", { notation: "compact" }).format(globalStats.totalPoints)}` : "—", loading: globalStatsLoading },
                    ]}
                    leaderboard={leaderboard}
                    leaderboardLoading={leaderboardLoading}
                    onGoDashboard={() => setScreen("dashboard")}
                    onGoPairing={() => openPairing(pairingPreviewMachine ?? currentHeroMachine?.id)}
                    onGoLeaderboard={() => setScreen("leaderboard")}
                    onGoAccount={() => setScreen("account")}
                    onMachineSelect={(id) => { setPairingPreviewMachine(id); openPairing(id); }}
                  />
                </motion.div>
              )}
              {screen === "dashboard" && (
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <DashboardScreen
                    profile={profile}
                    balances={balances}
                    bottles={bottles}
                    connectedMachine={connectedMachine}
                    machines={machines}
                    activities={recentActivities}
                    isLoading={dashboardLoading}
                    onOpenPairing={() => openPairing(activeMachineId ?? machines[0].id)}
                    onOpenRedeem={() => {
                      if (!isLoggedIn) { emitToast("Masuk dulu untuk melakukan penarikan.", "info"); setScreen("account"); setAuthMode("login"); return; }
                      setRedeemOpen(true);
                    }}
                    onGoLeaderboard={() => setScreen("leaderboard")}
                    onGoAccount={() => setScreen("account")}
                  />
                </motion.div>
              )}
              {screen === "leaderboard" && (
                <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <LeaderboardScreen
                    scope={leaderScope}
                    setScope={setLeaderScope}
                    leaderboard={leaderboard}
                    isLoading={leaderboardLoading}
                    onGoDashboard={() => setScreen("dashboard")}
                    onGoPairing={() => openPairing(activeMachineId ?? machines[0].id)}
                  />
                </motion.div>
              )}
              {screen === "account" && (
                <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <AccountScreen
                    isLoggedIn={isLoggedIn}
                    isSubmitting={isSubmitting}
                    authMode={authMode}
                    setAuthMode={setAuthMode}
                    profile={profile}
                    loginForm={loginForm}
                    setLoginForm={setLoginForm}
                    registerForm={registerForm}
                    setRegisterForm={setRegisterForm}
                    forgotStep={forgotStep}
                    setForgotStep={setForgotStep}
                    forgotForm={forgotForm}
                    setForgotForm={setForgotForm}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    onForgot={handleForgot}
                    onLogout={() => {
                      clearToken();
                      setToken(null);
                      setIsLoggedIn(false);
                      setScreen("home");
                      setProfile({ name: "", npm: "", faculty: "", email: "" });
                      setBalances({ total: 0, redeemed: 0, active: 0 });
                      setBottles({ small: 0, medium: 0, large: 0 });
                      emitToast("Berhasil keluar dari akun.", "info");
                    }}
                    onGoDashboard={() => setScreen("dashboard")}
                    onGoPairing={() => openPairing(activeMachineId ?? machines[0].id)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* BOTTOM NAV — mobile/tablet only */}
      <BottomNav
        active={screen}
        onGoHome={() => setScreen("home")}
        onGoDashboard={() => setScreen("dashboard")}
        onOpenPairing={() => openPairing(activeMachineId ?? machines[0].id)}
        onGoLeaderboard={() => setScreen("leaderboard")}
        onGoAccount={() => setScreen("account")}
      />

      {/* PAIRING SHEET */}
      <AnimatePresence>
        {pairingOpen && (
          <PairingSheet
            isLoggedIn={isLoggedIn}
            selectedMachine={machines.find((m) => m.id === pairingPreviewMachine) ?? null}
            machines={machines}
            pairingSession={pairingSession}
            remaining={pairingRemaining}
            onClose={() => { setPairingOpen(false); setPairingPreviewMachine(null); }}
            onPickMachine={beginPairingLock}
            onTapCard={tapCardToPair}
          />
        )}
      </AnimatePresence>

      {/* REDEEM SHEET */}
      <AnimatePresence>
        {redeemOpen && (
          <RedeemSheet
            activeBalance={balances.active}
            vouchers={vouchers ?? []}
            vouchersLoading={vouchersLoading}
            isSubmitting={isSubmitting}
            onClose={() => setRedeemOpen(false)}
            onRedeem={handleRedeem}
          />
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && <ToastBanner toast={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
