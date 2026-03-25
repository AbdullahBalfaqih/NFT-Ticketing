
"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { ShieldCheck, ShieldAlert, Loader2, Camera, Upload, RefreshCcw, CheckCircle2, XCircle, Info, Ticket as TicketIcon, MapPin, User, Fingerprint, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function AdminScannerPage() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      await verifyTicketData(data);
    } catch (err) {
      setError("تنسيق كود QR غير صالح. يرجى مسح كود صادر عن بروتوكول فيري تيكس.");
    }
  };

  const onScanError = (err: any) => {};

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    setError(null);
    setScanResult(null);

    const html5QrCode = new Html5Qrcode("reader-hidden");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      const data = JSON.parse(decodedText);
      await verifyTicketData(data);
    } catch (err) {
      setError("فشل قراءة الملف أو الكود غير صالح.");
    } finally {
      setIsVerifying(false);
      html5QrCode.clear();
    }
  };

  const verifyTicketData = async (data: any) => {
    setIsVerifying(true);
    setError(null);
    setScanResult(null);

    try {
      const ticketsRef = collection(firestore, "tickets");
      const q = query(ticketsRef, where("verificationCode", "==", data.s));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("تذكرة غير موجودة! الكود قد يكون مزوراً أو غير مسجل في البروتوكول.");
        return;
      }

      const ticketDoc = snapshot.docs[0];
      const ticketData = ticketDoc.data();

      if (ticketData.status === 'scanned' || ticketData.status === 'burned') {
        setError(`هذه التذكرة تم استخدامها مسبقاً (الحالة: ${ticketData.status === 'scanned' ? 'مستخدمة' : 'محروقة'}).`);
        return;
      }

      const eventRef = doc(firestore, "events", ticketData.eventId);
      const eventSnap = await getDoc(eventRef);
      const eventData = eventSnap.exists() ? eventSnap.data() : null;

      const userRef = doc(firestore, "users", ticketData.ownerId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      setScanResult({
        ticket: { ...ticketData, id: ticketDoc.id },
        event: eventData,
        user: userData,
        isValid: true
      });

      toast({ title: "تم التحقق", description: "التذكرة صالحة ومطابقة للسجلات." });

    } catch (err: any) {
      setError("حدث خطأ أثناء الاتصال بالبروتوكول: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const confirmEntry = async () => {
    if (!scanResult?.ticket?.id) return;
    setIsUpdating(true);
    try {
      const ticketRef = doc(firestore, "tickets", scanResult.ticket.id);
      await updateDoc(ticketRef, {
        status: 'scanned',
        updatedAt: serverTimestamp()
      });
      toast({ title: "تم تسجيل الدخول", description: "تم تحديث حالة التذكرة إلى 'مستخدمة'." });
      resetScanner();
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ في التحديث", description: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <Badge className="bg-primary/20 text-primary border-primary/20">وحدة مسح البروتوكول v2.0</Badge>
          <h1 className="text-4xl font-headline font-bold">ماسح <span className="text-primary">الدخول الميداني</span></h1>
          <p className="text-muted-foreground">تحقق من التوقيع الرقمي وسجل الدخول فورياً.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="bg-card/50 border-white/5 rounded-[2.5rem] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-end gap-2">
                وحدة الكاميرا
                <Camera className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div id="reader" className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 aspect-square flex items-center justify-center"></div>
              <div id="reader-hidden" className="hidden"></div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-12 rounded-xl border-white/10 gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" /> رفع ملف QR
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-white/10" onClick={resetScanner}>
                  <RefreshCcw className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {isVerifying && (
              <Card className="p-12 flex flex-col items-center justify-center gap-4 bg-card/50 border-white/5 rounded-[2.5rem]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-bold text-primary animate-pulse">جاري التحقق من التوقيع الرقمي...</p>
              </Card>
            )}

            {error && (
              <Card className="p-8 border-destructive/20 bg-destructive/5 rounded-[2.5rem] text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                  <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-destructive">فشل التحقق</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={resetScanner} variant="outline" className="border-destructive/20 text-destructive">محاولة أخرى</Button>
              </Card>
            )}

            {scanResult && scanResult.isValid && (
              <Card className="bg-card border-green-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="bg-green-500/10 p-6 flex items-center justify-between flex-row-reverse border-b border-green-500/10">
                  <div className="flex items-center gap-3 text-green-500 font-bold">تذكرة صالحة للدخول<CheckCircle2 className="h-6 w-6" /></div>
                  <Badge className="bg-green-500/20 text-green-500 border-none">جاهزة للتفعيل</Badge>
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="flex gap-4 flex-row-reverse">
                    <img src={scanResult.event?.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-white/5" />
                    <div className="flex-1 text-right">
                      <h4 className="text-xl font-bold mb-1">{scanResult.event?.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">{scanResult.event?.venue}<MapPin className="h-3 w-3" /></p>
                    </div>
                  </div>
                  <Separator className="bg-white/5" />
                  <div className="grid grid-cols-2 gap-6 text-right">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">رقم المقعد</p>
                      <p className="text-2xl font-black text-primary">{scanResult.ticket.seatNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">المالك</p>
                      <p className="text-sm font-bold truncate">{scanResult.user?.name || "مستخدم فيري تيكس"}</p>
                    </div>
                  </div>
                  <Button onClick={confirmEntry} disabled={isUpdating} className="w-full h-14 rounded-2xl bg-primary font-bold text-lg shadow-xl shadow-primary/20 gap-2">
                    {isUpdating ? <Loader2 className="animate-spin" /> : <DoorOpen className="h-5 w-5" />}
                    تأكيد الدخول وتفعيل حالة الاستخدام
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isVerifying && !scanResult && !error && (
              <Card className="p-12 border-dashed border-white/10 bg-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground opacity-20">
                  <TicketIcon className="h-10 w-10" />
                </div>
                <p className="text-muted-foreground max-w-[200px]">في انتظار مسح كود التذكرة للمراجعة والتحقق الميداني.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
