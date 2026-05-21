"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ShieldCheck, Wifi, CheckCircle, AlertCircle, MapPin } from "lucide-react";
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
  const isTimedOut = pairingSession === null && !isSuccess;
  const progress = isWaiting ? remaining / TOTAL_SECONDS : 0;
  const circumference = 2 * Math.PI * 44; // r=44

  const stage: "idle" | "waiting" | "success" =
    isSuccess ? "success" : isWaiting ? "waiting" : "idle";

  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Pairing kartu KTM">
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 240 }}
        className="relative w-full max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-card border-t border-x border-border flex flex-col"
      >
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 flex-shrink-0">
          <div>
            <div className="text-[0.6rem] font-black uppercase tracking-widest text-emerald-400">Hubungkan Kartu KTM</div>
            <h2 className="text-lg font-black text-foreground tracking-tight mt-0.5">Pairing Smart BIN</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[32ch]">
              Pilih lokasi Smart BIN terdekat untuk mulai mendaur ulang.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* not logged in alert */}
        {!isLoggedIn && (
          <div className="mx-5 mb-4 flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Masuk dulu untuk memulai pairing kartu.
          </div>
        )}

        <div className="flex flex-col gap-5 px-5 pb-8">
          {/* ── STAGE: WAITING / SUCCESS ── */}
          <AnimatePresence mode="wait">
            {stage === "waiting" && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-5 py-4"
              >
                {/* countdown circle */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* pulsing NFC rings */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-emerald-500/30"
                      animate={{ scale: [1, 1.3 + i * 0.12], opacity: [0.6, 0] }}
                      transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
                    />
                  ))}
                  {/* SVG progress ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" className="text-secondary" />
                    <circle
                      cx="50" cy="50" r="44" fill="none"
                      stroke="currentColor" strokeWidth="3"
                      className="text-emerald-500 transition-all duration-1000"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - progress)}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* center content */}
                  <div className="relative z-10 flex flex-col items-center">
                    <Wifi className="w-5 h-5 text-emerald-400 mb-1" />
                    <div className="text-3xl font-black text-foreground tabular-nums leading-none">{remaining}</div>
                    <div className="text-[0.6rem] text-muted-foreground font-semibold mt-0.5">detik</div>
                  </div>
                </div>

                {/* instruction */}
                <div className="text-center flex flex-col gap-1.5">
                  <div className="text-base font-black text-foreground">Silakan tap kartu Anda di sensor mesin.</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {selectedMachine
                      ? `${selectedMachine.label} · ${selectedMachine.id}`
                      : "Mesin terkunci eksklusif untuk sesi ini."}
                  </div>
                </div>

                {/* security badge */}
                <div className="w-full flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-bold text-foreground">Sesi ini dienkripsi</span> dan mesin akan dikunci eksklusif untuk Anda.
                  </div>
                </div>

                {/* progress bar */}
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${progress * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>

                <button
                  onClick={onTapCard}
                  className="w-full h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/25"
                >
                  Tap KTM Sekarang
                </button>
              </motion.div>
            )}

            {stage === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center gap-4 py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 16, stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <div className="text-center">
                  <div className="text-lg font-black text-foreground">KTM Berhasil Terhubung!</div>
                  <div className="text-sm text-emerald-400 font-semibold mt-1">Anda siap mendaur ulang.</div>
                </div>
              </motion.div>
            )}

            {stage === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                {/* machine picker */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Pilih lokasi mesin
                  </div>
                  <div className="flex flex-col gap-2">
                    {machines.map((machine) => (
                      <button
                        key={machine.id}
                        onClick={() => onPickMachine(machine.id)}
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
                          <div className="text-sm font-bold text-foreground truncate">{machine.label}</div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">{machine.area}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={cx(
                            "text-[0.6rem] font-bold px-2 py-0.5 rounded-full",
                            machine.status === "active" && "bg-emerald-500/10 text-emerald-400",
                            machine.status === "pairing" && "bg-amber-500/10 text-amber-400",
                            machine.status === "connected" && "bg-cyan-500/10 text-cyan-400",
                          )}>
                            {machine.status === "active" ? "Siap" : machine.status === "pairing" ? "Sibuk" : "Terhubung"}
                          </span>
                          <span className={cx(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            machine.status === "active" && "bg-emerald-400",
                            machine.status === "pairing" && "bg-amber-400 animate-pulse",
                            machine.status === "connected" && "bg-cyan-400",
                          )} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* lock card preview */}
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-secondary/50 border border-border">
                  <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground flex-shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground">
                      {selectedMachine ? selectedMachine.label : "Pilih mesin untuk memulai"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {selectedMachine
                        ? `${selectedMachine.id} · Klik tombol di bawah`
                        : "Pilih Smart BIN untuk mengunci sesi 60 detik"}
                    </div>
                  </div>
                </div>

                {/* security note */}
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-bold text-foreground">Sesi ini dienkripsi</span> dan mesin akan dikunci eksklusif untuk Anda.
                  </div>
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
              </motion.div>
            )}
          </AnimatePresence>

          {stage !== "waiting" && stage !== "success" && (
            <button
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 active:scale-[0.98] text-foreground font-semibold text-sm transition-all duration-150"
            >
              Tutup
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
