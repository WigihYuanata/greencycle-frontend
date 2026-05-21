"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ShieldCheck, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import { Machine, PairingSession, cx } from "@/lib/gc-data";

type Props = {
  isLoggedIn: boolean;
  selectedMachine: Machine | null;
  machines: Machine[];
  pairingSession: PairingSession | null;
  remaining: number;
  onClose: () => void;
  onPickMachine: (machineId: string) => void;
  onTapCard: () => void;
};

const TOTAL_SECONDS = 60;

export default function PairingSheet({
  isLoggedIn, selectedMachine, machines, pairingSession,
  remaining, onClose, onPickMachine, onTapCard,
}: Props) {
  const isWaiting = pairingSession?.stage === "waiting";
  const isSuccess = pairingSession?.stage === "success";
  const progress = isWaiting ? remaining / TOTAL_SECONDS : 0;
  const circumference = 2 * Math.PI * 44; // r=44

  const stage: "idle" | "waiting" | "success" =
    isSuccess ? "success" : isWaiting ? "waiting" : "idle";

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      {/* backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={stage !== "waiting" ? onClose : undefined}
      />

      {/* sheet */}
      <motion.div
        className="relative z-10 w-full max-w-lg bg-background border border-border rounded-t-3xl lg:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden" aria-hidden>
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pb-6">
          {/* header */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Pairing</p>
              <h2 className="text-lg font-bold text-foreground mt-0.5">Hubungkan Kartu KTM</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pilih lokasi Smart BIN terdekat untuk mulai mendaur ulang.
              </p>
            </div>
            <button
              onClick={stage !== "waiting" ? onClose : undefined}
              aria-label="Tutup"
              className={cx(
                "w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors flex-shrink-0 mt-1",
                stage === "waiting" ? "opacity-30 cursor-not-allowed" : "",
              )}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* not logged in alert */}
          {!isLoggedIn && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-400">Masuk dulu untuk memulai pairing kartu.</p>
            </div>
          )}

          {/* ── STAGE: WAITING ── */}
          {stage === "waiting" && (
            <div className="flex flex-col items-center gap-5 py-4">
              {/* countdown circle */}
              <div className="relative w-28 h-28">
                {/* pulsing NFC rings */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping"
                    style={{ animationDelay: `${i * 0.3}s`, animationDuration: "1.5s" }}
                  />
                ))}
                {/* SVG progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4" className="text-secondary" />
                  <circle
                    cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-1000"
                  />
                </svg>
                {/* center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{remaining}</span>
                  <span className="text-[10px] text-muted-foreground">detik</span>
                </div>
              </div>

              <div className="text-center flex flex-col gap-1">
                <p className="text-sm font-bold text-foreground">Silakan tap kartu Anda di sensor mesin.</p>
                <p className="text-xs text-muted-foreground">
                  {selectedMachine
                    ? `${selectedMachine.label} · ${selectedMachine.id}`
                    : "Mesin terkunci eksklusif untuk sesi ini."}
                </p>
              </div>

              {/* security badge */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60 border border-border w-full">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Sesi ini dienkripsi dan mesin akan dikunci eksklusif untuk Anda.
                </p>
              </div>

              {/* progress bar */}
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <button
                onClick={onTapCard}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20"
              >
                Tap KTM Sekarang
              </button>
            </div>
          )}

          {/* ── STAGE: SUCCESS ── */}
          {stage === "success" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">KTM Berhasil Terhubung!</p>
                <p className="text-sm text-muted-foreground">Anda siap mendaur ulang.</p>
              </div>
            </div>
          )}

          {/* ── STAGE: IDLE ── */}
          {stage === "idle" && (
            <div className="flex flex-col gap-4">
              {/* machine picker */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs font-bold text-foreground">Pilih lokasi mesin</p>
                </div>
                {machines.map((machine) => (
                  <button
                    key={machine.id}
                    onClick={() => machine.status !== "pairing" && onPickMachine(machine.id)}
                    disabled={machine.status === "pairing"}
                    className={cx(
                      "flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-left transition-all duration-150 active:scale-[0.99]",
                      selectedMachine?.id === machine.id
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : machine.status === "pairing"
                          ? "bg-secondary/30 border-border opacity-50 cursor-not-allowed"
                          : "bg-secondary/50 border-border hover:border-emerald-500/30 hover:bg-emerald-500/5",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{machine.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{machine.area}</p>
                    </div>
                    <span className={cx(
                      "text-[10px] font-semibold flex-shrink-0",
                      machine.status === "active" ? "text-emerald-400" : machine.status === "pairing" ? "text-amber-400" : "text-sky-400",
                    )}>
                      {machine.status === "active" ? "Siap" : machine.status === "pairing" ? "Sibuk" : "Terhubung"}
                    </span>
                  </button>
                ))}
              </div>

              {/* security note */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60 border border-border">
                <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Sesi ini dienkripsi dan mesin akan dikunci eksklusif untuk Anda.
                </p>
              </div>

              <button
                onClick={() => selectedMachine && onPickMachine(selectedMachine.id)}
                disabled={!selectedMachine || !isLoggedIn}
                className={cx(
                  "w-full h-12 rounded-2xl font-bold text-sm transition-all duration-150",
                  selectedMachine && isLoggedIn
                    ? "bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-secondary border border-border text-muted-foreground cursor-not-allowed",
                )}
              >
                Mulai Pairing
              </button>

              <button
                onClick={onClose}
                className="w-full h-10 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 text-foreground font-semibold text-sm transition-all duration-150"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
