
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import "@/app/gsap-flip.css";

export function GsapFlipSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const layouts = ["final", "plain", "columns", "grid"];
  const curLayoutRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    gsap.registerPlugin(Flip);

    const container = containerRef.current;
    if (!container) return;

    let timer: gsap.core.DelayedCall;

    const nextState = () => {
      if (!container) return;

      // التقاط الحالة الحالية للأحرف والنصوص
      const state = Flip.getState(".letter, .tix-text", {
        props: "color,backgroundColor",
        simple: true,
      });

      // إزالة الكلاس القديم وإضافة الجديد
      container.classList.remove(layouts[curLayoutRef.current]);
      curLayoutRef.current = (curLayoutRef.current + 1) % layouts.length;
      container.classList.add(layouts[curLayoutRef.current]);

      // تنفيذ الحركة الانتقالية
      Flip.from(state, {
        absolute: true,
        stagger: 0.07,
        duration: 0.7,
        ease: "power2.inOut",
        spin: curLayoutRef.current === 0, // دوران فقط عند العودة للحالة النهائية (EVEN)
        simple: true,
        onEnter: (elements, animation) =>
          gsap.fromTo(
            elements,
            { opacity: 0 },
            { opacity: 1, delay: animation.duration() - 0.1 }
          ),
        onLeave: (elements) => gsap.to(elements, { opacity: 0 }),
      });

      // جدولة الحركة القادمة
      timer = gsap.delayedCall(curLayoutRef.current === 0 ? 3.5 : 1.5, nextState);
    };

    // البدء بعد ثانية واحدة
    timer = gsap.delayedCall(1, nextState);

    return () => {
      if (timer) timer.kill();
    };
  }, []);

  return (
    <section className="gsap-flip-wrapper" dir="ltr">
      <div 
        ref={containerRef} 
        className="gsap-flip-container final"
      >
        <div className="letter E1">E</div>
        <div className="letter V">V</div>
        <div className="letter E2">E</div>
        <div className="letter N">N</div>
        <div className="tix-text">TIX</div>
      </div>
    </section>
  );
}
