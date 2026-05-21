import Image from "next/image";

interface UpnLogoProps {
  size?: number;
  className?: string;
}

export default function UpnLogo({ size = 32, className = "" }: UpnLogoProps) {
  return (
    <Image
      src="/upn-logo.png"
      alt="Logo UPN Veteran Jawa Timur"
      width={size}
      height={size}
      className={`flex-shrink-0 ${className}`}
      priority
    />
  );
}
