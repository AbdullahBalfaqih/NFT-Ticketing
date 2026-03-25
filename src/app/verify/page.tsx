"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Search, CheckCircle2, Calendar, MapPin, Fingerprint, Loader2, ShieldAlert, Info, ShieldCheck, Users, XCircle, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function VerifyPage() {
  const [vtxHash, setVtxHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const firestore = useFirestore();

  const handleVerify = async () => {
    if (!vtxHash) return;
    setIsVerifying(true);
    setResult(null);

    try {
      const input = vtxHash.trim();
      let ticketData: any = null;
      let ticketId = null;

      // البحث عبر كود التحقق المختصر
      const qCode = query(collection(firestore, "tickets"), where("verificationCode", "==", input.toUpperCase()));
      const snapCode = await getDocs(qCode);

      if (!snapCode.empty) {
        ticketData = snapCode.docs[0].data();
        ticketId = snapCode.docs[0].id;
      } else {
        // البحث عبر هاش البلوكشين مباشرة
        const cleanHash = input.replace(/^VTX-/, "");
        const qHash = query(collection(firestore, "tickets"), where("mintTransactionHash", "==", cleanHash));
        const snapHash = await getDocs(qHash);
        if (!snapHash.empty) {
          ticketData = snapHash.docs[0].data();
          ticketId = snapHash.docs[0].id;
        }
      }

      if (ticketData) {
        // جلب بيانات الفعالية
        const eventRef = doc(firestore, "events", ticketData.eventId);
        const eventSnap = await getDoc(eventRef);
        const eventData = eventSnap.exists() ? eventSnap.data() : null;

        // جلب بيانات المالك (الخزنة التابع لها)
        const ownerRef = doc(firestore, "users", ticketData.ownerId);
        const ownerSnap = await getDoc(ownerRef);
        const ownerData = ownerSnap.exists() ? ownerSnap.data() : null;

        setResult({
          isValid: true,
          ticket: { ...ticketData, id: ticketId },
          event: eventData,
          owner: ownerData
        });
      } else {
        setResult({ isValid: false });
      }
    } catch (error) {
      console.error("Verification failed", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <Badge className="bg-primary/20 text-primary border-primary/20 px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">بروتوكول التحقق العام v2.1</Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight">تحقق من <span className="text-primary">الأصالة</span></h1>
          <p className="text-muted-foreground text-lg leading-relaxed">تحقق من صحة التذاكر ومنع التزوير وفحص حالة استخدام التذكرة والمالك على السلسلة.</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="أدخل VTX-Hash أو الهاش الخاص بالبلوكشين" className="h-16 pr-12 bg-white/5 border-white/10 rounded-2xl text-lg font-mono uppercase text-right" value={vtxHash} onChange={(e) => setVtxHash(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVerify()} />
            </div>
            <Button onClick={handleVerify} disabled={isVerifying} className="h-16 px-10 rounded-2xl bg-primary shadow-xl shadow-primary/20">
              {isVerifying ? <Loader2 className="animate-spin" /> : <Search className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {result && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            {result.isValid ? (
              <Card className={`rounded-[3rem] overflow-hidden shadow-2xl ${result.ticket.status === 'scanned' ? 'border-amber-500/20 bg-amber-500/5' : 'border-green-500/20 bg-green-500/5'}`}>
                <CardHeader className="p-10 text-center border-b border-white/5 space-y-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 bg-white/5">
                    {result.ticket.status === 'scanned' ? <XCircle className="h-12 w-12 text-amber-500" /> : <CheckCircle2 className="h-12 w-12 text-green-500" />}
                  </div>
                  <CardTitle className={`text-3xl font-bold ${result.ticket.status === 'scanned' ? 'text-amber-500' : 'text-green-500'}`}>
                    {result.ticket.status === 'scanned' ? 'تذكرة مستخدمة' : 'أصل رقمي صالح'}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">تمت مطابقة التوقيع الرقمي وتحديد المالك بنجاح.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8 text-right">
                  <div className="flex justify-between items-center p-6 rounded-[2rem] bg-white/5 border border-white/10 flex-row-reverse">
                    <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1.5 rounded-full text-base">المقعد #{result.ticket.seatNumber}</Badge>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">اسم الفعالية</p>
                      <p className="font-bold text-2xl">{result.event?.name}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                    <p className="text-[10px] uppercase font-black text-primary tracking-widest flex items-center justify-end gap-2">
                       عنوان الخزنة التابع لها <Wallet className="h-3 w-3" />
                    </p>
                    <code className="block text-xs font-mono text-left bg-black/20 p-3 rounded-lg break-all" dir="ltr">
                       {result.owner?.vaultAddress || result.owner?.walletAddress || "عنوان خارجي"}
                    </code>
                    <p className="text-[10px] text-muted-foreground text-center">
                       المالك المسجل: {result.owner?.name || "مستخدم فيري تيكس"}
                    </p>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="grid grid-cols-2 gap-8 text-right px-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">حالة البروتوكول</p>
                      <p className="text-base font-bold capitalize">{result.ticket.status === 'scanned' ? 'تم الدخول بها' : 'فعالة / متاحة'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">الموقع المعتمد</p>
                      <p className="text-base font-bold">{result.event?.venue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-destructive/20 bg-destructive/5 rounded-[3rem] p-16 text-center space-y-6 shadow-2xl">
                <ShieldAlert className="h-12 w-12 text-destructive mx-auto animate-pulse" />
                <h3 className="text-3xl font-bold text-destructive">فشل التحقق الموثق</h3>
                <p className="text-muted-foreground text-lg">هذا الكود غير موجود في السجلات. يرجى الحذر من التذاكر غير الموثقة.</p>
                <Button onClick={() => setVtxHash("")} variant="outline" className="border-destructive/20 text-destructive rounded-xl px-8">محاولة أخرى</Button>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}