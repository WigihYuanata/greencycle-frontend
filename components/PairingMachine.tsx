"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Wifi,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  CreditCard,
  RefreshCcw,
  ChevronRight,
  Lock,
  XCircle,
  Leaf,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AppState = "idle" | "loading" | "polling" | "success" | "timeout";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const LOCATIONS = [
  { id: "BIN-FT-01", label: "Fakultas Teknik", sublabel: "Gedung A, Lt. 1", distance: "120 m", status: "online" },
  { id: "BIN-FEB-01", label: "Fak. Ekonomi & Bisnis", sublabel: "Lobby Utama", distance: "280 m", status: "online" },
  { id: "BIN-FISIP-01", label: "FISIP", sublabel: "Taman Tengah", distance: "400 m", status: "online" },
  { id: "BIN-FH-01", label: "Fakultas Hukum", sublabel: "Sayap Barat", distance: "550 m", status: "busy" },
  { id: "BIN-FIKOM-01", label: "FIKOM", sublabel: "Koridor Media", distance: "670 m", status: "online" },
  { id: "BIN-FAPERTA-01", label: "Fak. Pertanian", sublabel: "Lab Outdoor", distance: "810 m", status: "online" },
  { id: "BIN-FAD-01", label: "Fak. Arsitektur & Desain", sublabel: "Studio Lt. 2", distance: "950 m", status: "offline" },
];

const COUNTDOWN_SECONDS = 60;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "bg-emerald-400",
    busy: "bg-amber-400",
    offline: "bg-slate-500",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status] ?? "bg-slate-500"}`} />
  );
}

function CircularTimer({ progress, seconds }: { progress: number; seconds: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const isLow = seconds <= 15;

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      {/* Glow ring */}
      <div
        className={`absolute inset-0 rounded-full blur-xl opacity-20 transition-colors duration-700 ${
          isLow ? "bg-rose-500" : "bg-emerald-400"
        }`}
      />
      <svg className="-rotate-90" width={144} height={144} viewBox="0 0 144 144">
        {/* Track */}
        <circle
          cx={72} cy={72} r={radius}
          strokeWidth={6}
          className="fill-none stroke-white/10"
        />
        {/* Progress */}
        <circle
          cx={72} cy={72} r={radius}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          stroke={isLow ? "rgb(244 63 94)" : "rgb(52 211 153)"}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold tabular-nums leading-none ${isLow ? "text-rose-400" : "text-emerald-300"}`}>
          {String(seconds).padStart(2, "0")}
        </span>
        <span className="text-xs text-white/40 mt-0.5">detik</span>
      </div>
    </div>
  );
}

function PulsingNFCRing() {
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-emerald-400/40"
          initial={{ width: 48, height: 48, opacity: 0.6 }}
          animate={{ width: 112, height: 112, opacity: 0 }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeOut",
          }}
        />
      ))}
      <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center backdrop-blur-sm">
        <CreditCard className="w-6 h-6 text-emerald-300" />
      </div>
    </div>
  );
}

// ─── State Screens ─────────────────────────────────────────────────────────────

