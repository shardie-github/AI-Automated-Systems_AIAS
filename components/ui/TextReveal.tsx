"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  splitBy?: "words" | "chars" | "none";
}

const defaultVariants: Variants = {
  hidden: {
    y: 20,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1], // Custom easing for smooth reveal
    },
  },
};

export function TextReveal({
  children,
  className,
  delay = 0,
  duration = 0.5,
  staggerDelay = 0.05,
  as: Component = "h1",
  splitBy = "words",
}: TextRevealProps) {
  const text = typeof children === "string" ? children : String(children);

  let items: string[] = [];
  if (splitBy === "words") {
    items = text.split(/\s+/).filter(Boolean);
  } else if (splitBy === "chars") {
    items = text.split("");
  } else {
    items = [text];
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className={cn("inline-block", className)}
    >
      {splitBy === "none" ? (
        <Component>{children}</Component>
      ) : (
        <Component className="inline-block">
          {items.map((item, index) => (
            <motion.span
              key={index}
              variants={itemVariants}
              className="inline-block"
              style={splitBy === "words" && index < items.length - 1 ? { marginRight: "0.25em" } : {}}
            >
              {item}
              {splitBy === "words" && index < items.length - 1 ? "\u00A0" : ""}
            </motion.span>
          ))}
        </Component>
      )}
    </motion.div>
  );
}
