"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { Toast, cx } from "@/lib/gc-data";

type Props = { toast: Toast; onDismiss: () => void };

const toneConfig = {
  success: {
    bg: "bg-emerald-500/15 border-emerald-500/30",
    icon: CheckCircle,
    iconClass: "text-emerald-400",
  },
  info: {
    bg: "bg-sky-500/15 border-sky-500/30",
    icon: Info,
    iconClass: "text-sky-400",
  },
  warning: {
    bg: "bg-amber-500/15 border-amber-500/30",
    icon: AlertTriangle,
    iconClass: "text-amber-400",
  },
};

export default function ToastBanner({ toast, onDismiss }: Props) {
  const config = toneConfig[toast.tone];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ type: "spring", damping: 22, stiffness: 260 }}
      className={cx(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(min(100vw,480px)-2rem)]",
        "flex items-center gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl",
        config.bg,
      )}
      role="alert"
      aria-live="assertive"
    >
      <Icon className={cx("w-4 h-4 flex-shrink-0", config.iconClass)} />
      <div className="flex-1 text-sm font-semibold text-foreground leading-snug">{toast.text}</div>
      <button
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
