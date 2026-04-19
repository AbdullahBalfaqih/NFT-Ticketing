"use client";

import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { Ticket, Event } from "@/lib/types";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Printer, ChevronRight, Loader2, Download, ExternalLink, FileSpreadsheet, Info, Plus, Sparkles, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function PrintTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [batchSize, setBatchSize] = useState("50");
  const [isGenerating, setIsGenerating] = useState(false);

  const eventRef = useMemoFirebase(() => doc(firestore, "events", eventId), [firestore, eventId]);
  const { data: event } = useDoc<Event>(eventRef);

  const ticketsQuery = useMemoFirebase(() => 
    query(collection(firestore, "tickets"), where("eventId", "==", eventId)), 
    [firestore, eventId]
  );
  const { data: tickets, isLoading } = useCollection<Ticket>(ticketsQuery);

  const handleGenerateTickets = async () => {
    const count = parseInt(batchSize);
    if (!event || isNaN(count) || count <= 0) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى إدخال عدد صالح للتذاكر." });
      return;
    }

    setIsGenerating(true);
    try {
      const batch = writeBatch(firestore);
      const startNum = (tickets?.length || 0) + 1;

      for (let i = 0; i < count; i++) {
        const ticketRef = doc(collection(firestore, "tickets"));
        const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase();
        const numericId = event.numericId || event.id.substring(0, 6);
        const vtxCode = `VTX-GEN-${numericId}-${randomHash}`;
        
        batch.set(ticketRef, {
          id: ticketRef.id,
          eventId: event.id,
          ownerId: null,
          seatNumber: `T-${(startNum + i).toString().padStart(3, '0')}`,
          priceAtPurchase: event.ticketPrice || 0,
          verificationCode: vtxCode,
          status: "physical_unclaimed",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // تنفيذ العملية بشكل غير معطل (Non-blocking)
      batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'tickets',
          operation: 'create',
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      toast({ 
        title: "تم البدء في توليد التذاكر", 
        description: `جاري إضافة ${count} باركود جديد إلى سجلات البروتوكول.` 
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل التوليد", description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    if (!tickets || !event) return;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const isMatch = event.name.includes("مباراة") || event.name.includes("مباراه") || event.name.toLowerCase().includes("match");
    
    const headers = ["Ticket ID", isMatch ? "Seat Number" : "Access Type", "Verification Hash (VTX)", "Claim URL"];
    const rows = tickets.map(t => [
      t.id,
      isMatch ? t.seatNumber : "General Admission",
      t.verificationCode,
      `${origin}/claim/${t.id}`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `VeriTix_Export_${event.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "تم تصدير ملف البيانات",
      description: `تم تجهيز ${tickets.length} سجل للاستخدام الخارجي.`
    });
  };

  if (isLoading || !event) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const isMatch = event.name.includes("مباراة") || event.name.includes("مباراه") || event.name.toLowerCase().includes("match");

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 print:hidden gap-6">
          <div className="space-y-2 text-center md:text-right">
            <h1 className="text-4xl font-black">إدارة باركودات <span className="text-primary">{event.name}</span></h1>
            <p className="text-muted-foreground font-bold">
              {isMatch ? "نظام ترقيم المقاعد للمباريات مفعل." : "نظام الدخول العام للمؤتمرات مفعل (بدون أرقام مقاعد)."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={exportToExcel} variant="outline" className="h-12 px-6 rounded-xl border-primary/20 text-primary font-black gap-2">
              <FileSpreadsheet className="h-5 w-5" /> تصدير لـ Excel
            </Button>
            <Button onClick={handlePrint} className="h-12 px-8 rounded-xl bg-primary font-black gap-2 shadow-lg shadow-primary/20">
              <Printer className="h-5 w-5" /> طباعة الكل
            </Button>
            <Button variant="ghost" onClick={() => router.back()} className="h-12 px-6 rounded-xl font-black">
              العودة
            </Button>
          </div>
        </div>

        {/* Generate Tickets Unit */}
        <div className="mb-12 p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 print:hidden">
          <div className="flex flex-col md:flex-row items-end gap-6 flex-row-reverse">
            <div className="flex-1 space-y-4 text-right">
              <h3 className="text-xl font-black flex items-center gap-2 justify-end">
                توليد تذاكر مادية جديدة
                <Sparkles className="h-5 w-5 text-primary" />
              </h3>
              <p className="text-sm text-muted-foreground font-bold">قم بتوليد الباركودات يدوياً لطباعتها على البطاقات الفيزيائية وتوزيعها في المركز.</p>
            </div>
            <div className="flex items-end gap-3 w-full md:w-auto">
              <div className="space-y-2 flex-1 md:w-32">
                <Label className="text-xs font-black">عدد التذاكر</Label>
                <Input 
                  type="number" 
                  value={batchSize} 
                  onChange={(e) => setBatchSize(e.target.value)}
                  className="bg-background h-12 text-center font-black rounded-xl border-primary/20"
                />
              </div>
              <Button 
                onClick={handleGenerateTickets} 
                disabled={isGenerating}
                className="h-12 px-8 rounded-xl bg-primary font-black gap-2"
              >
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                توليد الآن
              </Button>
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 print:grid-cols-3 print:gap-4">
          {tickets?.map((ticket) => (
            <div key={ticket.id} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-xl print:shadow-none print:border-slate-300 transition-transform hover:scale-[1.02]">
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{event.name}</p>
                {isMatch ? (
                  <p className="text-lg font-black text-slate-900">المقعد: {ticket.seatNumber}</p>
                ) : (
                  <p className="text-sm font-black text-primary">تصريح دخول (عام)</p>
                )}
              </div>
              
              <div className="p-4 bg-white border-4 border-slate-50 rounded-3xl shadow-inner">
                <QRCodeSVG 
                  value={`${origin}/claim/${ticket.id}`} 
                  size={160} 
                  level="H" 
                  includeMargin={true}
                />
              </div>

              <div className="text-center space-y-2 w-full">
                <div className="bg-slate-50 py-2 px-4 rounded-xl">
                  <p className="text-[9px] font-mono text-slate-500 font-bold break-all">{ticket.verificationCode}</p>
                </div>
                <Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary px-3 py-1">بروتوكول VERITIX الموثق</Badge>
              </div>
            </div>
          ))}
        </div>

        {(!tickets || tickets.length === 0) && (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-bold">لا توجد تذاكر مولدة لهذا الحدث حالياً. استخدم وحدة التوليد أعلاه.</p>
          </div>
        )}
      </main>

      <style jsx global>{`
        @media print {
          .print\:hidden { display: none !important; }
          body { background: white !important; color: black !important; padding: 0 !important; }
          header { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; width: 100% !important; }
          .grid { display: grid !important; gap: 1cm !important; }
        }
      `}</style>
    </div>
  );
}