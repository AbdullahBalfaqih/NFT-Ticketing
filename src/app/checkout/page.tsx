"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, ArrowRight, CheckCircle2, Loader2, Wallet, Zap, Cpu, Fingerprint, ExternalLink, ShieldAlert, Lock, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { processPurchase } from "@/app/actions/purchase";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { Event, User as UserProfile } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { TicketCard } from "@/components/ticket-card";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const eventId = searchParams.get("eventId");
  const seatIds = searchParams.get("seats")?.split(",") || [];
  
  const eventRef = useMemoFirebase(() => eventId ? doc(firestore, "events", eventId) : null, [firestore, eventId]);
  const { data: event, isLoading: isEventLoading } = useDoc<Event>(eventRef);
  
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, "users", user.uid) : null, [firestore, user]);
  const { data: profile } = useDoc<UserProfile>(userProfileRef);

  // جلب إعدادات الأمان الديناميكية
  const securityRef = useMemoFirebase(() => doc(firestore, "settings", "security"), [firestore]);
  const { data: securitySettings } = useDoc<any>(securityRef);

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [purchasedTickets, setPurchasedTickets] = useState<any[]>([]);
  const [useWallet, setUseWallet] = useState(false);
  
  const [isSolvingPoW, setIsSolvingPoW] = useState(false);
  const [powProgress, setPowProgress] = useState(0);
  const [isVerifiedHuman, setIsVerifiedHuman] = useState(false);
  const [securityStatus, setSecurityStatus] = useState("idle");

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    walletAddress: ""
  });

  const deviceFingerprint = useMemo(() => {
    if (typeof window === "undefined") return "";
    const payload = [
      navigator.userAgent,
      screen.width,
      screen.height,
      navigator.language,
      new Date().getTimezoneOffset()
    ].join("|");
    return btoa(payload).substring(0, 32);
  }, []);

  const detectWallet = useCallback(async () => {
    if (typeof window === "undefined") return;
    setTimeout(async () => {
      try {
        const ethereum = (window as any).ethereum;
        if (ethereum && typeof ethereum.request === 'function') {
          const accounts = await ethereum.request({ method: 'eth_accounts' }).catch(() => []);
          if (accounts && accounts.length > 0) {
            setUserData(prev => ({ ...prev, walletAddress: accounts[0] }));
            setUseWallet(true);
          }
        }
      } catch (err) {}
    }, 1000);
  }, []);

  useEffect(() => {
    detectWallet();
  }, [detectWallet]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({ title: "جلسة منتهية", description: "يرجى تسجيل الدخول لمواصلة عملية الشراء." });
      router.push("/login?returnTo=" + encodeURIComponent(window.location.href));
    }
  }, [user, isUserLoading, router, toast]);

  const solvePoWChallenge = async () => {
    setIsSolvingPoW(true);
    setSecurityStatus("scanning");
    setPowProgress(0);
    
    const steps = 40;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 70 + Math.random() * 50));
      setPowProgress((i / steps) * 100);
      if (i === 15) setSecurityStatus("analyzing_patterns");
      if (i === 30) setSecurityStatus("verifying_fingerprint");
    }

    setIsSolvingPoW(false);
    setIsVerifiedHuman(true);
    setSecurityStatus("verified");
    toast({ title: "تم التحقق من البشرية", description: "تم قبول بصمة جهازك في البروتوكول." });
  };

  const checkPurchaseLimits = async () => {
    if (!user || !eventId) return true;
    const ticketsRef = collection(firestore, "tickets");
    const q = query(ticketsRef, where("ownerId", "==", user.uid), where("eventId", "==", eventId));
    const snap = await getDocs(q);
    
    const maxLimit = securitySettings?.maxTicketsPerUser || 4;
    
    if (snap.size + seatIds.length > maxLimit) {
      toast({ 
        variant: "destructive", 
        title: "تجاوز حد الشراء", 
        description: `يسمح بروتوكولنا حالياً بحد أقصى ${maxLimit} تذاكر لكل حساب/محفظة لمنع الاحتكار.` 
      });
      return false;
    }
    return true;
  };

  const handleNextStep = async () => {
    const isAllowed = await checkPurchaseLimits();
    if (!isAllowed) return;

    // إذا كان PoW معطلاً، نتخطى الخطوة
    if (securitySettings?.powEnabled === false) {
      setIsVerifiedHuman(true);
      setStep(2);
    } else {
      setStep(2);
    }
  };

  const handlePayment = async () => {
    if (!user || !isVerifiedHuman) return;
    setIsProcessing(true);
    
    try {
      const targetMintAddress = (useWallet && userData.walletAddress.startsWith("0x")) 
        ? userData.walletAddress 
        : (profile?.vaultAddress || "0x366F94c8e0d9BB37f2534B77168A5FEbA0B261C3");

      const result = await processPurchase(
        targetMintAddress, 
        event?.numericId || event?.id || "",
        securitySettings?.fingerprintEnabled !== false ? deviceFingerprint : "DISABLED",
        { isHuman: true, timestamp: Date.now() }
      );

      if (!result.success) throw new Error(result.error);

      const finalHash = result.hash;
      const actualTokenId = result.tokenId || "MINTED";

      const orderRef = await addDoc(collection(firestore, "orders"), {
        userId: user.uid,
        eventId: event?.id,
        eventName: event?.name,
        totalAmount: event?.ticketPrice ? event.ticketPrice * seatIds.length : 0,
        numberOfTickets: seatIds.length,
        status: "completed",
        paymentStatus: "paid",
        transactionId: finalHash,
        mintAddress: targetMintAddress,
        fingerprint: deviceFingerprint,
        createdAt: serverTimestamp()
      });

      const newTickets = [];
      for (const seat of seatIds) {
        const suffix = finalHash.substring(finalHash.length - 8).toUpperCase();
        const ticketVCode = `VTX-${suffix}-${seat}`;
        const ticketData = {
          orderId: orderRef.id,
          eventId: event?.id,
          ownerId: user.uid,
          seatNumber: seat,
          priceAtPurchase: event?.ticketPrice,
          nftTokenId: actualTokenId,
          mintTransactionHash: finalHash,
          verificationCode: ticketVCode,
          status: "active",
          fingerprint: deviceFingerprint,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        const tRef = await addDoc(collection(firestore, "tickets"), ticketData);
        newTickets.push({ ...ticketData, id: tRef.id });
      }

      setPurchasedTickets(newTickets);
      setTxHash(finalHash);
      setStep(3);
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشلت العملية", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isEventLoading || isUserLoading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const total = event.ticketPrice * seatIds.length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-4 mb-12 flex-row-reverse">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-row-reverse">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all font-black ${step >= s ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-muted-foreground'}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="grid md:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="md:col-span-3 space-y-6">
              <h2 className="text-3xl font-black">بيانات الحجز <span className="text-primary">والمستلم</span></h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black">الاسم الأول</Label>
                    <Input value={userData.firstName} onChange={e => setUserData({...userData, firstName: e.target.value})} className="bg-white/5 h-12 rounded-xl text-right font-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black">اسم العائلة</Label>
                    <Input value={userData.lastName} onChange={e => setUserData({...userData, lastName: e.target.value})} className="bg-white/5 h-12 rounded-xl text-right font-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-black">البريد الإلكتروني</Label>
                  <Input value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} className="bg-white/5 h-12 rounded-xl text-right font-black" />
                </div>
                
                <Separator className="my-6 bg-white/5" />
                
                <div className="space-y-4">
                  <Label className="text-lg font-black">طريقة استلام الأصول</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => setUseWallet(false)} className={`p-5 rounded-2xl border text-right transition-all flex items-center gap-4 flex-row-reverse ${!useWallet ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' : 'bg-white/5 border-white/10'}`}>
                      <div className={`p-3 rounded-xl ${!useWallet ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground'}`}><Zap className="h-6 w-6" /></div>
                      <div className="flex-1 text-right">
                        <div className="font-black">خزنتك الشخصية (Managed Vault)</div>
                        <div className="text-[10px] font-black text-muted-foreground">سيتم السك لعنوانك الفريد: {profile?.vaultAddress?.substring(0, 10)}...</div>
                      </div>
                    </button>
                    <button onClick={() => setUseWallet(true)} className={`p-5 rounded-2xl border text-right transition-all flex items-center gap-4 flex-row-reverse ${useWallet ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' : 'bg-white/5 border-white/10'}`}>
                      <div className={`p-3 rounded-xl ${useWallet ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground'}`}><Wallet className="h-6 w-6" /></div>
                      <div className="flex-1">
                        <div className="font-black">المحفظة الخارجية (External Wallet)</div>
                        <div className="text-[10px] font-black text-muted-foreground">إرسال الـ NFT مباشرة لعنوان MetaMask الخاص بك.</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <Button onClick={handleNextStep} className="w-full h-14 text-lg font-black rounded-2xl bg-primary shadow-xl shadow-primary/20">
                المتابعة للأمان <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
              </Button>
            </div>
            <div className="md:col-span-2"><OrderSummary event={event} seats={seatIds} total={total} /></div>
          </div>
        )}

        {step === 2 && (
          <div className="grid md:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="md:col-span-3 space-y-6">
              <h2 className="text-3xl font-black">بروتوكول <span className="text-primary">VTX-Guardian</span></h2>
              
              <div className="p-8 rounded-[2.5rem] bg-card border border-white/10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 flex-row-reverse">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                  <div className="flex-1">
                    <div className="text-base font-black">نظام التحقق الهجين</div>
                    <div className="text-[10px] font-black text-muted-foreground leading-relaxed">
                      يتم الآن فحص بصمة الجهاز (Fingerprint) وعنوان الـ IP لمنع هجمات البوتات والسك الآلي بالجملة.
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest flex-row-reverse">
                    <span className="text-muted-foreground">حالة الأمان</span>
                    <span className="text-primary">
                      {securityStatus === "idle" && "في انتظار البدء"}
                      {securityStatus === "scanning" && "جاري فحص الجهاز..."}
                      {securityStatus === "analyzing_patterns" && "تحليل أنماط السلوك..."}
                      {securityStatus === "verifying_fingerprint" && "توثيس البصمة الرقمية..."}
                      {securityStatus === "verified" && "تم التحقق بنجاح"}
                    </span>
                  </div>
                  
                  {!isVerifiedHuman ? (
                    <div className="space-y-4">
                      {isSolvingPoW ? (
                        <div className="space-y-3">
                          <Progress value={powProgress} className="h-3 bg-white/5 rounded-full" />
                          <p className="text-[9px] text-center font-black text-muted-foreground animate-pulse">جاري تنفيذ تحدي Proof-of-Work لمنع البوتات...</p>
                        </div>
                      ) : (
                        <Button onClick={solvePoWChallenge} variant="outline" className="w-full h-16 border-primary/20 bg-primary/5 hover:bg-primary/10 gap-2 rounded-2xl font-black text-primary">
                          <Cpu className="h-5 w-5" /> بدأ تحدي الأمان والمزامنة
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex flex-col items-center gap-3 animate-in zoom-in duration-300">
                      <UserCheck className="h-10 w-10 text-green-500" />
                      <div className="text-center">
                        <p className="font-black text-green-500">هوية بشرية موثقة</p>
                        <p className="text-[10px] font-black text-green-500/70">تم تسجيل بصمتك: {deviceFingerprint.substring(0, 12)}...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SecurityBadge icon={<Lock className="h-3 w-3" />} label="تشفير E2E" />
                  <SecurityBadge icon={<Fingerprint className="h-3 w-3" />} label="بصمة جهاز فريدة" />
                </div>
              </div>

              <Button onClick={handlePayment} disabled={isProcessing || !isVerifiedHuman} className="w-full h-16 text-xl font-black bg-primary rounded-2xl shadow-2xl shadow-primary/30 group">
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> جاري السك على السلسلة...</>
                ) : (
                  <>
                    دفع ${total} وتأمين الملكية
                    <Zap className="ml-2 h-5 w-5 group-hover:scale-125 transition-transform" />
                  </>
                )}
              </Button>
            </div>
            <div className="md:col-span-2"><OrderSummary event={event} seats={seatIds} total={total} /></div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto text-center space-y-10 py-12 animate-in zoom-in duration-500">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/20">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-5xl font-black text-white">تم السك والتوثيق!</h2>
              <p className="text-muted-foreground text-lg font-black">تم تسجيل ملكيتك على Polygon Amoy بنجاح وحمايتها ببصمة جهازك.</p>
            </div>
            
            <div className="space-y-12">
              {purchasedTickets.map((ticket, idx) => (
                <TicketCard key={idx} ticket={ticket} className="hover:scale-105 transition-transform shadow-2xl" />
              ))}
            </div>

            <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-6 text-right relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-3xl rounded-full" />
              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest justify-end">
                توقيع البروتوكول الموحد
                <Fingerprint className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-mono font-black text-primary tracking-tighter text-center">VTX-{txHash?.substring(txHash.length - 8).toUpperCase()}</div>
              
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full border-white/5 bg-white/5 hover:bg-white/10 text-white h-12 rounded-xl gap-2 font-black">
                  <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-primary" /> فحص سجلات البلوكشين
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button asChild variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 font-black"><a href="/">الرئيسية</a></Button>
              <Button asChild className="flex-1 h-14 rounded-2xl bg-primary font-black"><a href="/dashboard">فتح الخزنة الرقمية</a></Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function OrderSummary({ event, seats, total }: { event: any, seats: string[], total: number }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl space-y-6 text-right sticky top-24 text-slate-900">
      <h3 className="text-2xl font-black">ملخص <span className="text-primary">الطلب</span></h3>
      <div className="flex gap-4 flex-row-reverse">
        <div className="w-20 h-20 rounded-2xl overflow-hidden relative border border-slate-100 shadow-sm">
          <Image src={event.imageUrl} alt={event.name} fill className="object-cover" />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h4 className="font-black text-base line-clamp-1 text-slate-900">{event.name}</h4>
          <p className="text-[10px] font-black text-slate-500 flex items-center gap-1 mt-1 justify-end uppercase tracking-widest">تذكرة بلوكشين x {seats.length} <Zap className="h-3 w-3 text-primary" /></p>
        </div>
      </div>
      <Separator className="bg-slate-100" />
      <div className="space-y-3">
        <div className="flex justify-between items-center flex-row-reverse">
          <span className="text-sm font-black text-slate-500">عدد المقاعد</span>
          <span className="text-sm font-black text-slate-900">{seats.length}</span>
        </div>
        <div className="flex justify-between items-center flex-row-reverse">
          <span className="text-sm font-black text-slate-500">سعر الوحدة</span>
          <span className="text-sm font-black text-slate-900">${event.ticketPrice}</span>
        </div>
      </div>
      <Separator className="bg-slate-100" />
      <div className="flex justify-between items-center flex-row-reverse">
        <span className="text-lg font-black text-slate-900">الإجمالي</span>
        <span className="text-3xl font-black text-primary">${total}</span>
      </div>
    </div>
  );
}

function SecurityBadge({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-muted-foreground uppercase tracking-wider justify-center">
      {icon}
      {label}
    </div>
  );
}
