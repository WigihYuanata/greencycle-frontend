'use client';

import { useEffect, useState } from 'react';
import { Toast } from '@/lib/gc-data';

interface ToastBannerProps {
  toast: Toast | null;
  onDismiss: () => void;
}

export default function ToastBanner({
  toast,
  onDismiss,
}: ToastBannerProps) {
  const [show, setShow] = useState(!!toast);

  useEffect(() => {
    setShow(!!toast);
    if (toast) {
      const timer = setTimeout(() => {
        setShow(false);
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!show || !toast) return null;

  const bgColor = toast.tone === 'success' 
    ? 'bg-green-100 text-green-800 border-green-300'
    : toast.tone === 'error'
    ? 'bg-red-100 text-red-800 border-red-300'
    : 'bg-blue-100 text-blue-800 border-blue-300';

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-4 border-b ${bgColor}`}>
      <div className="max-w-md mx-auto text-sm font-medium">{toast.msg}</div>
    </div>
  );
}
