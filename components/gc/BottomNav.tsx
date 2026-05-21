"use client";

import { Home, TrendingUp, Scan, Trophy, User } from "lucide-react";
import { cx, Screen } from "@/lib/gc-data";

type Props = {
  active: Screen;
  onGoHome: () => void;
  onGoDashboard: () => void;
  onOpenPairing: () => void;
  onGoLeaderboard: () => void;
  onGoAccount: () => void;
};

function NavItem({
  active, label, icon, onClick,
}: {
  active: boolean; label: string; icon: React.ReactNode; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cx(
        "flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-150 min-w-0",
        active
          ? "text-emerald-400"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span className="text-[10px] font-medium truncate">{label}</span>
    </button>
  );
}

export default function BottomNav({ active, onGoHome, onGoDashboard, onOpenPairing, onGoLeaderboard, onGoAccount }: Props) {
  return (
    <nav
      aria-label="Navigasi bawah"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md border-t border-border/50 px-2 pb-safe"
    >
      <div className="flex items-end justify-around">
        <NavItem
          active={active === "home"}
          label="Beranda"
          icon={<Home className="w-5 h-5" />}
          onClick={onGoHome}
        />
        <NavItem
          active={active === "dashboard"}
          label="Dashboard"
          icon={<TrendingUp className="w-5 h-5" />}
          onClick={onGoDashboard}
        />

        {/* center CTA button */}
        <div className="flex flex-col items-center gap-0.5 py-1">
          <button
            onClick={onOpenPairing}
            aria-label="Buka pairing"
            className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-95 transition-all duration-150"
          >
            <Scan className="w-5 h-5 text-slate-950" />
          </button>
          <span className="text-[10px] font-medium text-muted-foreground">Pairing</span>
        </div>

        <NavItem
          active={active === "leaderboard"}
          label="Peringkat"
          icon={<Trophy className="w-5 h-5" />}
          onClick={onGoLeaderboard}
        />
        <NavItem
          active={active === "account"}
          label="Akun"
          icon={<User className="w-5 h-5" />}
          onClick={onGoAccount}
        />
      </div>
    </nav>
  );
}
