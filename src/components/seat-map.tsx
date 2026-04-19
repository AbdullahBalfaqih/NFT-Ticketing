"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SeatMapProps {
  onSeatSelect: (seats: string[]) => void;
  maxSeats?: number;
}

export function SeatMap({ onSeatSelect, maxSeats = 4 }: SeatMapProps) {
  const { toast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // محاكاة المقاعد المحجوزة
  const soldSeats = ["A10", "B11", "C4", "D2", "F9", "F10", "F11", "M5", "L22"];

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
          description: `يمكنك اختيار حتى ${maxSeats} مقاعد فقط كحد أقصى.`
        });
        return;
      }
      newSelection = [...selectedSeats, seatId];
    }
    
    setSelectedSeats(newSelection);
    onSeatSelect(newSelection);
  };

  const renderSeat = (seatId: string, isEmpty: boolean = false) => {
    if (isEmpty) return <td key={Math.random()} className="w-6 h-6 p-0.5"></td>;
    
    const isSold = soldSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);

    return (
      <td key={seatId} className="p-0.5">
        <button
          onClick={() => toggleSeat(seatId)}
          disabled={isSold}
          className={cn(
            "w-7 h-7 rounded-md text-[8px] font-bold transition-all duration-300",
            isSold 
              ? "bg-white/5 cursor-not-allowed opacity-20 text-transparent" 
              : isSelected 
                ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" 
                : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white"
          )}
        >
          {seatId}
        </button>
      </td>
    );
  };

  return (
    <div className="w-full bg-[#020617] py-12 px-4 rounded-[2.5rem] overflow-hidden border border-white/5">
      <div className="max-w-full overflow-x-auto pb-6 scrollbar-hide flex flex-col items-center">
        <div className="min-w-[800px] flex flex-col items-center gap-12">
          
          {/* Stage / Screen */}
          <div className="w-3/4 flex flex-col items-center mb-8">
            <div className="w-full h-1.5 bg-primary/30 rounded-full mb-1" />
            <div className="w-full h-8 bg-white rounded-t-[3rem] flex items-center justify-center shadow-[0_-10px_30px_rgba(255,255,255,0.1)]">
              <span className="text-[10px] text-slate-900 font-black uppercase tracking-[0.4em] mt-2">STAGE / KINGDOM ARENA</span>
            </div>
          </div>

          <table className="border-separate border-spacing-1">
            <tbody>
              {/* Row A */}
              <tr>
                {Array(7).fill(0).map((_, i) => renderSeat("", true))}
                {["A8", "A9", "A10", "A11"].map(id => renderSeat(id))}
                {Array(3).fill(0).map((_, i) => renderSeat("", true))}
                {["A14", "A15", "A16", "A17", "A18", "A19", "A20", "A21", "A22", "A23", "A24", "A25"].map(id => renderSeat(id))}
                {Array(3).fill(0).map((_, i) => renderSeat("", true))}
                {["A28", "A29", "A30", "A31"].map(id => renderSeat(id))}
                {Array(7).fill(0).map((_, i) => renderSeat("", true))}
              </tr>
              {/* Row B */}
              <tr>
                {Array(4).fill(0).map((_, i) => renderSeat("", true))}
                {["B5", "B6", "B7", "B8", "B9", "B10", "B11"].map(id => renderSeat(id))}
                {Array(3).fill(0).map((_, i) => renderSeat("", true))}
                {["B14", "B15", "B16", "B17", "B18", "B19", "B20", "B21", "B22", "B23", "B24", "B25"].map(id => renderSeat(id))}
                {Array(3).fill(0).map((_, i) => renderSeat("", true))}
                {["B28", "B29", "B30", "B31", "B32", "B33", "B34"].map(id => renderSeat(id))}
                {Array(4).fill(0).map((_, i) => renderSeat("", true))}
              </tr>
              {/* Row C to G */}
              {["C", "D", "E", "F", "G"].map(row => (
                <tr key={row}>
                  {Array.from({ length: 11 }, (_, i) => renderSeat(`${row}${i + 1}`))}
                  {Array(3).fill(0).map((_, i) => renderSeat("", true))}
                  {Array.from({ length: 12 }, (_, i) => renderSeat(`${row}${i + 14}`))}
                  {Array(3).fill(0).map((_, i) => renderSeat("", true))}
                  {Array.from({ length: 11 }, (_, i) => renderSeat(`${row}${row === 'C' ? i + 28 : (row === 'D' ? i + 28 : (row === 'E' ? i + 28 : (row === 'F' ? i + 28 : i + 28)))}`))}
                </tr>
              ))}
              {/* Spacer Row */}
              <tr>{Array(40).fill(0).map((_, i) => renderSeat("", true))}</tr>
              {/* Row H to K */}
              {["H", "I", "J", "K"].map(row => (
                <tr key={row}>
                  {Array.from({ length: 11 }, (_, i) => renderSeat(`${row}${i + 1}`))}
                  {Array(3).fill(0).map((_, i) => renderSeat("", true))}
                  {Array.from({ length: 12 }, (_, i) => renderSeat(`${row}${i + 14}`))}
                  {Array(3).fill(0).map((_, i) => renderSeat("", true))}
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
                {Array(22).fill(0).map((_, i) => renderSeat("", true))}
                {Array.from({ length: 8 }, (_, i) => renderSeat(`M${i + 31}`))}
                {Array(2).fill(0).map((_, i) => renderSeat("", true))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-8 mt-12 text-[10px] font-black bg-white/5 px-10 py-4 rounded-3xl border border-white/10 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-white/10" />
          <span className="text-muted-foreground">متاح</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-primary">مختار</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-white/5 opacity-30" />
          <span className="text-muted-foreground/50">محجوز</span>
        </div>
      </div>
    </div>
  );
}
