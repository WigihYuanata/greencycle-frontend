"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Wallet, AlertCircle, CheckCircle, Coffee, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cx, formatPoints } from "@/lib/gc-data";
import { VoucherCatalogItem } from "@/lib/gc-api";

type Props = {
  activeBalance: number;
  vouchers: VoucherCatalogItem[];
  vouchersLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onRedeem: (catalogId: number) => void;
};

export default function RedeemSheet({
  activeBalance, vouchers, vouchersLoading, isSubmitting, onClose, onRedeem,
}: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  const selected = vouchers.find((v) => v.id === selectedId) ?? null;
  const canAfford = selected ? activeBalance >= selected.point_cost : false;

  const handleConfirm = () => {
    if (!selected || !canAfford || isSubmitting) return;
    onRedeem(selected.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      {/* backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* sheet */}
      <motion.div
        className="relative z-10 w-full max-w-lg bg-background border border-border rounded-t-3xl lg:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden" aria-hidden>
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pb-6">
          {/* header */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Penukaran</p>
              <h2 className="text-lg font-bold text-foreground mt-0.5">Tukar Voucher</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pilih voucher dan konfirmasi penukaran poin kamu.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors flex-shrink-0 mt-1"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* balance banner */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-400/80 font-medium">Saldo aktif</p>
              <p className="text-xl font-bold text-emerald-400 leading-none">{formatPoints(activeBalance)}</p>
              <p className="text-[10px] text-emerald-400/60">poin tersedia</p>
            </div>
          </div>

          {/* Voucher grid */}
          {!confirming ? (
            <>
              <p className="text-xs font-semibold text-foreground mb-2">Pilih voucher</p>
              {vouchersLoading ? (
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
              ) : vouchers.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center mb-4">
                  <Coffee className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Belum ada voucher tersedia saat ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {vouchers.map((v) => {
                    const affordable = activeBalance >= v.point_cost;
                    const isSelected = selectedId === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedId(isSelected ? null : v.id)}
                        disabled={!affordable}
                        className={cx(
                          "w-full text-left flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-150 active:scale-[0.99]",
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500/40"
                            : affordable
                              ? "bg-card border-border hover:border-emerald-500/30 hover:bg-emerald-500/5"
                              : "bg-secondary/30 border-border opacity-50 cursor-not-allowed",
                        )}
                      >
                        <div className={cx(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          isSelected ? "bg-emerald-500/30" : "bg-secondary",
                        )}>
                          <Coffee className={cx("w-5 h-5", isSelected ? "text-emerald-400" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cx("text-sm font-semibold truncate", isSelected ? "text-emerald-400" : "text-foreground")}>
                              {v.name}
                            </p>
                            {isSelected && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{v.cafe_name}</p>
                          {v.description && (
                            <p className="text-[10px] text-muted-foreground/70 truncate">{v.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <p className={cx("text-sm font-bold", affordable ? "text-foreground" : "text-muted-foreground")}>
                            {formatPoints(v.point_cost)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">poin</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* warning */}
              {selected && !canAfford && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-400">Saldo tidak cukup untuk voucher ini.</p>
                </div>
              )}

              {/* actions */}
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => { if (selected && canAfford) setConfirming(true); }}
                  disabled={!selected || !canAfford || isSubmitting}
                  className={cx(
                    "w-full h-12 rounded-2xl font-bold text-sm transition-all duration-150",
                    selected && canAfford
                      ? "bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 shadow-lg shadow-emerald-500/20"
                      : "bg-secondary border border-border text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {selected ? `Tukar — ${formatPoints(selected.point_cost)} poin` : "Pilih voucher dulu"}
                </button>
                <button
                  onClick={onClose}
                  className="w-full h-10 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 text-foreground font-semibold text-sm transition-all duration-150"
                >
                  Batal
                </button>
              </div>
            </>
          ) : (
            /* Confirmation step */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <Coffee className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">{selected?.name}</p>
                  <p className="text-sm text-muted-foreground">{selected?.cafe_name}</p>
                </div>
                <div className="flex flex-col gap-1 w-full p-4 rounded-2xl bg-secondary/50 border border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biaya</span>
                    <span className="font-bold text-foreground">{formatPoints(selected?.point_cost ?? 0)} poin</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saldo saat ini</span>
                    <span className="font-semibold text-emerald-400">{formatPoints(activeBalance)} poin</span>
                  </div>
                  <div className="border-t border-border/50 pt-1 mt-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Sisa saldo</span>
                    <span className="font-bold text-foreground">
                      {formatPoints(activeBalance - (selected?.point_cost ?? 0))} poin
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Konfirmasi Penukaran"
                  )}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 text-foreground font-semibold text-sm transition-all duration-150"
                >
                  Kembali
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
