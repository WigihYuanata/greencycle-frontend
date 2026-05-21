"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, Bell } from "lucide-react";

import {
  Screen, AuthMode, Machine, Toast, ToastTone, PairingSession,
  MACHINES, LEADERBOARD,
  cx, formatCompact, isSixDigitPin, isValidNpm, isValidCampusEmail,
} from "@/lib/gc-data";
import { useCountUp } from "@/hooks/use-count-up";

import HomeScreen from "@/components/gc/HomeScreen";
import DashboardScreen from "@/components/gc/DashboardScreen";
import LeaderboardScreen from "@/components/gc/LeaderboardScreen";
import AccountScreen from "@/components/gc/AccountScreen";
import PairingSheet from "@/components/gc/PairingSheet";
import RedeemSheet from "@/components/gc/RedeemSheet";
import BottomNav from "@/components/gc/BottomNav";
import ToastBanner from "@/components/gc/ToastBanner";

export default function GreenCycleApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [now, setNow] = useState(Date.now());

  const [profile, setProfile] = useState({
    name: "Dimas Maulana",
    npm: "2301234522",
    faculty: "Fakultas Teknik",
    email: "dimas@student.upnjatim.ac.id",
  });

  const [balances, setBalances] = useState({ total: 2450, redeemed: 0, active: 2450 });
  const [bottles] = useState({ small: 96, medium: 24, large: 8 });
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
  const [redeemForm, setRedeemForm] = useState({ provider: "", account: "", owner: "", amount: "", pin: "" });

  const heroBotol = useCountUp(128450);
  const heroMembers = useCountUp(2350);
  const heroPoints = useCountUp(845600);

  const connectedMachine = useMemo(
    () => machines.find((m) => m.id === activeMachineId) ?? null,
    [machines, activeMachineId],
  );

  const pairingRemaining = pairingSession
    ? Math.max(0, Math.ceil((pairingSession.expiresAt - now) / 1000))
    : 0;

  const leaderboard = useMemo(() => {
    const factor = leaderScope === "minggu" ? 1 : leaderScope === "bulan" ? 1.12 : 1.24;
    return LEADERBOARD.map((item) => ({
      ...item,
      points: Math.round(item.points * factor),
    })).sort((a, b) => b.points - a.points);
  }, [leaderScope]);

  const recentActivities = [
    { title: "Setoran 4 botol sedang", meta: "Smart BIN Fakultas Teknik", points: 20, time: "10 menit lalu", kind: "green" as const },
    { title: "Pairing kartu berhasil", meta: "BIN-FT-01", points: 0, time: "Hari ini", kind: "mint" as const },
    { title: "Top up poin otomatis", meta: "Setelah transaksi masuk", points: 30, time: "2 jam lalu", kind: "slate" as const },
  ];

  const impactCards = [
    { label: "Botol didaur ulang", value: "128.450+", helper: "Kontribusi mahasiswa yang terus bertumbuh." },
    { label: "Air lebih terjaga", value: "256.800 L", helper: "Efek positif dari pengelolaan botol yang konsisten." },
    { label: "Emisi berkurang", value: "3.145 kg", helper: "Dampak kampus yang bisa diukur dan dilihat." },
    { label: "Fakultas terlibat", value: "7", helper: "Setiap area memiliki Smart BIN aktif." },
  ];

  const liveFacts = [
    { label: "Smart BIN aktif", value: "7" },
    { label: "Kontributor aktif", value: "2.350+" },
    { label: "Poin ditukar", value: "845.600+" },
  ];

  const activeCount = machines.filter((m) => m.status === "active" || m.status === "connected").length;
  const connectedCount = machines.filter((m) => m.status === "connected").length;

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

  const emitToast = (text: string, tone: ToastTone = "success") => setToast({ text, tone });

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
      prev.map((m) =>
        m.id === machineId ? { ...m, status: "pairing", owner: profile.name } : m,
      ),
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

  const handleLogin = () => {
    if (!isValidNpm(loginForm.npm)) { emitToast("NPM harus berupa 8–20 digit angka.", "warning"); return; }
    if (!isSixDigitPin(loginForm.pin)) { emitToast("PIN login harus 6 digit angka.", "warning"); return; }
    setIsLoggedIn(true);
    setScreen("dashboard");
    emitToast("Berhasil masuk. Selamat datang kembali.", "success");
  };

  const handleRegister = () => {
    if (!isValidNpm(registerForm.npm)) { emitToast("NPM harus berupa 8–20 digit angka.", "warning"); return; }
    if (!registerForm.name.trim()) { emitToast("Nama lengkap wajib diisi.", "warning"); return; }
    if (!registerForm.faculty) { emitToast("Fakultas wajib dipilih.", "warning"); return; }
    if (!isValidCampusEmail(registerForm.email)) { emitToast("Gunakan email kampus @student.upnjatim.ac.id.", "warning"); return; }
    if (!isSixDigitPin(registerForm.pin) || registerForm.pin !== registerForm.confirmPin) {
      emitToast("PIN harus 6 digit dan konfirmasi harus sama.", "warning"); return;
    }
    setProfile({ name: registerForm.name.trim(), npm: registerForm.npm.trim(), faculty: registerForm.faculty, email: registerForm.email.trim() });
    setIsLoggedIn(true);
    setScreen("dashboard");
    emitToast("Akun berhasil dibuat dan siap digunakan.", "success");
  };

  const handleForgot = () => {
    if (forgotStep === 1) {
      if (!isValidNpm(forgotForm.npm)) { emitToast("Masukkan NPM yang valid.", "warning"); return; }
      setForgotStep(2);
      emitToast("OTP verifikasi dikirim.", "info");
      return;
    }
    if (!/^\d{6}$/.test(forgotForm.otp)) { emitToast("OTP harus 6 digit angka.", "warning"); return; }
    if (!isSixDigitPin(forgotForm.pin) || forgotForm.pin !== forgotForm.confirmPin) {
      emitToast("PIN baru harus 6 digit dan konfirmasi harus sama.", "warning"); return;
    }
    emitToast("PIN berhasil diperbarui.", "success");
    setAuthMode("login");
    setForgotStep(1);
    setForgotForm({ npm: "", otp: "", pin: "", confirmPin: "" });
  };

  const handleRedeem = () => {
    const amount = Number(redeemForm.amount);
    if (!redeemForm.provider) { emitToast("Pilih provider penarikan.", "warning"); return; }
    if (!redeemForm.account.trim()) { emitToast("Nomor rekening / no HP wajib diisi.", "warning"); return; }
    if (!redeemForm.owner.trim()) { emitToast("Nama rekening wajib diisi.", "warning"); return; }
    if (!Number.isInteger(amount) || amount < 100 || amount > balances.active) {
      emitToast("Jumlah penarikan minimal 100 dan tidak boleh melebihi saldo aktif.", "warning"); return;
    }
    if (!isSixDigitPin(redeemForm.pin)) { emitToast("PIN konfirmasi harus 6 digit.", "warning"); return; }
    setBalances((p) => ({ total: p.total, redeemed: p.redeemed + amount, active: p.active - amount }));
    setRedeemOpen(false);
    setRedeemForm({ provider: "", account: "", owner: "", amount: "", pin: "" });
    emitToast(`Penarikan ${amount} poin diajukan.`, "success");
  };

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

  return (
    <div className="min-h-screen flex justify-center bg-[#f5f8f6]">
      <div
        className="relative w-full max-w-[480px] min-h-screen bg-white/80 backdrop-blur-xl shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_30px_80px_rgba(15,23,42,0.10)] overflow-hidden pb-28"
        role="application"
        aria-label="GreenCycle mobile web app"
      >
        {/* ambient blobs */}
        <div className="pointer-events-none absolute top-[74px] right-[-60px] w-[180px] h-[180px] rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-[260px] left-[-80px] w-[220px] h-[220px] rounded-full bg-green-400/[0.07] blur-2xl" />

        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-[17px] bg-[#f8fbf9]/90 backdrop-blur-xl border-b border-black/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl grid place-items-center bg-gradient-to-b from-[#dcfce7]/95 to-[#ecfdf5]/80 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.10)] text-teal-700">
              <Leaf className="w-[18px] h-[18px]" />
            </div>
            <div>
              <div className="text-[1.08rem] font-black tracking-[-0.02em] leading-none text-slate-900">GreenCycle</div>
              <div className="text-[0.72rem] text-slate-500 mt-[3px] leading-none whitespace-nowrap">Smart recycling ecosystem</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              aria-label="Notifikasi"
              className="w-10 h-10 rounded-[14px] border-0 bg-white/86 grid place-items-center shadow-[0_8px_24px_rgba(15,23,42,0.06)] text-slate-700 active:scale-[0.98] transition-transform"
            >
              <Bell className="w-[17px] h-[17px]" />
            </button>
            <span className={cx(
              "px-[14px] py-[10px] rounded-full text-[0.75rem] font-bold border",
              isLoggedIn
                ? "bg-gradient-to-b from-teal-500/[0.14] to-green-400/[0.08] border-emerald-500/[0.16] text-teal-700"
                : "bg-white/86 border-black/[0.08] text-slate-700",
            )}>
              {isLoggedIn ? "Akun aktif" : "Buka di web"}
            </span>
          </div>
        </header>

        {/* MAIN */}
        <main className="px-[14px] pt-[10px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {screen === "home" && (
                <HomeScreen
                  heroBotol={heroBotol}
                  heroMembers={heroMembers}
                  heroPoints={heroPoints}
                  liveFacts={liveFacts}
                  heroFocusLabel={heroFocusLabel}
                  heroFocusValue={heroFocusValue}
                  currentMachine={currentHeroMachine}
                  connectedCount={connectedCount}
                  activeCount={activeCount}
                  machines={machines}
                  activities={recentActivities}
                  impactCards={impactCards}
                  leaderboard={leaderboard}
                  onGoDashboard={() => setScreen("dashboard")}
                  onGoPairing={() => openPairing(pairingPreviewMachine ?? currentHeroMachine?.id)}
                  onGoLeaderboard={() => setScreen("leaderboard")}
                  onGoAccount={() => setScreen("account")}
                  onMachineSelect={(id) => { setPairingPreviewMachine(id); openPairing(id); }}
                />
              )}
              {screen === "dashboard" && (
                <DashboardScreen
                  profile={profile}
                  balances={balances}
                  bottles={bottles}
                  connectedMachine={connectedMachine}
                  machines={machines}
                  activities={recentActivities}
                  onOpenPairing={() => openPairing(activeMachineId ?? machines[0].id)}
                  onOpenRedeem={() => {
                    if (!isLoggedIn) { emitToast("Masuk dulu untuk melakukan penarikan.", "info"); setScreen("account"); setAuthMode("login"); return; }
                    setRedeemOpen(true);
                  }}
                  onGoLeaderboard={() => setScreen("leaderboard")}
                  onGoAccount={() => setScreen("account")}
                />
              )}
              {screen === "leaderboard" && (
                <LeaderboardScreen
                  scope={leaderScope}
                  setScope={setLeaderScope}
                  leaderboard={leaderboard}
                  onGoDashboard={() => setScreen("dashboard")}
                  onGoPairing={() => openPairing(activeMachineId ?? machines[0].id)}
                />
              )}
              {screen === "account" && (
                <AccountScreen
                  isLoggedIn={isLoggedIn}
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
                  onLogout={() => { setIsLoggedIn(false); setScreen("home"); emitToast("Berhasil keluar dari akun.", "info"); }}
                  onGoDashboard={() => setScreen("dashboard")}
                  onGoPairing={() => openPairing(activeMachineId ?? machines[0].id)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* BOTTOM NAV */}
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
              form={redeemForm}
              setForm={setRedeemForm}
              onClose={() => setRedeemOpen(false)}
              onSubmit={handleRedeem}
            />
          )}
        </AnimatePresence>

        {/* TOAST */}
        <AnimatePresence>
          {toast && <ToastBanner toast={toast} onDismiss={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
