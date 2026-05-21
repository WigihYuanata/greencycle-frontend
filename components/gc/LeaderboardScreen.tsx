"use client";

import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cx, formatPoints } from "@/lib/gc-data";
import { LeaderEntry } from "@/lib/gc-api";

type Scope = "minggu" | "bulan" | "semua";

type Props = {
  scope: Scope;
  setScope: React.Dispatch<React.SetStateAction<Scope>>;
  leaderboard: LeaderEntry[];
  isLoading: boolean;
  onGoDashboard: () => void;
};

const RANK_COLORS: Record<number, { bg: string; text: string; medal: string }> = {
  1: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400", medal: "text-amber-400" },
  2: { bg: "bg-slate-400/10 border-slate-400/20", text: "text-slate-300", medal: "text-slate-300" },
  3: { bg: "bg-amber-700/10 border-amber-700/20", text: "text-amber-600", medal: "text-amber-600" },
};

function PodiumCard({ item }: { item: LeaderEntry }) {
  const colors = RANK_COLORS[item.peringkat];
  const initials = item.nama.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div className={cx(
      "flex flex-col items-center gap-2 p-3 rounded-2xl border flex-1",
      colors?.bg ?? "bg-secondary/50 border-border",
    )}>
      {item.peringkat === 1 && <Trophy className="w-4 h-4 text-amber-400" />}
      <div className={cx(
        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
        colors?.bg ?? "bg-secondary",
      )}>
        <span className={cx("font-bold", colors?.text ?? "text-muted-foreground")}>
          {initials}
        </span>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-foreground text-balance leading-tight">{item.nama}</p>
        <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{item.fakultas}</p>
      </div>
      <span className={cx("text-sm font-bold", colors?.text ?? "text-foreground")}>
        {formatPoints(item.total_point)}
      </span>
      <span className={cx(
        "text-[10px] font-bold px-2 py-0.5 rounded-full",
        colors?.bg ?? "bg-secondary",
        colors?.text ?? "text-muted-foreground",
      )}>
        #{item.peringkat}
      </span>
    </div>
  );
}

function LoadingLeaderboard() {
  return (
    <div className="px-4 pt-5 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>
      <div className="flex gap-1 p-1 rounded-2xl bg-secondary/60 border border-border">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="flex-1 h-9 rounded-xl" />)}
      </div>
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="flex-1 h-32 rounded-2xl" />)}
      </div>
      <div className="flex flex-col gap-2">
        {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}
      </div>
    </div>
  );
}

export default function LeaderboardScreen({ scope, setScope, leaderboard, isLoading, onGoDashboard }: Props) {
  if (isLoading) return <LoadingLeaderboard />;

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Podium ordering: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <section className="px-4 pt-5 flex flex-col gap-6" aria-label="Leaderboard">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Peringkat</p>
        <h1 className="text-xl font-bold text-foreground mt-0.5">Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Peringkat berdasarkan kontribusi botol plastik yang berhasil didaur ulang.
        </p>
      </motion.div>

      {/* ── SCOPE TABS ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex gap-1 p-1 rounded-2xl bg-secondary/60 border border-border"
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

      {leaderboard.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Trophy className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Belum ada data leaderboard.</p>
          <p className="text-xs text-muted-foreground">Mulai setor botol untuk masuk peringkat!</p>
        </div>
      ) : (
        <>
          {/* ── TOP 3 PODIUM ── */}
          {top3.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="flex items-end gap-2"
            >
              {podiumOrder.map((item) =>
                item ? (
                  <div
                    key={item.peringkat}
                    className={cx("flex-1", item.peringkat === 1 ? "scale-105 origin-bottom" : "")}
                  >
                    <PodiumCard item={item} />
                  </div>
                ) : null,
              )}
            </motion.div>
          )}

          {/* ── FULL LIST ── */}
          {rest.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="flex flex-col gap-1.5"
            >
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Peringkat berikutnya</p>
              {rest.map((item) => (
                <div
                  key={item.peringkat}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 border border-border"
                >
                  <span className="w-6 text-center text-xs font-bold text-muted-foreground flex-shrink-0">
                    {item.peringkat}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {item.nama.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.nama}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.fakultas}</p>
                  </div>
                  <span className="text-xs font-bold text-foreground flex-shrink-0">
                    {formatPoints(item.total_point)}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* ── CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="font-bold text-sm text-foreground text-balance">Posisimu berikutnya bisa ada di sini.</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Mulai kumpulkan poin dengan mendaur ulang botol di Smart BIN untuk naik peringkat.
        </p>
        <button
          onClick={onGoDashboard}
          className="w-full h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs hover:bg-emerald-500/30 transition-colors"
        >
          Buka Dashboard
        </button>
      </motion.div>
    </section>
  );
}
