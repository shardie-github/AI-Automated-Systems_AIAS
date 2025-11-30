"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ParallaxBackgroundProps {
  children?: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
  intensity?: number;
}

interface BlobProps {
  className?: string;
  speed?: number;
  initialX?: number;
  initialY?: number;
}

function Blob({ className, speed = 0.5, initialX = 0, initialY = 0 }: BlobProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, x: initialX }}
      className={cn("absolute rounded-full blur-3xl", className)}
    />
  );
}

export function ParallaxBackground({
  children,
  className,
  speed = 0.5,
  direction = "down",
  intensity = 1,
}: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "down" ? [0, 100 * speed * intensity] : [0, -100 * speed * intensity]
  );

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Animated blobs for depth */}
      <Blob
        className="w-96 h-96 bg-cyan-500/20 -top-48 -left-48"
        speed={0.3}
        initialX={-192}
        initialY={-192}
      />
      <Blob
        className="w-80 h-80 bg-purple-500/20 top-1/4 right-1/4"
        speed={0.4}
        initialX={0}
        initialY={0}
      />
      <Blob
        className="w-72 h-72 bg-pink-500/20 bottom-1/4 left-1/3"
        speed={0.5}
        initialX={0}
        initialY={0}
      />
      <Blob
        className="w-64 h-64 bg-blue-500/20 top-1/2 right-1/3"
        speed={0.35}
        initialX={0}
        initialY={0}
      />

      {/* Parallax content wrapper */}
      <motion.div style={{ y: backgroundY }} className="relative z-10">
        {children}
      </motion.div>
    </div>
  );
}
