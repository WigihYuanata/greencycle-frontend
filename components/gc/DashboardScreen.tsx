"use client";

import { motion } from "framer-motion";
import {
  Link2, Link2Off, Recycle, Trophy, User, TrendingUp,
  Plus, Circle,
} from "lucide-react";
import {
  Machine, Activity,
  cx, formatPoints, WEEKLY, WEEK_LABELS,
} from "@/lib/gc-data";

type Props = {
  profile: { name: string; npm: string; faculty: string; email: string };
  balances: { total: number; redeemed: number; active: number };
  bottles: { small: number; medium: number; large: number };
  connectedMachine: Machine | null;
  machines: Machine[];
  activities: Activity[];
  onOpenPairing: () => void;
  onOpenRedeem: () => void;
  onGoLeaderboard: () => void;
  onGoAccount: () => void;
};

function StatusDot({ status }: { status: Machine["status"] }) {
  return (
    <span className={cx(
      "w-2 h-2 rounded-full flex-shrink-0",
      status === "active" && "bg-emerald-400",
      status === "pairing" && "bg-amber-400 animate-pulse",
      status === "connected" && "bg-cyan-400",
    )} />
  );
}

export default function DashboardScreen({
  profile, balances, bottles, connectedMachine,
  machines, activities,
  onOpenPairing, onOpenRedeem, onGoLeaderboard, onGoAccount,
}: Props) {
  const maxWeek = Math.max(...WEEKLY);
  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const staggerItem = (i: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: i * 0.07 },
  });

  return (
    <div className="flex flex-col gap-7 pt-2 pb-4">

      {/* ── HEADER ── */}
      <motion.section {...staggerItem(0)} className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.65rem] font-black uppercase tracking-widest text-emerald-400 mb-1">Dashboard mahasiswa</div>
          <h2 className="text-2xl font-black tracking-tight text-foreground leading-none">
            Halo, {profile.name.split(" ")[0]}
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-[26ch]">
            Ringkasan kontribusi dan saldo aktif kamu.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-black text-emerald-400 flex-shrink-0">
          {initials}
        </div>
      </motion.section>

      {/* ── BALANCE CARDS ── */}
      <motion.section {...staggerItem(1)} className="flex flex-col gap-2.5">
        {/* hero balance */}
        <div className="relative overflow-hidden rounded-3xl bg-emerald-500/10 border border-emerald-500/25 p-5">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="text-[0.65rem] font-black uppercase tracking-widest text-emerald-400">Sisa saldo aktif</div>
            <div className="text-4xl font-black tracking-tight text-foreground mt-1.5 leading-none">
              {formatPoints(balances.active)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Siap digunakan untuk penarikan saldo.</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground">Total poin</div>
            <div className="text-xl font-black tracking-tight text-foreground mt-1.5">{formatPoints(balances.total)}</div>
            <div className="text-[0.65rem] text-muted-foreground mt-0.5">Akumulasi dari transaksi</div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground">Ditukar</div>
            <div className="text-xl font-black tracking-tight text-foreground mt-1.5">{formatPoints(balances.redeemed)}</div>
            <div className="text-[0.65rem] text-muted-foreground mt-0.5">Pencairan diproses</div>
          </div>
        </div>
      </motion.section>

      {/* ── CONNECTION STATUS ── */}
      <motion.section {...staggerItem(2)} className="flex flex-col gap-3">
        <div className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cx(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                connectedMachine ? "bg-cyan-500/10 text-cyan-400" : "bg-slate-500/10 text-muted-foreground",
              )}>
                {connectedMachine ? <Link2 className="w-5 h-5" /> : <Link2Off className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground">Status kartu</div>
                <div className="text-sm font-bold text-foreground mt-0.5">
                  {connectedMachine ? "Kartu terhubung" : "Kartu belum terhubung"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {connectedMachine
                    ? `${connectedMachine.label} · ${connectedMachine.area}`
                    : "Hubungkan KTM ke Smart BIN untuk mulai berkontribusi."}
                </div>
              </div>
            </div>
            {connectedMachine && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
            )}
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={onOpenPairing}
              className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150"
            >
              {connectedMachine ? "Ganti / Hubungkan" : "Hubungkan Kartu"}
            </button>
            <button
              onClick={onOpenRedeem}
              className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] text-foreground font-semibold text-sm transition-all duration-150"
            >
              Tarik Saldo
            </button>
          </div>
        </div>
      </motion.section>

      {/* ── BOTTLE CONTRIBUTION ── */}
      <motion.section {...staggerItem(3)} className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-black text-foreground tracking-tight">Kontribusi botol</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Komposisi berdasarkan ukuran botol yang disetor.</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Kecil", value: bottles.small },
            { label: "Sedang", value: bottles.medium },
            { label: "Besar", value: bottles.large },
            { label: "Total", value: bottles.small + bottles.medium + bottles.large, highlight: true },
          ].map((item) => (
            <div
              key={item.label}
              className={cx(
                "rounded-2xl border p-3 flex flex-col gap-1.5",
                item.highlight
                  ? "bg-emerald-500/10 border-emerald-500/25"
                  : "bg-card border-border",
              )}
            >
              <Recycle className={cx("w-4 h-4", item.highlight ? "text-emerald-400" : "text-muted-foreground")} />
              <div className={cx("text-lg font-black tracking-tight leading-none", item.highlight ? "text-emerald-400" : "text-foreground")}>
                {item.value}
              </div>
              <div className="text-[0.6rem] text-muted-foreground font-semibold">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── WEEKLY CHART ── */}
      <motion.section {...staggerItem(4)} className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-black text-foreground tracking-tight">Tren mingguan</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Grafik ringan yang tampil natural di browser HP.</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-end gap-2 h-24">
            {WEEKLY.map((value, index) => (
              <div key={WEEK_LABELS[index]} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end justify-center" style={{ height: "100%" }}>
                  <div
                    className="w-full rounded-t-lg bg-emerald-500/70 hover:bg-emerald-400 transition-all duration-300"
                    style={{ height: `${(value / maxWeek) * 100}%`, minHeight: "4px" }}
                  />
                </div>
                <div className="text-[0.6rem] text-muted-foreground font-semibold">{WEEK_LABELS[index]}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── RECENT ACTIVITY ── */}
      <motion.section {...staggerItem(5)} className="flex flex-col gap-3">
        <h3 className="text-sm font-black text-foreground tracking-tight">Aktivitas terbaru</h3>
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
                activity.kind === "slate" && "bg-slate-500/10 text-muted-foreground",
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
      </motion.section>

      {/* ── QUICK ACTIONS ── */}
      <motion.section {...staggerItem(6)} className="flex flex-col gap-2.5">
        <h3 className="text-sm font-black text-foreground tracking-tight">Aksi cepat</h3>
        <div className="flex flex-col gap-2">
          {[
            { icon: Plus, label: "Hubungkan Kartu", sub: "Pairing sekali saja", action: onOpenPairing },
            { icon: Trophy, label: "Lihat Peringkat", sub: "Top kontributor minggu ini", action: onGoLeaderboard },
            { icon: User, label: "Profil & Akun", sub: "PIN, data, dan status", action: onGoAccount },
          ].map(({ icon: Icon, label, sub, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border hover:border-emerald-500/30 hover:bg-emerald-500/5 active:scale-[0.99] transition-all duration-150 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </motion.section>

      {/* ── SMART BIN STATUS ── */}
      <motion.section {...staggerItem(7)} className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-black text-foreground tracking-tight">Smart BIN aktif</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Setiap lokasi punya identitas mesin yang berbeda.</p>
        </div>
        <div className="flex flex-col gap-2">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className={cx(
                "flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all",
                machine.status === "connected" && "bg-cyan-500/5 border-cyan-500/25",
                machine.status === "pairing" && "bg-amber-500/5 border-amber-500/25",
                machine.status === "active" && "bg-card border-border",
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusDot status={machine.status} />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-foreground truncate">{machine.label}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{machine.id}</div>
                </div>
              </div>
              <span className={cx(
                "text-[0.62rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                machine.status === "active" && "bg-emerald-500/10 text-emerald-400",
                machine.status === "pairing" && "bg-amber-500/10 text-amber-400",
                machine.status === "connected" && "bg-cyan-500/10 text-cyan-400",
              )}>
                {machine.status === "active"
                  ? "Siap pairing"
                  : machine.status === "pairing"
                  ? `Dipakai ${machine.owner ?? ""}`
                  : `Terhubung`}
              </span>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
