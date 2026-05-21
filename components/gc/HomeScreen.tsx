"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, Zap, ChevronRight, Users, Recycle, Wallet,
  Trophy, TrendingUp, ArrowRight, CheckCircle2, Circle,
} from "lucide-react";
import {
  Machine, Activity, Leader,
  HOME_QUESTIONS, cx, formatCompact, formatPoints,
} from "@/lib/gc-data";

type Props = {
  heroBotol: number;
  heroMembers: number;
  heroPoints: number;
  liveFacts: Array<{ label: string; value: string }>;
  heroFocusLabel: string;
  heroFocusValue: string;
  currentMachine: Machine | undefined;
  connectedCount: number;
  activeCount: number;
  machines: Machine[];
  activities: Activity[];
  impactCards: Array<{ label: string; value: string; helper: string }>;
  leaderboard: Leader[];
  onGoDashboard: () => void;
  onGoPairing: () => void;
  onGoLeaderboard: () => void;
  onGoAccount: () => void;
  onMachineSelect: (machineId: string) => void;
};

function StatusDot({ status }: { status: Machine["status"] }) {
  return (
    <span
      className={cx(
        "inline-block w-2.5 h-2.5 rounded-full flex-shrink-0",
        status === "active" && "bg-emerald-400",
        status === "pairing" && "bg-amber-400 animate-pulse",
        status === "connected" && "bg-cyan-400",
      )}
    />
  );
}

