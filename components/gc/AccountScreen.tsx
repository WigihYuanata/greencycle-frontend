"use client";

import { motion } from "framer-motion";
import { User, Lock, Bell, Home, Zap, LogOut, Link2, TrendingUp, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  AuthMode, FACULTIES, cx, digitsOnly,
} from "@/lib/gc-data";

type Profile = { name: string; npm: string; faculty: string; email: string };
type LoginForm = { npm: string; pin: string };
type RegisterForm = { npm: string; name: string; faculty: string; email: string; pin: string; confirmPin: string };
type ForgotForm = { npm: string; otp: string; pin: string; confirmPin: string };

type Props = {
  isLoggedIn: boolean;
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
  onGoPairing: () => void;
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
            <option value="">Pilih salah satu</option>
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
            aria-label={show ? "Sembunyikan PIN" : "Tampilkan PIN"}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </label>
  );
}

export default function AccountScreen({
  isLoggedIn, authMode, setAuthMode,
  profile, loginForm, setLoginForm, registerForm, setRegisterForm,
  forgotStep, setForgotStep, forgotForm, setForgotForm,
  onLogin, onRegister, onForgot, onLogout, onGoDashboard, onGoPairing,
}: Props) {
  const initials = profile.name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  if (isLoggedIn) {
    return (
      <div className="flex flex-col gap-6 pt-2 pb-4">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="text-[0.65rem] font-black uppercase tracking-widest text-emerald-400 mb-1">Akun mahasiswa</div>
          <h2 className="text-2xl font-black tracking-tight text-foreground leading-none">Akun kamu</h2>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Semua data penting disusun ringkas agar nyaman diakses dari HP.
          </p>
        </motion.section>

        {/* profile card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07 }}
          className="relative overflow-hidden rounded-3xl bg-emerald-500/10 border border-emerald-500/25 p-5 flex items-center gap-4"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg font-black text-emerald-400 flex-shrink-0 z-10">
            {initials}
          </div>
          <div className="min-w-0 z-10">
            <div className="text-base font-black text-foreground truncate">{profile.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">{profile.npm} · {profile.faculty}</div>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">{profile.email}</div>
          </div>
        </motion.div>

        {/* account actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
          className="flex flex-col gap-2"
        >
          {[
            { icon: Link2, label: "Hubungkan Kartu", sub: "Pairing satu kali ke Smart BIN terdekat", action: onGoPairing, accent: true },
            { icon: TrendingUp, label: "Buka Dashboard", sub: "Saldo aktif, tren, dan aktivitas", action: onGoDashboard, accent: false },
            { icon: LogOut, label: "Keluar", sub: "Amankan sesi jika sudah selesai", action: onLogout, accent: false },
          ].map(({ icon: Icon, label, sub, action, accent }) => (
            <button
              key={label}
              onClick={action}
              className={cx(
                "flex items-center gap-3.5 p-3.5 rounded-2xl border text-left active:scale-[0.99] transition-all duration-150",
                accent
                  ? "bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/15"
                  : "bg-card border-border hover:border-emerald-500/30 hover:bg-emerald-500/5",
              )}
            >
              <div className={cx(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                accent ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground",
              )}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
              </div>
            </button>
          ))}
        </motion.div>
      </div>
    );
  }

  // ── AUTH FORMS ──
  return (
    <div className="flex flex-col gap-6 pt-2 pb-4">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="text-[0.65rem] font-black uppercase tracking-widest text-emerald-400 mb-1">Autentikasi</div>
        <h2 className="text-2xl font-black tracking-tight text-foreground leading-none">Masuk atau daftar</h2>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Flow dibuat singkat, jelas, dan ramah untuk browser HP.
        </p>
      </motion.section>

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
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="flex flex-col gap-4 p-5 rounded-3xl bg-card border border-border"
        >
          <Field
            label="NPM"
            value={loginForm.npm}
            onChange={(v) => setLoginForm((p) => ({ ...p, npm: digitsOnly(v, 20) }))}
            placeholder="Masukkan NPM"
            icon={<User className="w-3.5 h-3.5" />}
          />
          <Field
            label="PIN 6 digit"
            value={loginForm.pin}
            onChange={(v) => setLoginForm((p) => ({ ...p, pin: digitsOnly(v, 6) }))}
            placeholder="Masukkan PIN"
            icon={<Lock className="w-3.5 h-3.5" />}
            password
          />
          <button
            onClick={onLogin}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20"
          >
            Masuk
          </button>
        </motion.div>
      )}

      {/* REGISTER */}
      {authMode === "register" && (
        <motion.div
          key="register"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="flex flex-col gap-4 p-5 rounded-3xl bg-card border border-border"
        >
          <Field
            label="NPM"
            value={registerForm.npm}
            onChange={(v) => setRegisterForm((p) => ({ ...p, npm: digitsOnly(v, 20) }))}
            placeholder="Masukkan NPM"
            icon={<User className="w-3.5 h-3.5" />}
          />
          <Field
            label="Nama lengkap"
            value={registerForm.name}
            onChange={(v) => setRegisterForm((p) => ({ ...p, name: v }))}
            placeholder="Masukkan nama kamu"
            icon={<Zap className="w-3.5 h-3.5" />}
          />
          <Field
            label="Fakultas"
            value={registerForm.faculty}
            onChange={(v) => setRegisterForm((p) => ({ ...p, faculty: v }))}
            select
            options={FACULTIES}
            icon={<Home className="w-3.5 h-3.5" />}
          />
          <Field
            label="Email kampus"
            value={registerForm.email}
            onChange={(v) => setRegisterForm((p) => ({ ...p, email: v }))}
            placeholder="contoh@student.upnjatim.ac.id"
            icon={<Bell className="w-3.5 h-3.5" />}
          />
          <Field
            label="PIN 6 digit"
            value={registerForm.pin}
            onChange={(v) => setRegisterForm((p) => ({ ...p, pin: digitsOnly(v, 6) }))}
            placeholder="Buat PIN"
            icon={<Lock className="w-3.5 h-3.5" />}
            password
          />
          <Field
            label="Konfirmasi PIN"
            value={registerForm.confirmPin}
            onChange={(v) => setRegisterForm((p) => ({ ...p, confirmPin: digitsOnly(v, 6) }))}
            placeholder="Ulangi PIN"
            icon={<Lock className="w-3.5 h-3.5" />}
            password
          />
          <button
            onClick={onRegister}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20"
          >
            Daftar Sekarang
          </button>
        </motion.div>
      )}

      {/* FORGOT */}
      {authMode === "forgot" && (
        <motion.div
          key="forgot"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="flex flex-col gap-4 p-5 rounded-3xl bg-card border border-border"
        >
          {/* step indicator */}
          <div className="flex items-center gap-2">
            <div className={cx("flex-1 h-1 rounded-full transition-all", forgotStep >= 1 ? "bg-emerald-500" : "bg-secondary")} />
            <div className={cx("flex-1 h-1 rounded-full transition-all", forgotStep >= 2 ? "bg-emerald-500" : "bg-secondary")} />
          </div>

          {forgotStep === 1 ? (
            <>
              <Field
                label="NPM"
                value={forgotForm.npm}
                onChange={(v) => setForgotForm((p) => ({ ...p, npm: digitsOnly(v, 20) }))}
                placeholder="Masukkan NPM"
                icon={<User className="w-3.5 h-3.5" />}
              />
              <button
                onClick={onForgot}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150"
              >
                Lanjut verifikasi
              </button>
            </>
          ) : (
            <>
              <Field
                label="OTP 6 digit"
                value={forgotForm.otp}
                onChange={(v) => setForgotForm((p) => ({ ...p, otp: digitsOnly(v, 6) }))}
                placeholder="Masukkan OTP"
                icon={<Bell className="w-3.5 h-3.5" />}
              />
              <Field
                label="PIN baru"
                value={forgotForm.pin}
                onChange={(v) => setForgotForm((p) => ({ ...p, pin: digitsOnly(v, 6) }))}
                placeholder="Buat PIN baru"
                icon={<Lock className="w-3.5 h-3.5" />}
                password
              />
              <Field
                label="Konfirmasi PIN baru"
                value={forgotForm.confirmPin}
                onChange={(v) => setForgotForm((p) => ({ ...p, confirmPin: digitsOnly(v, 6) }))}
                placeholder="Ulangi PIN baru"
                icon={<Lock className="w-3.5 h-3.5" />}
                password
              />
              <button
                onClick={onForgot}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150"
              >
                Simpan PIN baru
              </button>
              <button
                onClick={() => setForgotStep(1)}
                className="w-full h-11 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 active:scale-[0.98] text-foreground font-semibold text-sm transition-all duration-150"
              >
                Kembali ke langkah awal
              </button>
            </>
          )}
        </motion.div>
      )}

      {/* CTA */}
      <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-black text-foreground tracking-tight text-balance">
            Siap dibuat terhubung ke Smart BIN?
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Setelah masuk, pairing dan transaksi jadi jauh lebih cepat.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onGoPairing}
            className="w-full h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all duration-150"
          >
            Hubungkan Kartu
          </button>
          <button
            onClick={onGoDashboard}
            className="w-full h-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] text-foreground font-semibold text-sm transition-all duration-150"
          >
            Lihat Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
