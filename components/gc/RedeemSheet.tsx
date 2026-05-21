"use client";

import { motion } from "framer-motion";
import { X, Wallet, User, Lock, TrendingUp, Bell, AlertCircle } from "lucide-react";
import { useState } from "react";
import { cx, digitsOnly, formatPoints, E_WALLETS } from "@/lib/gc-data";
import { Eye, EyeOff } from "lucide-react";

type Form = { provider: string; account: string; owner: string; amount: string; pin: string };

type Props = {
  activeBalance: number;
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  onClose: () => void;
  onSubmit: () => void;
};

function Field({
  label, value, onChange, placeholder, icon, password, select, options,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon?: React.ReactNode; password?: boolean;
  select?: boolean; options?: string[];
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="relative">
        {select ? (
          <select
            className="w-full h-11 pl-4 pr-10 rounded-xl bg-secondary border border-border text-sm text-foreground font-medium appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Pilih provider</option>
            {(options ?? []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            className="w-full h-11 pl-4 pr-10 rounded-xl bg-secondary border border-border text-sm text-foreground font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:border-emerald-500/50 transition-colors"
            type={password && !show ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={password ? "numeric" : "text"}
          />
        )}
        {password && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={show ? "Sembunyikan" : "Tampilkan"}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </label>
  );
}

export default function RedeemSheet({ activeBalance, form, setForm, onClose, onSubmit }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Tarik saldo digital">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 240 }}
        className="relative w-full max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-card border-t border-x border-border flex flex-col"
      >
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 flex-shrink-0">
          <div>
            <div className="text-[0.6rem] font-black uppercase tracking-widest text-emerald-400">Penarikan saldo digital</div>
            <h2 className="text-lg font-black text-foreground tracking-tight mt-0.5">Tarik poin ke akun digital</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 pb-8">
          {/* balance banner */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
            <div>
              <div className="text-[0.6rem] font-black uppercase tracking-widest text-emerald-400">Saldo aktif</div>
              <div className="text-2xl font-black text-foreground tracking-tight mt-0.5">{formatPoints(activeBalance)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">poin tersedia</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          {/* form */}
          <div className="flex flex-col gap-4 p-5 rounded-3xl bg-secondary/40 border border-border">
            <Field
              label="Provider"
              value={form.provider}
              onChange={(v) => setForm((p) => ({ ...p, provider: v }))}
              select
              options={E_WALLETS}
              icon={<Wallet className="w-3.5 h-3.5" />}
            />
            <Field
              label="Nomor rekening / no HP"
              value={form.account}
              onChange={(v) => setForm((p) => ({ ...p, account: v }))}
              placeholder="Isi nomor tujuan"
              icon={<User className="w-3.5 h-3.5" />}
            />
            <Field
              label="Nama rekening"
              value={form.owner}
              onChange={(v) => setForm((p) => ({ ...p, owner: v }))}
              placeholder="Isi nama pemilik akun"
              icon={<Bell className="w-3.5 h-3.5" />}
            />
            <Field
              label="Jumlah poin"
              value={form.amount}
              onChange={(v) => setForm((p) => ({ ...p, amount: digitsOnly(v, 7) }))}
              placeholder="Minimal 100"
              icon={<TrendingUp className="w-3.5 h-3.5" />}
            />
            <Field
              label="PIN konfirmasi"
              value={form.pin}
              onChange={(v) => setForm((p) => ({ ...p, pin: digitsOnly(v, 6) }))}
              placeholder="Masukkan PIN 6 digit"
              icon={<Lock className="w-3.5 h-3.5" />}
              password
            />
          </div>

          {/* warning */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/8 border border-amber-500/20 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            Penarikan hanya diproses jika saldo aktif mencukupi dan PIN sesuai.
          </div>

          {/* actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onSubmit}
              className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20"
            >
              Ajukan Penarikan
            </button>
            <button
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 active:scale-[0.98] text-foreground font-semibold text-sm transition-all duration-150"
            >
              Batal
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