function IdleScreen({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4"
    >
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance leading-tight">
          Hubungkan Kartu KTM
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Pilih lokasi Smart BIN terdekat untuk mulai mendaur ulang.
        </p>
      </div>

      {/* Location Cards */}
      <div className="flex flex-col gap-2.5">
        {LOCATIONS.map((loc) => {
          const isDisabled = loc.status === "offline";
          return (
            <motion.button
              key={loc.id}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              onClick={() => !isDisabled && onSelect(loc.id)}
              disabled={isDisabled}
              className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 group
                ${isDisabled
                  ? "opacity-40 cursor-not-allowed border-border bg-muted/30"
                  : "border-border bg-card hover:border-emerald-400/40 hover:bg-white/5 active:bg-white/10"
                }
              `}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200
                ${isDisabled ? "bg-muted/50" : "bg-emerald-400/10 group-hover:bg-emerald-400/20"}`}>
                <MapPin className={`w-4.5 h-4.5 ${isDisabled ? "text-muted-foreground" : "text-emerald-300"}`} />
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">{loc.label}</span>
                  <StatusDot status={loc.status} />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-muted-foreground truncate">{loc.sublabel}</span>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="text-xs text-muted-foreground">{loc.distance}</span>
                </div>
                <div className="text-[10px] mt-1 font-mono text-muted-foreground/50 tracking-widest">{loc.id}</div>
              </div>

              {/* Arrow */}
              {!isDisabled && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-emerald-400/60 flex-shrink-0 transition-colors" />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function LoadingScreen({ locationId }: { locationId: string }) {
  const loc = LOCATIONS.find((l) => l.id === locationId);
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-6 py-12"
    >
      {/* Spinner ring */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-400/5 border border-emerald-400/15" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <Lock className="w-8 h-8 text-emerald-400/70" />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-base font-semibold text-foreground">Mengamankan Sesi</p>
        <p className="text-sm text-muted-foreground">Menghubungkan ke {loc?.label ?? locationId}…</p>
      </div>

      {/* Animated dots progress */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400/60"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function PollingScreen({
  locationId,
  seconds,
  onSimulateSuccess,
  onCancel,
}: {
  locationId: string;
  seconds: number;
  onSimulateSuccess: () => void;
  onCancel: () => void;
}) {
  const loc = LOCATIONS.find((l) => l.id === locationId);
  const progress = seconds / COUNTDOWN_SECONDS;
  const isLow = seconds <= 15;

  return (
    <motion.div
      key="polling"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-5"
    >
      {/* Security badge */}
      <div className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-400/8 border border-emerald-400/20">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p className="text-[11px] leading-snug text-emerald-300/80">
          Sesi ini dienkripsi dan mesin akan dikunci eksklusif untuk Anda.
        </p>
      </div>

      {/* Machine ID */}
      <div className="text-center">
        <span className="text-[11px] font-mono tracking-widest text-muted-foreground/60 uppercase">{locationId}</span>
        <p className="text-sm text-muted-foreground mt-0.5">{loc?.label}</p>
      </div>

      {/* Circular timer */}
      <CircularTimer progress={progress} seconds={seconds} />

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-700 ${isLow ? "bg-rose-400" : "bg-emerald-400"}`}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </div>

      {/* NFC instruction */}
      <div className="flex flex-col items-center gap-4 py-2">
        <PulsingNFCRing />
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-foreground">Tap KTM Anda</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Silakan tap kartu Anda di sensor mesin.
          </p>
        </div>
      </div>

      {/* Exclusive lock indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/20">
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] text-muted-foreground">Mesin dikunci eksklusif</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Actions */}
      <div className="w-full flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors duration-200"
        >
          Batalkan
        </button>
        <button
          onClick={onSimulateSuccess}
          className="flex-1 py-3 rounded-2xl bg-emerald-400/90 text-emerald-950 font-semibold text-sm hover:bg-emerald-400 transition-colors duration-200 shadow-lg shadow-emerald-400/20"
        >
          Simulasi Tap ✓
        </button>
      </div>
    </motion.div>
  );
}

function SuccessScreen({ locationId, onReset }: { locationId: string; onReset: () => void }) {
  const loc = LOCATIONS.find((l) => l.id === locationId);
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 22 }}
      className="flex flex-col items-center gap-6 py-10"
    >
      {/* Check icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl scale-125" />
        <motion.div
          className="relative w-24 h-24 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* Text */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-xl font-bold text-foreground text-balance leading-tight">
          KTM Berhasil Terhubung!
        </h2>
        <p className="text-sm text-muted-foreground">Anda siap mendaur ulang.</p>
        {loc && (
          <p className="text-xs font-mono text-muted-foreground/50 tracking-widest mt-1">{locationId}</p>
        )}
      </motion.div>

      {/* Stat pill */}
      <motion.div
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-400/10 border border-emerald-400/20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
      >
        <Leaf className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs text-emerald-300 font-medium">Smart BIN siap menerima sampah Anda</span>
      </motion.div>

      {/* Reset */}
      <motion.button
        onClick={onReset}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.97 }}
      >
        <RefreshCcw className="w-3.5 h-3.5" />
        Hubungkan lagi
      </motion.button>
    </motion.div>
  );
}

function TimeoutScreen({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      key="timeout"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 22 }}
      className="flex flex-col items-center gap-6 py-10"
    >
      {/* Error icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl scale-125" />
        <motion.div
          className="relative w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        >
          <XCircle className="w-10 h-10 text-rose-400" strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* Text */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-xl font-bold text-foreground text-balance">Sesi Berakhir</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Waktu habis sebelum kartu berhasil ditap. Silakan coba kembali.
        </p>
      </motion.div>

      {/* Detail pill */}
      <motion.div
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-500/8 border border-rose-500/20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
      >
        <Clock className="w-3.5 h-3.5 text-rose-400" />
        <span className="text-xs text-rose-300/80">Sesi timeout setelah 60 detik</span>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="w-full flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.48 }}
      >
        <button
          onClick={onReset}
          className="flex-1 py-3.5 rounded-2xl bg-emerald-400/90 text-emerald-950 font-semibold text-sm hover:bg-emerald-400 transition-colors duration-200 shadow-lg shadow-emerald-400/20 flex items-center justify-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Coba Lagi
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PairingMachine() {
  const [state, setState] = useState<AppState>("idle");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Simulate server lock acquisition
  const handleSelect = useCallback((id: string) => {
    setSelectedLocation(id);
    setState("loading");

    setTimeout(() => {
      setSeconds(COUNTDOWN_SECONDS);
      setState("polling");
    }, 1800);
  }, []);

  // Countdown logic
  useEffect(() => {
    if (state !== "polling") return;

    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearTimer();
          setState("timeout");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return clearTimer;
  }, [state, clearTimer]);

  const handleSuccess = useCallback(() => {
    clearTimer();
    setState("success");
  }, [clearTimer]);

  const handleReset = useCallback(() => {
    clearTimer();
    setSelectedLocation("");
    setSeconds(COUNTDOWN_SECONDS);
    setState("idle");
  }, [clearTimer]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* App header bar */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-400/15 border border-emerald-400/25 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">GreenCycle</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-muted-foreground">Terenkripsi</span>
          </div>
        </header>

        {/* Card shell */}
        <div className="rounded-3xl border border-border bg-card backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
          {/* Top status bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
            <div className="flex items-center gap-1.5">
              <Loader2
                className={`w-3.5 h-3.5 transition-all duration-300 ${
                  state === "loading" ? "text-amber-400 animate-spin" : "text-transparent"
                }`}
              />
              <span className="text-[11px] font-mono text-muted-foreground/60 tracking-widest uppercase">
                {state === "idle" && "Pilih Lokasi"}
                {state === "loading" && "Memproses..."}
                {state === "polling" && "Menunggu Tap"}
                {state === "success" && "Terhubung"}
                {state === "timeout" && "Sesi Berakhir"}
              </span>
            </div>
            <div className="flex gap-1">
              {(["idle", "loading", "polling", "success"] as AppState[]).map((s, i) => (
                <div
                  key={s}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-400 ${
                    ["idle", "loading", "polling", "success"].indexOf(state) >= i
                      ? state === "timeout" && i === 3
                        ? "bg-rose-400"
                        : "bg-emerald-400"
                      : "bg-white/15"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="px-5 py-5 min-h-64">
            <AnimatePresence mode="wait">
              {state === "idle" && <IdleScreen key="idle" onSelect={handleSelect} />}
              {state === "loading" && <LoadingScreen key="loading" locationId={selectedLocation} />}
              {state === "polling" && (
                <PollingScreen
                  key="polling"
                  locationId={selectedLocation}
                  seconds={seconds}
                  onSimulateSuccess={handleSuccess}
                  onCancel={handleReset}
                />
              )}
              {state === "success" && <SuccessScreen key="success" locationId={selectedLocation} onReset={handleReset} />}
              {state === "timeout" && <TimeoutScreen key="timeout" onReset={handleReset} />}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-muted-foreground/40 mt-5 tracking-wide">
          GreenCycle Smart BIN System · v2.4.1
        </p>
      </div>
    </div>
  );
}
