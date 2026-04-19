
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Info, MoveHorizontal } from "lucide-react";

interface SeatMapProps {
  onSeatSelect: (seats: string[]) => void;
  maxSeats?: number;
}

export function SeatMap({ onSeatSelect, maxSeats = 4 }: SeatMapProps) {
  const { toast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // محاكاة المقاعد المحجوزة
  const soldSeats = ["A10", "B11", "C4", "D2", "F9", "F10", "F11", "M5", "L22", "K10", "K11"];

  const toggleSeat = (seatId: string) => {
    if (soldSeats.includes(seatId)) return;

    let newSelection: string[];
    
    if (selectedSeats.includes(seatId)) {
      newSelection = selectedSeats.filter((s) => s !== seatId);
    } else {
      if (selectedSeats.length >= maxSeats) {
        toast({
          variant: "destructive",
          title: "تنبيه البروتوكول",
          description: `يمكنك اختيار حتى ${maxSeats} مقاعد فقط.`
        });
        return;
      }
      newSelection = [...selectedSeats, seatId];
    }
    
    setSelectedSeats(newSelection);
    onSeatSelect(newSelection);
  };

  const renderSeat = (seatId: string, isEmpty: boolean = false) => {
    if (isEmpty) return <td key={Math.random()} className="w-6 h-6 md:w-8 md:h-8 p-0.5"></td>;
    
    const isSold = soldSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);

    return (
      <td key={seatId} className="p-0.5">
        <button
          onClick={() => toggleSeat(seatId)}
          disabled={isSold}
          className={cn(
            "w-7 h-7 md:w-8 md:h-8 rounded-md text-[8px] md:text-[9px] font-black transition-all duration-300",
            isSold 
              ? "bg-white/5 cursor-not-allowed opacity-10 text-transparent" 
              : isSelected 
                ? "bg-primary text-white scale-110 shadow-lg shadow-primary/40 ring-2 ring-primary/20" 
                : "bg-white/10 text-white/30 hover:bg-white/20 hover:text-white"
          )}
        >
          {seatId}
        </button>
      </td>
    );
  };

  return (
    <div className="w-full bg-black/40 py-8 md:py-16 px-4 flex flex-col items-center">
      
      {/* Mobile Interaction Hint */}
      <div className="flex md:hidden items-center gap-2 mb-6 text-primary animate-pulse bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
        <MoveHorizontal className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">اسحب لليسار لرؤية باقي المقاعد</span>
      </div>

      <div className="w-full overflow-x-auto pb-8 scrollbar-hide flex flex-col items-center cursor-grab active:cursor-grabbing">
        <div className="min-w-[700px] flex flex-col items-center gap-10">
          
          {/* Stage / Screen */}
          <div className="w-2/3 flex flex-col items-center mb-4">
            <div className="w-full h-1.5 bg-primary/30 rounded-full mb-1" />
            <div className="w-full h-10 bg-white rounded-t-[3rem] flex items-center justify-center shadow-[0_-10px_30px_rgba(255,255,255,0.1)]">
              <span className="text-[9px] md:text-[10px] text-slate-900 font-black uppercase tracking-[0.5em] mt-2">KINGDOM ARENA STAGE</span>
            </div>
          </div>

          <table className="border-separate border-spacing-1">
            <tbody>
              {/* Row A */}
              <tr>
                {Array(7).fill(0).map(() => renderSeat("", true))}
                {["A8", "A9", "A10", "A11"].map(id => renderSeat(id))}
                {Array(3).fill(0).map(() => renderSeat("", true))}
                {["A14", "A15", "A16", "A17", "A18", "A19", "A20", "A21", "A22", "A23", "A24", "A25"].map(id => renderSeat(id))}
                {Array(3).fill(0).map(() => renderSeat("", true))}
                {["A28", "A29", "A30", "A31"].map(id => renderSeat(id))}
                {Array(7).fill(0).map(() => renderSeat("", true))}
              </tr>
              {/* Row B */}
              <tr>
                {Array(4).fill(0).map(() => renderSeat("", true))}
                {["B5", "B6", "B7", "B8", "B9", "B10", "B11"].map(id => renderSeat(id))}
                {Array(3).fill(0).map(() => renderSeat("", true))}
                {["B14", "B15", "B16", "B17", "B18", "B19", "B20", "B21", "B22", "B23", "B24", "B25"].map(id => renderSeat(id))}
                {Array(3).fill(0).map(() => renderSeat("", true))}
                {["B28", "B29", "B30", "B31", "B32", "B33", "B34"].map(id => renderSeat(id))}
                {Array(4).fill(0).map(() => renderSeat("", true))}
              </tr>
              {/* Rows C to G */}
              {["C", "D", "E", "F", "G"].map(row => (
                <tr key={row}>
                  {Array.from({ length: 11 }, (_, i) => renderSeat(`${row}${i + 1}`))}
                  {Array(3).fill(0).map(() => renderSeat("", true))}
                  {Array.from({ length: 12 }, (_, i) => renderSeat(`${row}${i + 14}`))}
                  {Array(3).fill(0).map(() => renderSeat("", true))}
                  {Array.from({ length: 11 }, (_, i) => renderSeat(`${row}${i + 28}`))}
                </tr>
              ))}
              {/* Spacer Row */}
              <tr><td colSpan={41} className="h-6 md:h-10"></td></tr>
              {/* Rows H to K */}
              {["H", "I", "J", "K"].map(row => (
                <tr key={row}>
                  {Array.from({ length: 11 }, (_, i) => renderSeat(`${row}${i + 1}`))}
                  {Array(3).fill(0).map(() => renderSeat("", true))}
                  {Array.from({ length: 12 }, (_, i) => renderSeat(`${row}${i + 14}`))}
                  {Array(3).fill(0).map(() => renderSeat("", true))}
                  {Array.from({ length: 11 }, (_, i) => renderSeat(`${row}${i + 28}`))}
                </tr>
              ))}
              {/* Row L */}
              <tr>
                {Array.from({ length: 39 }, (_, i) => renderSeat(`L${i + 1}`))}
                {renderSeat("", true)}
              </tr>
              {/* Row M */}
              <tr>
                {Array.from({ length: 8 }, (_, i) => renderSeat(`M${i + 1}`))}
                {Array(22).fill(0).map(() => renderSeat("", true))}
                {Array.from({ length: 8 }, (_, i) => renderSeat(`M${i + 31}`))}
                {Array(2).fill(0).map(() => renderSeat("", true))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-12 bg-white/5 px-6 md:px-10 py-4 rounded-3xl border border-white/10">
        <StatusItem color="bg-white/10" label="متاح" />
        <StatusItem color="bg-primary" label="مختار" />
        <StatusItem color="bg-white/5 opacity-30" label="محجوز" />
      </div>
    </div>
  );
}

function StatusItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-3 h-3 rounded-sm", color)} />
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
  );
}
