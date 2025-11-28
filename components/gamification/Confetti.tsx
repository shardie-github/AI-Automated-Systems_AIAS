"use client";
import { useEffect } from "react";
export default function Confetti({ when=false }: { when?: boolean }) {
  useEffect(()=>{ 
    if(!when) return; 
    // @ts-ignore - canvas-confetti types
    import("canvas-confetti").then((mod: any)=>{
      const confetti = mod.default || mod;
      confetti({ particleCount: 120, spread: 60, origin: { y: 0.6 } });
    });
  }, [when]);
  return null;
}
