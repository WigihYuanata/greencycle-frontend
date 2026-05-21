"use client";

import { motion } from "framer-motion";
import {
  Link2, Link2Off, Recycle, Trophy, User, TrendingUp, Circle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Machine, Activity, cx, formatPoints } from "@/lib/gc-data";

type Props = {
  profile: { name: string; npm: string; faculty: string; email: string };
  balances: { total: number; redeemed: number; active: number };
  bottles: { small: number; medium: number; large: number };
  connectedMachine: Machine | null;
  machines: Machine[];
  activities: Activity[];
  isLoading: boolean;
  onOpenRedeem: () => void;
  onGoLeaderboard: () => void;
  onGoAccount: () => void;
};

function StatusDot({ status }: { status: Machine["status"] }) {
  return (
    <Circle
      className={cx(
        "w-2 h-2 fill-current",
        status === "active" ? "text-emerald-400" : status === "pairing" ? "text-amber-400" : "text-sky-400",
      )}
    />
  );
}

function LoadingDashboard() {
  return (
    <div className="px-4 pt-5 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-7 w-48 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
      </div>
    </div>
  );
}

export default function DashboardScreen({
  profile, balances, bottles, connectedMachine,
  machines, activities, isLoading,
  onOpenRedeem, onGoLeaderboard, onGoAccount,
}: Props) {
  if (isLoading) return <LoadingDashboard />;

  const initials = profile.name
    ? profile.name.split(" ").map((p) => p[0]).slice(0, 2).join("")
    : "GC";

  const staggerItem = (i: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: i * 0.07 },
  });

  const totalBottles = bottles.small + bottles.medium + bottles.large;

  return (
    <section className="px-4 pt-5 flex flex-col gap-6" aria-label="Dashboard mahasiswa">

      {/* ── HEADER ── */}
      <motion.div {...staggerItem(0)} className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Dashboard</p>
          <h1 className="text-xl font-bold text-foreground mt-0.5">
            Halo, {profile.name.split(" ")[0] || "Mahasiswa"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Ringkasan kontribusi dan saldo aktif kamu.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
          {initials}
        </div>
      </motion.div>

      {/* ── BALANCE CARDS ── */}
      <motion.div {...staggerItem(1)} className="flex flex-col gap-2">
        {/* hero balance */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1">
          <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Sisa saldo aktif</p>
          <p className="text-3xl font-bold text-emerald-400 leading-none">{formatPoints(balances.active)}</p>
          <p className="text-xs text-emerald-400/60">Siap digunakan untuk penukaran voucher.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border flex flex-col gap-0.5">
            <p className="text-[10px] text-muted-foreground">Total poin</p>
            <p className="text-lg font-bold text-foreground">{formatPoints(balances.total)}</p>
            <p className="text-[10px] text-muted-foreground">Akumulasi dari transaksi</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border flex flex-col gap-0.5">
            <p className="text-[10px] text-muted-foreground">Ditukar</p>
            <p className="text-lg font-bold text-foreground">{formatPoints(balances.redeemed)}</p>
            <p className="text-[10px] text-muted-foreground">Penukaran diproses</p>
          </div>
        </div>
      </motion.div>

      {/* ── CONNECTION STATUS ── */}
      <motion.div {...staggerItem(2)} className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/50 border border-border">
          <div className={cx(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            connectedMachine ? "bg-emerald-500/20" : "bg-secondary",
          )}>
            {connectedMachine ? (
              <Link2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Link2Off className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Status kartu</p>
            <p className={cx("text-sm font-semibold", connectedMachine ? "text-emerald-400" : "text-foreground")}>
              {connectedMachine ? "Kartu terhubung" : "Kartu belum terhubung"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {connectedMachine
                ? `${connectedMachine.label} · ${connectedMachine.area}`
                : "Hubungkan KTM ke Smart BIN untuk mulai berkontribusi."}
            </p>
          </div>
          {connectedMachine && (
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div
            className={cx(
              "h-11 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1.5",
              connectedMachine
                ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400"
                : "bg-secondary border border-border text-muted-foreground",
            )}
          >
            {connectedMachine ? <Link2 className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
            {connectedMachine ? "KTM Terhubung" : "Belum Terhubung"}
          </div>
          <button
            onClick={onOpenRedeem}
            className="h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <Recycle className="w-4 h-4" />
            Tukar Voucher
          </button>
        </div>
      </motion.div>

      {/* ── BOTTLE CONTRIBUTION ── */}
      <motion.div {...staggerItem(3)} className="flex flex-col gap-2">
        <p className="text-sm font-bold text-foreground">Kontribusi botol</p>
        <p className="text-xs text-muted-foreground -mt-1">Komposisi berdasarkan ukuran botol yang disetor.</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Kecil", value: bottles.small },
            { label: "Sedang", value: bottles.medium },
            { label: "Besar", value: bottles.large },
            { label: "Total", value: totalBottles, highlight: true },
          ].map((item) => (
            <div
              key={item.label}
              className={cx(
                "flex flex-col items-center gap-1 p-2.5 rounded-2xl border",
                item.highlight
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-secondary/50 border-border",
              )}
            >
              <span className={cx("text-lg font-bold", item.highlight ? "text-emerald-400" : "text-foreground")}>
                {item.value}
              </span>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── RECENT ACTIVITY ── */}
      {activities.length > 0 && (
        <motion.div {...staggerItem(4)} className="flex flex-col gap-2">
          <p className="text-sm font-bold text-foreground">Aktivitas terbaru</p>
          <div className="flex flex-col gap-1.5">
            {activities.map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 border border-border"
              >
                <div className={cx(
                  "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                  activity.kind === "green" ? "bg-emerald-500/20" : activity.kind === "mint" ? "bg-sky-500/20" : "bg-secondary",
                )}>
                  <Recycle className={cx("w-4 h-4", activity.kind === "green" ? "text-emerald-400" : activity.kind === "mint" ? "text-sky-400" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{activity.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{activity.meta}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cx("text-xs font-bold", activity.points > 0 ? "text-emerald-400" : "text-muted-foreground")}>
                    {activity.points > 0 ? `+${activity.points}` : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── QUICK ACTIONS ── */}
      <motion.div {...staggerItem(5)} className="flex flex-col gap-2">
        <p className="text-sm font-bold text-foreground">Aksi cepat</p>
        <div className="flex flex-col gap-1.5">
          {[
            { icon: Trophy, label: "Lihat Peringkat", sub: "Top kontributor minggu ini", action: onGoLeaderboard },
            { icon: User, label: "Profil & Akun", sub: "PIN, data, dan status", action: onGoAccount },
          ].map(({ icon: Icon, label, sub, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/50 border border-border hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.99] text-left transition-all duration-150"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── SMART BIN STATUS ── */}
      <motion.div {...staggerItem(6)} className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">Smart BIN aktif</p>
          <p className="text-xs text-muted-foreground">
            {machines.filter((m) => m.status !== "pairing").length}/{machines.length} tersedia
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-secondary/50 border border-border"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <StatusDot status={machine.status} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{machine.label}</p>
                  <p className="text-[10px] text-muted-foreground">{machine.id}</p>
                </div>
              </div>
              <span className={cx(
                "text-[10px] font-semibold flex-shrink-0",
                machine.status === "active" ? "text-emerald-400" : machine.status === "pairing" ? "text-amber-400" : "text-sky-400",
              )}>
                {machine.status === "active"
                  ? "Siap pairing"
                  : machine.status === "pairing"
                    ? `Dipakai ${machine.owner ?? ""}`
                    : "Terhubung"}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
