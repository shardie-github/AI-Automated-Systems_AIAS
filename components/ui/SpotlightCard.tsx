"use client";

import { useRef, useState, MouseEvent, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(6, 182, 212, 0.15)",
  spotlightSize = 600,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7.5, -7.5]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7.5, 7.5]), {
    stiffness: 150,
    damping: 15,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXRelative = (e.clientX - rect.left) / width;
    const mouseYRelative = (e.clientY - rect.top) / height;

    mouseX.set(mouseXRelative);
    mouseY.set(mouseYRelative);

    // Update CSS variables for gradient
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (cardRef.current) {
      cardRef.current.style.setProperty("--mouse-x", `${x}px`);
      cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative group rounded-2xl p-6 transition-all duration-300",
        "glass-morphism",
        "border border-white/10",
        "hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]",
        className
      )}
    >
      {/* Spotlight gradient overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(${spotlightSize}px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${spotlightColor}, rgba(168, 85, 247, 0.1), transparent 40%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Shine effect on border */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(${spotlightSize * 0.8}px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), transparent 40%, rgba(6, 182, 212, 0.1))`,
          }}
        />
      </div>
    </motion.div>
  );
}
