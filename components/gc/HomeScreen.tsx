"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Users, Recycle, Wallet,
  Trophy, TrendingUp, ArrowRight, CheckCircle2, Circle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Machine, Activity, Leader,
  HOME_QUESTIONS, cx, formatCompact, formatPoints,
} from "@/lib/gc-data";
import UpnLogo from "@/components/gc/UpnLogo";

type Props = {
  heroBotol: number;
  heroMembers: number;
  heroPoints: number;
  heroFocusLabel: string;
  heroFocusValue: string;
  currentMachine: Machine | undefined;
  connectedCount: number;
  activeCount: number;
  machines: Machine[];
  activities: Activity[];
  impactCards: Array<{ label: string; value: string; helper: string; loading: boolean; source: string }>;
  liveStrip: Array<{ label: string; value: string; loading: boolean }>;
  leaderboard: Leader[];
  leaderboardLoading: boolean;
  onGoDashboard: () => void;
  onGoLeaderboard: () => void;
  onGoAccount: () => void;
};

function StatusDot({ status }: { status: Machine["status"] }) {
  return (
    <Circle
      className={cx(
        "w-2 h-2 fill-current flex-shrink-0",
        status === "active" ? "text-emerald-400" : status === "pairing" ? "text-amber-400" : "text-sky-400",
      )}
    />
  );
}