export default function HomeScreen({
  heroBotol, heroMembers, heroPoints,
  heroFocusLabel, heroFocusValue,
  currentMachine, connectedCount, activeCount,
  machines, activities, impactCards, leaderboard,
  onGoDashboard, onGoPairing, onGoLeaderboard, onGoAccount, onMachineSelect,
}: Props) {
  const topThree = leaderboard.slice(0, 3);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(
      () => setQuestionIndex((prev) => (prev + 1) % HOME_QUESTIONS.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, []);

  const steps = [
    { title: "Daftar & masuk", text: "Gunakan akun kampus untuk membuat profil dan PIN 6 digit." },
    { title: "Hubungkan kartu", text: "Pilih Smart BIN terdekat lalu tempelkan KTM sekali saja." },
    { title: "Setor botol", text: "Masukkan botol dan biarkan sistem menghitung otomatis." },
    { title: "Pantau poin", text: "Saldo aktif dan riwayat langsung terlihat di dashboard." },
  ];

  return (
    <div className="flex flex-col gap-10 pb-4">
      {/* ── HERO ── */}
      <section className="flex flex-col gap-5 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4"
        >
          <span className="inline-flex items-center gap-2 self-start px-3.5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
            <Leaf className="w-3.5 h-3.5" />
            Gerakan kampus yang nyata dan terukur
          </span>

          <h1 className="text-[2.6rem] leading-[0.95] font-black tracking-tight text-balance text-foreground">
            Daur ulang botol plastik jadi kontribusi yang terasa.
          </h1>

          <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
            GreenCycle membantu mahasiswa mengelola botol plastik lewat web mobile yang simpel,
            cepat, dan nyaman dipakai langsung dari browser HP.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onGoAccount}
              className="flex items-center justify-center gap-2 h-13 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/25"
            >
              Mulai Sekarang
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGoDashboard}
              className="flex items-center justify-center h-13 px-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] text-foreground font-semibold text-sm transition-all duration-150"
            >
              Lihat Dashboard
            </button>
          </div>
        </motion.div>

        {/* stat pills */}
        <div className="flex flex-col gap-2.5">
          {[
            { icon: Users, label: "Kontributor aktif", value: `${formatCompact(heroMembers)}+` },
            { icon: Recycle, label: "Botol terkumpul", value: `${formatCompact(heroBotol)}+` },
            { icon: Wallet, label: "Poin didapat", value: `${formatCompact(heroPoints)}+` },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground font-semibold">{label}</div>
                <div className="text-base font-black tracking-tight text-foreground mt-0.5">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HERO CARD (visual artboard) ── */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl bg-card border border-border p-5 flex flex-col gap-4"
      >
        {/* accent blob */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-black text-foreground border border-border">
              DM
            </div>
            <div>
              <div className="text-sm font-bold text-foreground leading-tight">Selamat datang kembali</div>
              <div className="text-xs text-muted-foreground mt-0.5">Kontribusimu minggu ini naik 18%</div>
            </div>
          </div>
          <span className="text-[0.65rem] font-black tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Web mobile
          </span>
        </div>

        {/* machine preview */}
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-3 items-stretch">
          <div className="relative min-h-[200px] rounded-2xl bg-secondary/60 border border-border overflow-hidden flex items-end justify-center p-3">
            {/* machine illustration */}
            <div className="w-[90px] h-[180px] rounded-2xl bg-gradient-to-b from-emerald-900/80 to-slate-900 border border-emerald-700/40 flex flex-col items-center p-2.5 shadow-xl">
              <div className="text-[0.5rem] font-black tracking-widest uppercase text-emerald-500/70 w-full">GreenCycle</div>
              <div className="w-full mt-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex-1 flex flex-col justify-center">
                <div className="text-[0.55rem] font-bold text-emerald-400 leading-tight">{currentMachine?.label}</div>
                <div className="text-[0.5rem] text-slate-500 mt-1 leading-tight">{currentMachine?.area}</div>
              </div>
              <div className="w-full mt-2 h-4 rounded-md bg-slate-800/80 border border-slate-700/50" />
              <div className="w-[60px] h-[52px] mt-2 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-500 text-base font-black">
                ♻
              </div>
            </div>
            {/* floating chips */}
            <div className="absolute top-2 left-2 bg-card/90 border border-border rounded-xl p-2 backdrop-blur-sm">
              <div className="text-[0.55rem] text-muted-foreground font-semibold">Status kartu</div>
              <div className="text-[0.65rem] font-black text-foreground leading-tight mt-0.5">{heroFocusValue}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex-1 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex flex-col justify-between">
              <div className="text-[0.65rem] text-emerald-400 font-bold uppercase tracking-wide">Saldo aktif</div>
              <div>
                <div className="text-xl font-black text-foreground tracking-tight">2.450</div>
                <div className="text-[0.6rem] text-muted-foreground mt-0.5">128 botol · Top 12%</div>
              </div>
            </div>
            <div className="flex-1 rounded-2xl bg-card border border-border p-3 flex flex-col justify-between">
              <div className="text-[0.65rem] text-muted-foreground font-bold uppercase tracking-wide">Smart BIN</div>
              <div>
                <div className="text-xl font-black text-foreground tracking-tight">{connectedCount}/{activeCount}</div>
                <div className="text-[0.6rem] text-muted-foreground mt-0.5">Mesin aktif</div>
              </div>
            </div>
          </div>
        </div>

        {/* live strip */}
        <div className="flex items-center gap-px overflow-hidden rounded-2xl border border-border">
          {[
            { label: "Smart BIN aktif", value: "7" },
            { label: "Kontributor aktif", value: "2.350+" },
            { label: "Poin ditukar", value: "845.600+" },
          ].map((fact, i) => (
            <div
              key={fact.label}
              className={cx(
                "flex-1 flex flex-col items-center py-2.5 px-2 gap-0.5",
                i === 0 ? "bg-secondary/60" : i === 1 ? "bg-secondary/40" : "bg-secondary/60",
              )}
            >
              <div className="text-[0.6rem] text-muted-foreground font-semibold text-center leading-tight">{fact.label}</div>
              <div className="text-xs font-black text-foreground">{fact.value}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── SMART BIN LIST ── */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-black text-foreground tracking-tight">Smart BIN terdekat</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Setiap mesin punya identitas sendiri, jadi pairing tidak tertukar antar lokasi.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {machines.map((machine) => (
            <button
              key={machine.id}
              onClick={() => onMachineSelect(machine.id)}
              className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 active:scale-[0.99] transition-all duration-150 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Recycle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-foreground truncate">{machine.label}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{machine.id}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cx(
                  "text-[0.65rem] font-bold px-2 py-0.5 rounded-full",
                  machine.status === "active" && "bg-emerald-500/10 text-emerald-400",
                  machine.status === "pairing" && "bg-amber-500/10 text-amber-400",
                  machine.status === "connected" && "bg-cyan-500/10 text-cyan-400",
                )}>
                  {machine.status === "active" ? "Siap" : machine.status === "pairing" ? "Sibuk" : "Terhubung"}
                </span>
                <StatusDot status={machine.status} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── TOP CONTRIBUTORS ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-foreground tracking-tight">Top kontributor</h2>
            <p className="text-xs text-muted-foreground mt-1">Preview leaderboard mahasiswa aktif.</p>
          </div>
          <button onClick={onGoLeaderboard} className="flex items-center gap-1 text-xs font-bold text-emerald-400">
            Semua <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {topThree.map((item, index) => (
            <div
              key={item.rank}
              className={cx(
                "flex items-center gap-3 p-3.5 rounded-2xl border transition-all",
                index === 0
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-card border-border",
              )}
            >
              <div className={cx(
                "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0",
                index === 0 ? "bg-emerald-500 text-slate-950" : "bg-secondary text-muted-foreground",
              )}>
                #{item.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{item.faculty}</div>
              </div>
              <div className="text-sm font-black text-emerald-400 flex-shrink-0">{formatPoints(item.points)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── IMPACT GRID ── */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-black text-foreground tracking-tight">Dampak nyata untuk kampus & bumi</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Angka-angka ini membantu mahasiswa melihat hasil kontribusi mereka secara langsung.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {impactCards.map((card) => (
            <div key={card.label} className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-1.5">
              <div className="text-lg font-black text-emerald-400 tracking-tight leading-none">{card.value}</div>
              <div className="text-xs font-bold text-foreground">{card.label}</div>
              <div className="text-[0.68rem] text-muted-foreground leading-relaxed">{card.helper}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-black text-foreground tracking-tight">Cara kerjanya singkat</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Alur dibuat sesederhana mungkin agar nyaman dipakai langsung di browser HP.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-card border border-border">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-black text-emerald-400 flex-shrink-0">
                0{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">{step.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RECENT ACTIVITY ── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-black text-foreground tracking-tight">Aktivitas terbaru</h2>
        <div className="flex flex-col gap-2">
          {activities.map((activity) => (
            <div
              key={activity.title}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border"
            >
              <div className={cx(
                "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                activity.kind === "green" && "bg-emerald-500/10 text-emerald-400",
                activity.kind === "mint" && "bg-teal-500/10 text-teal-400",
                activity.kind === "slate" && "bg-slate-500/10 text-slate-400",
              )}>
                <Circle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground truncate">{activity.title}</div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{activity.meta}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-black text-emerald-400">
                  {activity.points > 0 ? `+${activity.points}` : "—"}
                </div>
                <div className="text-[0.65rem] text-muted-foreground mt-0.5">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-black text-foreground tracking-tight">Pertanyaan umum</h2>
          <p className="text-xs text-muted-foreground mt-1">FAQ ringkas untuk menjawab pertanyaan yang paling sering muncul.</p>
        </div>
        <div className="flex flex-col gap-2">
          {HOME_QUESTIONS.map((item, index) => (
            <button
              key={item.q}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className={cx(
                "w-full text-left p-4 rounded-2xl border transition-all duration-200",
                openFaq === index
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-card border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-bold text-foreground leading-snug">{item.q}</div>
                <ChevronRight className={cx(
                  "w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform duration-200",
                  openFaq === index && "rotate-90 text-emerald-400",
                )} />
              </div>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-emerald-500/20 mt-3">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA PANEL ── */}
      <section className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight text-balance">
            Siap mulai dari browser HP?
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Buka akun, hubungkan kartu, dan pantau kontribusi tanpa perlu aplikasi store.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onGoAccount}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150"
          >
            Masuk
          </button>
          <button
            onClick={onGoPairing}
            className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] text-foreground font-semibold text-sm transition-all duration-150"
          >
            Hubungkan Kartu
          </button>
        </div>
      </section>
    </div>
  );
}
