"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Home, TrendingUp, Trophy, User, Medal, Menu, X } from "lucide-react";
import UpnLogo from "@/components/gc/UpnLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { cx, formatPoints, Screen, Leader } from "@/lib/gc-data";

type Props = {
  isLoggedIn: boolean;
  profile: { name: string; npm: string; faculty: string; email: string };
  balances: { total: number; redeemed: number; active: number };
  leaderboard: Leader[];
  leaderboardLoading: boolean;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
};

const NAV_ITEMS: { screen: Screen; label: string; icon: React.ElementType }[] = [
  { screen: "home", label: "Beranda", icon: Home },
  { screen: "dashboard", label: "Dashboard", icon: TrendingUp },
  { screen: "leaderboard", label: "Leaderboard", icon: Trophy },
  { screen: "account", label: "Akun", icon: User },
];

const RANK_COLORS: Record<number, string> = {
  1: "text-amber-400",
  2: "text-slate-300",
  3: "text-amber-600",
};

function SidebarContent({
  isLoggedIn, profile, balances, leaderboard, leaderboardLoading, activeScreen, onNavigate,
}: Props) {
  const initials = profile.name
    ? profile.name.split(" ").map((p) => p[0]).slice(0, 2).join("")
    : "GC";

  return (
    <div className="flex flex-col gap-5 p-4 h-full overflow-y-auto">
      {/* ── Navigation ── */}
      <nav aria-label="Navigasi utama">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Menu
        </p>
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ screen, label, icon: Icon }) => (
            <li key={screen}>
              <button
                onClick={() => onNavigate(screen)}
                className={cx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  activeScreen === screen
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent",
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── User Profile Card ── */}
      <section aria-label="Profil pengguna">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Profil
        </p>
        {isLoggedIn && profile.name ? (
          <div className="rounded-2xl bg-secondary/50 border border-border p-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{profile.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{profile.npm}</p>
                <p className="text-[10px] text-muted-foreground truncate">{profile.faculty}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-border/50">
              <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-background/60">
                <span className="text-xs font-bold text-emerald-400">{formatPoints(balances.active)}</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">Saldo</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-background/60">
                <span className="text-xs font-bold text-foreground">{formatPoints(balances.total)}</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">Total</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-background/60">
                <span className="text-xs font-bold text-foreground">{formatPoints(balances.redeemed)}</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">Ditukar</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-secondary/50 border border-border border-dashed p-3 flex flex-col items-center gap-2 text-center">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <UpnLogo size={20} />
            </div>
            <p className="text-xs text-muted-foreground">Masuk untuk melihat profil dan saldo.</p>
            <button
              onClick={() => onNavigate("account")}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Masuk sekarang
            </button>
          </div>
        )}
      </section>

      {/* ── Leaderboard Preview ── */}
      <section aria-label="Leaderboard mini" className="flex-1">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Top Kontributor
          </p>
          <button
            onClick={() => onNavigate("leaderboard")}
            className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Semua
          </button>
        </div>
        <div className="rounded-2xl bg-secondary/50 border border-border overflow-hidden">
          {leaderboardLoading ? (
            <div className="flex flex-col gap-2 p-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="w-5 h-4 rounded" />
                  <Skeleton className="flex-1 h-4 rounded" />
                  <Skeleton className="w-10 h-4 rounded" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Belum ada data</p>
          ) : (
            <ul className="divide-y divide-border/50">
              {leaderboard.slice(0, 8).map((item) => (
                <li key={item.rank} className="flex items-center gap-2 px-3 py-2">
                  <span className={cx(
                    "w-5 text-center text-[11px] font-bold flex-shrink-0",
                    RANK_COLORS[item.rank] ?? "text-muted-foreground",
                  )}>
                    {item.rank <= 3 ? <Medal className="w-3 h-3 mx-auto" /> : item.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.faculty}</p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 flex-shrink-0">
                    {formatPoints(item.points)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Footer brand ── */}
      <div className="pt-3 border-t border-border/50 flex items-center gap-2 px-1">
        <UpnLogo size={20} />
        <div>
          <p className="text-[10px] font-bold text-foreground">GreenCycle</p>
          <p className="text-[9px] text-muted-foreground">Teaching Industry · UPNVJT</p>
        </div>
      </div>
    </div>
  );
}

export default function DesktopSidebar(props: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [triggerEl, setTriggerEl] = useState<Element | null>(null);

  useEffect(() => {
    setTriggerEl(document.getElementById("sidebar-menu-trigger"));
  }, []);

  const handleNavigate = (screen: Screen) => {
    props.onNavigate(screen);
    setDrawerOpen(false);
  };

  const hamburger = (
    <button
      onClick={() => setDrawerOpen(true)}
      aria-label="Buka menu"
      className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
    >
      <Menu className="w-4 h-4 text-muted-foreground" />
    </button>
  );

  return (
    <>
      {/* ── Desktop: sticky left sidebar ── */}
      <aside className="hidden lg:flex flex-col border-r border-border/50 bg-background/60 backdrop-blur-sm sticky top-[57px] h-[calc(100vh-57px)]">
        <SidebarContent {...props} />
      </aside>

      {/* ── Mobile: hamburger rendered into topbar slot via portal ── */}
      {triggerEl && createPortal(hamburger, triggerEl)}

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* panel */}
          <div className="relative ml-auto w-72 max-w-[85vw] h-full bg-background border-l border-border shadow-2xl flex flex-col">
            {/* drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <UpnLogo size={24} />
                <span className="text-sm font-bold text-foreground">GreenCycle</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup menu"
                className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent {...props} onNavigate={handleNavigate} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