export default function HomeScreen({
  heroBotol, heroMembers, heroPoints,
  heroFocusLabel, heroFocusValue,
  currentMachine, connectedCount, activeCount,
  machines, activities, impactCards, liveStrip, leaderboard, leaderboardLoading,
  onGoDashboard, onGoLeaderboard, onGoAccount,
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
    <div className="flex flex-col gap-10 px-4 pt-5">
      {/* ── HERO ── */}
      <section aria-label="Hero" className="flex flex-col gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-2">
            <UpnLogo size={28} />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">GreenCycle · UPNVJT</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-foreground text-balance leading-snug">
            Gerakan kampus yang nyata dan terukur
          </h1>

          <p className="text-sm font-semibold text-emerald-400 text-balance">
            Daur ulang botol plastik, kumpulkan poin, tukar hadiah.
          </p>

          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            GreenCycle menghubungkan mahasiswa dengan Smart BIN di kampus
            untuk mencatat setiap botol yang didaur ulang secara otomatis.
          </p>

          <div className="flex gap-2">
            <button
              onClick={onGoAccount}
              className="flex-1 h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGoDashboard}
              className="flex-1 h-11 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 active:scale-[0.98] text-foreground font-bold text-sm transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Dashboard
            </button>
          </div>
        </motion.div>

        {/* stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-3 gap-2"
        >
          {[
            { icon: Users, label: "Kontributor aktif", value: `${formatCompact(heroMembers)}+` },
            { icon: Recycle, label: "Botol terkumpul", value: `${formatCompact(heroBotol)}+` },
            { icon: Wallet, label: "Poin didapat", value: `${formatCompact(heroPoints)}+` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-secondary/50 border border-border text-center">
              <Icon className="w-4 h-4 text-emerald-400" />
              <p className="text-sm font-bold text-foreground">{value}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── LIVE STRIP ── */}
      <section aria-label="Statistik live" className="flex gap-2">
        {liveStrip.map((fact) => (
          <div key={fact.label} className="flex-1 flex flex-col items-center gap-0.5 p-2.5 rounded-2xl bg-emerald-500/8 border border-emerald-500/15 text-center">
            {fact.loading ? (
              <Skeleton className="h-4 w-12 rounded mb-0.5" />
            ) : (
              <p className="text-sm font-bold text-emerald-400">{fact.value}</p>
            )}
            <p className="text-[9px] text-muted-foreground leading-tight">{fact.label}</p>
          </div>
        ))}
      </section>

      {/* ── SMART BIN LIST ── */}
      <section aria-label="Daftar Smart BIN" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-xs md:text-sm text-foreground">Smart BIN tersedia</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
              Lokasi Smart BIN yang tersedia di kampus.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <StatusDot status={machine.status} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{machine.label}</p>
                  <p className="text-[10px] text-muted-foreground">{machine.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={cx(
                  "text-[10px] font-semibold",
                  machine.status === "active" ? "text-emerald-400" : machine.status === "pairing" ? "text-amber-400" : "text-sky-400",
                )}>
                  {machine.status === "active" ? "Siap" : machine.status === "pairing" ? "Sibuk" : "Terhubung"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOP CONTRIBUTORS ── */}
      <section aria-label="Top kontributor" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xs md:text-sm text-foreground">Top kontributor</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Mahasiswa dengan poin tertinggi minggu ini.</p>
              </div>
          <button
            onClick={onGoLeaderboard}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Semua <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {leaderboardLoading ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}
          </div>
        ) : topThree.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Belum ada data leaderboard.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {topThree.map((item, index) => (
              <div
                key={item.rank}
                className={cx(
                  "flex items-center gap-3 p-3 rounded-2xl border",
                  index === 0 ? "bg-amber-500/8 border-amber-500/20" : "bg-secondary/50 border-border",
                )}
              >
                <span className={cx(
                  "text-xs font-bold w-5 text-center flex-shrink-0",
                  index === 0 ? "text-amber-400" : "text-muted-foreground",
                )}>
                  #{item.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.faculty}</p>
                </div>
                <span className={cx("text-xs font-bold flex-shrink-0", index === 0 ? "text-amber-400" : "text-foreground")}>
                  {formatPoints(item.points)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── IMPACT GRID ── */}
      <section aria-label="Dampak lingkungan" className="flex flex-col gap-3">
        <div>
          <p className="font-bold text-xs md:text-sm text-foreground">Dampak nyata GreenCycle</p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
            Angka dihitung dari total poin seluruh mahasiswa yang aktif.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {impactCards.map((card) => (
            <div key={card.label} className="p-3.5 rounded-2xl bg-secondary/50 border border-border flex flex-col gap-1.5">
              {card.loading ? (
                <>
                  <Skeleton className="h-6 w-20 rounded-lg" />
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </>
              ) : (
                <>
                  <p className="text-base md:text-lg font-bold text-emerald-400">{card.value}</p>
                  <p className="text-[10px] md:text-xs font-semibold text-foreground">{card.label}</p>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground leading-relaxed">{card.helper}</p>
                  <p className="text-[8px] md:text-[9px] text-emerald-500/60 leading-tight mt-0.5 border-t border-border pt-1.5">
                    {card.source}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
        <p className="text-[8px] md:text-[9px] text-muted-foreground/60 text-center leading-relaxed px-2">
          Sumber: NIH Life Cycle Assessment (Gironi &amp; Piemonte, 2010) · Pacific Institute (Gleick &amp; Cooley, 2009)
        </p>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section aria-label="Cara kerja" className="flex flex-col gap-3">
        <div>
          <p className="font-bold text-xs md:text-sm text-foreground">Cara pakainya</p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Empat langkah, selesai dalam hitungan menit.</p>
        </div>
        <div className="flex flex-col gap-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 md:p-3.5 rounded-2xl bg-secondary/50 border border-border">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-emerald-400">0{idx + 1}</span>
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-xs md:text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section aria-label="Pertanyaan umum" className="flex flex-col gap-3">
        <div>
          <p className="font-bold text-xs md:text-sm text-foreground">Pertanyaan umum</p>
        </div>
        <div className="flex flex-col gap-1.5">
          {HOME_QUESTIONS.map((item, index) => (
            <button
              key={index}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className={cx(
                "w-full text-left p-4 rounded-2xl border transition-all duration-200",
                openFaq === index
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-card border-border",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs md:text-sm font-semibold text-foreground text-balance">{item.q}</p>
                <ChevronRight className={cx(
                  "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 mt-0.5",
                  openFaq === index ? "rotate-90" : "",
                )} />
              </div>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-muted-foreground mt-2 leading-relaxed overflow-hidden"
                  >
                    {item.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA PANEL ── */}
      <section aria-label="Ajakan bergabung" className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 md:p-5 flex flex-col gap-3 mb-4">
        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
        <p className="font-bold text-sm md:text-base text-foreground text-balance">Mulai dari browser, tanpa install apapun.</p>
        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
          Buka akun, datangi Smart BIN terdekat, tap KTM-mu dan mulai berkontribusi.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onGoAccount}
            className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all"
          >
            Masuk / Daftar
          </button>
          <button
            onClick={onGoDashboard}
            className="flex-1 h-10 rounded-xl bg-secondary border border-border hover:bg-secondary/80 text-foreground font-bold text-xs transition-all"
          >
            Lihat Dashboard
          </button>
        </div>
      </section>
    </div>
  );
}
