import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
  label?: string;
}

export function PhoneFrame({ children, label }: PhoneFrameProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
      <div className="relative h-[640px] w-[320px] rounded-[2.5rem] border border-border bg-card p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]">
        <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-foreground/90" />
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}
