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
      className={cx(
        "flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-150",
        active ? "text-emerald-400" : "text-muted-foreground hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span className="text-[0.58rem] font-bold tracking-wide">{label}</span>
    </button>
  );
}

export default function BottomNav({ active, onGoHome, onGoDashboard, onOpenPairing, onGoLeaderboard, onGoAccount }: Props) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 px-0">
      <nav
        className="flex items-center bg-card/95 border-t border-border backdrop-blur-xl pb-safe-area-inset-bottom"
        aria-label="Navigasi utama"
      >
        <NavItem
          active={active === "home"}
          label="Beranda"
          icon={<Home className="w-5 h-5" />}
          onClick={onGoHome}
        />
        <NavItem
          active={active === "dashboard"}
          label="Poin"
          icon={<TrendingUp className="w-5 h-5" />}
          onClick={onGoDashboard}
        />

        {/* center CTA button */}
        <div className="flex flex-col items-center flex-1 py-1.5 -mt-5">
          <button
            onClick={onOpenPairing}
            aria-label="Hubungkan kartu KTM"
            className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/35 transition-all duration-150 border-4 border-card"
          >
            <Scan className="w-6 h-6" />
          </button>
          <span className="text-[0.55rem] font-bold text-emerald-400 mt-1 tracking-wide">Pairing</span>
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
      </nav>
    </div>
  );
}
