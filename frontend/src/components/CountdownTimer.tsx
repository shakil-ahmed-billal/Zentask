"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  deadline: string;
}

export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  } | null>(null);

  useEffect(() => {
    const target = new Date(deadline).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        const absDiff = Math.abs(difference);
        setTimeLeft({
          days: Math.floor(absDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((absDiff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((absDiff / 1000 / 60) % 60),
          seconds: Math.floor((absDiff / 1000) % 60),
          isOverdue: true,
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOverdue: false,
      });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) return <span className="text-muted-foreground">—</span>;

  const { days, hours, minutes, seconds, isOverdue } = timeLeft;

  return (
    <div
      className={`font-mono text-xs font-medium tabular-nums ${
        isOverdue
          ? "text-red-500"
          : days <= 3
            ? "text-orange-500"
            : "text-emerald-500"
      }`}
    >
      {isOverdue ? "- " : ""}
      {days > 0 && `${days}d `}
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </div>
  );
}
