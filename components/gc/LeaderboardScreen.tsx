"use client";

import { motion } from "framer-motion";
import { cx, formatPoints, Leader } from "@/lib/gc-data";

type Scope = "minggu" | "bulan" | "semua";

type Props = {
  scope: Scope;
  setScope: React.Dispatch<React.SetStateAction<Scope>>;
  leaderboard: Leader[];
  onGoDashboard: () => void;
  onGoPairing: () => void;
};

const rankMedal: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };

export default function LeaderboardScreen({ scope, setScope, leaderboard, onGoDashboard, onGoPairing }: Props) {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="flex flex-col gap-7 pt-2 pb-4">
      {/* ── HEADER ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="text-[0.65rem] font-black uppercase tracking-widest text-emerald-400 mb-1">Leaderboard</div>
        <h2 className="text-2xl font-black tracking-tight text-foreground leading-none">Top kontributor</h2>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Peringkat berdasarkan kontribusi botol plastik yang berhasil didaur ulang.
        </p>
      </motion.section>

      {/* ── SCOPE TABS ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex gap-1.5 p-1 rounded-2xl bg-secondary/60 border border-border"
      >
        {([["minggu", "Minggu ini"], ["bulan", "Bulan ini"], ["semua", "Semua"]] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setScope(value)}
            className={cx(
              "flex-1 h-9 rounded-xl text-xs font-bold transition-all duration-200",
              scope === value
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </motion.div>

      {/* ── TOP 3 PODIUM ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col gap-2.5"
      >
        {top3.map((item, index) => (
          <div
            key={item.rank}
            className={cx(
              "relative overflow-hidden flex items-center gap-3.5 p-4 rounded-2xl border transition-all",
              index === 0
                ? "bg-emerald-500/12 border-emerald-500/30"
                : index === 1
                ? "bg-card border-border"
                : "bg-card border-border",
            )}
          >
            {index === 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
            )}
            <div className={cx(
              "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black flex-shrink-0",
              index === 0 ? "bg-emerald-500 text-slate-950" : "bg-secondary text-muted-foreground",
            )}>
              {rankMedal[item.rank] ?? `#${item.rank}`}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{item.faculty}</div>
            </div>
            <div className={cx(
              "text-base font-black flex-shrink-0",
              index === 0 ? "text-emerald-400" : "text-foreground",
            )}>
              {formatPoints(item.points)}
            </div>
          </div>
        ))}
      </motion.section>

      {/* ── FULL LIST ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col gap-2"
      >
        <div className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground px-1 mb-1">Peringkat berikutnya</div>
        {rest.map((item) => (
          <div key={item.rank} className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border">
            <div className="w-7 h-7 rounded-xl bg-secondary flex items-center justify-center text-xs font-black text-muted-foreground flex-shrink-0">
              {item.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{item.faculty}</div>
            </div>
            <div className="text-sm font-black text-foreground flex-shrink-0">{formatPoints(item.points)}</div>
          </div>
        ))}
      </motion.section>

      {/* ── CTA ── */}
      <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-black text-foreground tracking-tight text-balance">
            Posisimu berikutnya bisa ada di sini.
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Hubungkan kartu dan mulai kumpulkan poin untuk naik peringkat.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onGoDashboard}
            className="w-full h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150"
          >
            Buka Dashboard
          </button>
          <button
            onClick={onGoPairing}
            className="w-full h-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] text-foreground font-semibold text-sm transition-all duration-150"
          >
            Hubungkan Kartu
          </button>
        </div>
      </div>
    </div>
  );
}
