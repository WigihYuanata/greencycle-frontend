"use client";

import { motion } from "framer-motion";
import { User, Lock, Bell, LogOut, TrendingUp, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { AuthMode, FACULTIES, cx, digitsOnly } from "@/lib/gc-data";

type Profile = { name: string; npm: string; faculty: string; email: string };
type LoginForm = { npm: string; pin: string };
type RegisterForm = { npm: string; name: string; faculty: string; email: string; pin: string; confirmPin: string };
type ForgotForm = { npm: string; otp: string; pin: string; confirmPin: string };

type Props = {
  isLoggedIn: boolean;
  isSubmitting: boolean;
  authMode: AuthMode;
  setAuthMode: React.Dispatch<React.SetStateAction<AuthMode>>;
  profile: Profile;
  loginForm: LoginForm;
  setLoginForm: React.Dispatch<React.SetStateAction<LoginForm>>;
  registerForm: RegisterForm;
  setRegisterForm: React.Dispatch<React.SetStateAction<RegisterForm>>;
  forgotStep: 1 | 2;
  setForgotStep: React.Dispatch<React.SetStateAction<1 | 2>>;
  forgotForm: ForgotForm;
  setForgotForm: React.Dispatch<React.SetStateAction<ForgotForm>>;
  onLogin: () => void;
  onRegister: () => void;
  onForgot: () => void;
  onLogout: () => void;
  onGoDashboard: () => void;
};

function Field({
  label, value, onChange, placeholder, icon, password, select, options, disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  password?: boolean;
  select?: boolean;
  options?: string[];
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {icon}
        {label}
      </label>
      <div className="relative">
        {select ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full h-11 rounded-2xl bg-secondary border border-border px-3 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Pilih salah satu</option>
            {(options ?? []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={password && !show ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            inputMode={password ? "numeric" : "text"}
            className="w-full h-11 rounded-2xl bg-secondary border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        )}
        {password && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={show ? "Sembunyikan PIN" : "Tampilkan PIN"}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AccountScreen({
  isLoggedIn, isSubmitting, authMode, setAuthMode,
  profile, loginForm, setLoginForm, registerForm, setRegisterForm,
  forgotStep, setForgotStep, forgotForm, setForgotForm,
  onLogin, onRegister, onForgot, onLogout, onGoDashboard,
}: Props) {
  const initials = profile.name
    ? profile.name.split(" ").map((p) => p[0]).slice(0, 2).join("")
    : "GC";

  if (isLoggedIn) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-4 pt-5 flex flex-col gap-6"
        aria-label="Akun mahasiswa"
      >
        <div>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Profil</p>
          <h1 className="text-xl font-bold text-foreground mt-0.5">Akun kamu</h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Semua data penting disusun ringkas agar nyaman diakses.
          </p>
        </div>

        {/* profile card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base text-foreground truncate">{profile.name}</p>
            <p className="text-sm text-muted-foreground truncate">{profile.npm}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.faculty}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
        </div>

        {/* account actions */}
        <div className="flex flex-col gap-2">
          {[
            {
              icon: TrendingUp, label: "Buka Dashboard",
              sub: "Saldo aktif, tren, dan aktivitas",
              action: onGoDashboard, accent: true,
            },
            {
              icon: LogOut, label: "Keluar",
              sub: "Amankan sesi jika sudah selesai",
              action: onLogout, accent: false,
            },
          ].map(({ icon: Icon, label, sub, action, accent }) => (
            <button
              key={label}
              onClick={action}
              className={cx(
                "flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-150 active:scale-[0.99]",
                accent
                  ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15"
                  : "bg-secondary/50 border-border hover:bg-secondary",
              )}
            >
              <div className={cx(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                accent ? "bg-emerald-500/20" : "bg-secondary",
              )}>
                <Icon className={cx("w-4 h-4", accent ? "text-emerald-400" : "text-muted-foreground")} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground truncate">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.section>
    );
  }

  // ── AUTH FORMS ──
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-4 pt-5 flex flex-col gap-6"
      aria-label="Autentikasi"
    >
      <div>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Autentikasi</p>
        <h1 className="text-xl font-bold text-foreground mt-0.5">Masuk atau daftar</h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
        </p>
      </div>

      {/* auth tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-secondary/60 border border-border">
        {([["login", "Masuk"], ["register", "Daftar"], ["forgot", "Lupa PIN"]] as const).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setAuthMode(mode)}
            className={cx(
              "flex-1 h-9 rounded-xl text-xs font-bold transition-all duration-200",
              authMode === mode
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* LOGIN */}
      {authMode === "login" && (
        <div className="flex flex-col gap-3">
          <Field
            label="NPM"
            value={loginForm.npm}
            onChange={(v) => setLoginForm((p) => ({ ...p, npm: digitsOnly(v, 20) }))}
            placeholder="Masukkan NPM"
            icon={<User className="w-3.5 h-3.5" />}
            disabled={isSubmitting}
          />
          <Field
            label="PIN"
            value={loginForm.pin}
            onChange={(v) => setLoginForm((p) => ({ ...p, pin: digitsOnly(v, 6) }))}
            placeholder="Masukkan PIN"
            icon={<Lock className="w-3.5 h-3.5" />}
            password
            disabled={isSubmitting}
          />
          <button
            onClick={onLogin}
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Memproses...</> : "Masuk"}
          </button>
        </div>
      )}

      {/* REGISTER */}
      {authMode === "register" && (
        <div className="flex flex-col gap-3">
          <Field
            label="NPM"
            value={registerForm.npm}
            onChange={(v) => setRegisterForm((p) => ({ ...p, npm: digitsOnly(v, 20) }))}
            placeholder="Masukkan NPM"
            icon={<User className="w-3.5 h-3.5" />}
            disabled={isSubmitting}
          />
          <Field
            label="Nama lengkap"
            value={registerForm.name}
            onChange={(v) => setRegisterForm((p) => ({ ...p, name: v }))}
            placeholder="Masukkan nama kamu"
            icon={<User className="w-3.5 h-3.5" />}
            disabled={isSubmitting}
          />
          <Field
            label="Fakultas"
            value={registerForm.faculty}
            onChange={(v) => setRegisterForm((p) => ({ ...p, faculty: v }))}
            icon={<Bell className="w-3.5 h-3.5" />}
            select
            options={FACULTIES}
            disabled={isSubmitting}
          />
          <Field
            label="Email kampus"
            value={registerForm.email}
            onChange={(v) => setRegisterForm((p) => ({ ...p, email: v }))}
            placeholder="contoh@student.upnjatim.ac.id"
            icon={<Mail className="w-3.5 h-3.5" />}
            disabled={isSubmitting}
          />
          <Field
            label="PIN (6 digit)"
            value={registerForm.pin}
            onChange={(v) => setRegisterForm((p) => ({ ...p, pin: digitsOnly(v, 6) }))}
            placeholder="Buat PIN"
            icon={<Lock className="w-3.5 h-3.5" />}
            password
            disabled={isSubmitting}
          />
          <Field
            label="Konfirmasi PIN"
            value={registerForm.confirmPin}
            onChange={(v) => setRegisterForm((p) => ({ ...p, confirmPin: digitsOnly(v, 6) }))}
            placeholder="Ulangi PIN"
            icon={<Lock className="w-3.5 h-3.5" />}
            password
            disabled={isSubmitting}
          />
          <button
            onClick={onRegister}
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Memproses...</> : "Daftar Sekarang"}
          </button>
        </div>
      )}

      {/* FORGOT */}
      {authMode === "forgot" && (
        <div className="flex flex-col gap-3">
          {/* step indicator */}
          <div className="flex gap-1.5 mb-1">
            <div className={cx("h-1 flex-1 rounded-full transition-colors", forgotStep >= 1 ? "bg-emerald-500" : "bg-secondary")} />
            <div className={cx("h-1 flex-1 rounded-full transition-colors", forgotStep >= 2 ? "bg-emerald-500" : "bg-secondary")} />
          </div>

          {forgotStep === 1 ? (
            <>
              <Field
                label="NPM"
                value={forgotForm.npm}
                onChange={(v) => setForgotForm((p) => ({ ...p, npm: digitsOnly(v, 20) }))}
                placeholder="Masukkan NPM"
                icon={<User className="w-3.5 h-3.5" />}
                disabled={isSubmitting}
              />
              <button
                onClick={onForgot}
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Mengirim...</> : "Lanjut verifikasi"}
              </button>
            </>
          ) : (
            <>
              <Field
                label="Kode OTP (dari email kampus)"
                value={forgotForm.otp}
                onChange={(v) => setForgotForm((p) => ({ ...p, otp: digitsOnly(v, 6) }))}
                placeholder="Masukkan OTP 6 digit"
                icon={<Mail className="w-3.5 h-3.5" />}
                disabled={isSubmitting}
              />
              <Field
                label="PIN baru"
                value={forgotForm.pin}
                onChange={(v) => setForgotForm((p) => ({ ...p, pin: digitsOnly(v, 6) }))}
                placeholder="Buat PIN baru"
                icon={<Lock className="w-3.5 h-3.5" />}
                password
                disabled={isSubmitting}
              />
              <Field
                label="Konfirmasi PIN baru"
                value={forgotForm.confirmPin}
                onChange={(v) => setForgotForm((p) => ({ ...p, confirmPin: digitsOnly(v, 6) }))}
                placeholder="Ulangi PIN baru"
                icon={<Lock className="w-3.5 h-3.5" />}
                password
                disabled={isSubmitting}
              />
              <button
                onClick={onForgot}
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : "Simpan PIN baru"}
              </button>
              <button
                onClick={() => setForgotStep(1)}
                disabled={isSubmitting}
                className="w-full h-11 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 active:scale-[0.98] text-foreground font-semibold text-sm transition-all duration-150 disabled:opacity-50"
              >
                Kembali ke langkah awal
              </button>
            </>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="rounded-2xl bg-secondary/60 border border-border p-4 flex flex-col gap-3">
        <p className="font-bold text-sm text-foreground text-balance">Siap untuk mendaur ulang?</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Datang ke Smart BIN terdekat dan tap KTM-mu untuk mulai berkontribusi.
        </p>
        <button
          onClick={onGoDashboard}
          className="w-full h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-semibold text-xs hover:bg-emerald-500/20 transition-colors"
        >
          Lihat Dashboard
        </button>
      </div>
    </motion.section>
  );
}
