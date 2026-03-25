"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

interface SeatMapProps {
  onSeatSelect: (seats: string[]) => void;
  maxSeats?: number;
}

export function SeatMap({ onSeatSelect, maxSeats = 6 }: SeatMapProps) {
  const sections = ["المنصة الرئيسية", "القسم الجانبي A", "القسم الجانبي B"];
  const [currentSection, setCurrentSection] = useState(0);
  
  const rows = ["A", "B", "C", "D", "E", "F"];
  const cols = Array.from({ length: 12 }, (_, i) => i + 1);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const soldSeats = useMemo(() => {
    return ["A-10", "A-11", "B-8", "C-4", "D-2", "F-9", "F-10", "F-11"];
  }, []);

  const toggleSeat = (seatId: string) => {
    if (soldSeats.includes(seatId)) return;

    let newSelection: string[];
    const fullId = `${sections[currentSection]}-${seatId}`;
    
    if (selectedSeats.includes(fullId)) {
      newSelection = selectedSeats.filter((s) => s !== fullId);
    } else {
      if (selectedSeats.length >= maxSeats) return;
      newSelection = [...selectedSeats, fullId];
    }
    
    setSelectedSeats(newSelection);
    onSeatSelect(newSelection);
  };

  const nextSection = () => setCurrentSection((prev) => (prev + 1) % sections.length);
  const prevSection = () => setCurrentSection((prev) => (prev - 1 + sections.length) % sections.length);

  return (
    <div className="w-full bg-[#020617] py-12 px-4 rounded-[2.5rem] overflow-hidden border border-white/5 max-w-full">
      <div className="max-w-full mx-auto flex flex-col items-center gap-16">
        
        {/* واجهة المسرح المحدثة - اللون الأبيض النقي */}
        <div className="w-full flex flex-col items-center">
          <div className="w-3/4 h-2 bg-white/20 rounded-full mb-1" />
          <div className="w-3/4 h-8 bg-white rounded-t-[3rem] border-t-2 border-white/10 flex items-center justify-center shadow-[0_-10px_30px_rgba(255,255,255,0.1)]">
            <span className="text-[10px] text-slate-900/60 font-black uppercase tracking-[0.3em] mt-2">STAGE / FRONT</span>
          </div>
        </div>

        {/* محدد القسم */}
        <div className="flex items-center gap-4 sm:gap-8 bg-white/5 p-2 rounded-2xl border border-white/10 max-w-full">
          <Button variant="ghost" size="icon" onClick={prevSection} className="text-primary hover:bg-primary/10">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="text-center min-w-[120px] sm:min-w-[150px]">
            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">القسم الحالي</p>
            <h4 className="text-xs sm:text-sm font-black text-white truncate">{sections[currentSection]}</h4>
          </div>
          <Button variant="ghost" size="icon" onClick={nextSection} className="text-primary hover:bg-primary/10">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* شبكة المقاعد - مع حاوية تمرير داخلية فقط */}
        <div className="relative group w-full overflow-x-auto pb-4 scrollbar-hide">
          <div className="grid gap-6 min-w-[600px] justify-items-center">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-6">
                <span className="w-6 text-sm font-black text-primary/60 text-center">{row}</span>
                <div className="flex gap-3">
                  {cols.map((col) => {
                    const seatId = `${row}-${col}`;
                    const fullId = `${sections[currentSection]}-${seatId}`;
                    const isSold = soldSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(fullId);

                    return (
                      <button
                        key={seatId}
                        onClick={() => toggleSeat(seatId)}
                        disabled={isSold}
                        className={cn(
                          "w-7 h-8 rounded-t-[10px] transition-all duration-300 relative group/seat",
                          isSold 
                            ? "bg-white/5 cursor-not-allowed opacity-20" 
                            : isSelected 
                              ? "bg-primary border-t-2 border-white/20 scale-110 shadow-none" 
                              : "bg-[#1e293b] border border-white/5 hover:bg-[#334155] hover:scale-110"
                        )}
                        title={isSold ? "محجوز" : `مقعد ${seatId}`}
                      >
                        {!isSold && (
                          <div className={cn(
                            "absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 rounded-full",
                            isSelected ? "bg-white/20" : "bg-white/5"
                          )} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <span className="w-6 text-sm font-black text-primary/60 text-center">{row}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 mt-6 px-12 min-w-[600px] justify-center">
            <div className="flex gap-3 flex-1 justify-center">
              {cols.map(c => (
                <span key={c} className="w-7 text-[9px] font-black text-muted-foreground text-center">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* وسيلة الإيضاح */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[9px] sm:text-[10px] font-black bg-white/5 px-4 sm:px-10 py-4 rounded-3xl border border-white/10 uppercase tracking-widest w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-t-sm bg-[#1e293b] border border-white/10" />
            <span className="text-muted-foreground">متاح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-t-sm bg-primary" />
            <span className="text-primary">مختار</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-t-sm bg-white/5 opacity-30" />
            <span className="text-muted-foreground/50">محجوز</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/10 max-w-sm text-center">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
            استخدم السحب الأفقي داخل منطقة المقاعد للتنقل واختيار مكانك المفضل.
          </p>
        </div>
      </div>
    </div>
  );
}