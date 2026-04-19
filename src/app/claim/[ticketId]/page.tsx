
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Ticket, Event } from "@/lib/types";
import { Loader2, Sparkles, ShieldCheck, UserCheck, ArrowRight, Wallet, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

export default function ClaimTicketPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const ticketId = params.ticketId as string;

  const [isClaiming, setIsClaiming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const ticketRef = useMemoFirebase(() => doc(firestore, "tickets", ticketId), [firestore, ticketId]);
  const { data: ticket, isLoading: isTicketLoading } = useDoc<Ticket>(ticketRef);

  const eventRef = useMemoFirebase(() => ticket ? doc(firestore, "events", ticket.eventId) : null, [firestore, ticket]);
  const { data: event } = useDoc<Event>(eventRef);

  const handleClaim = async () => {
    if (!user) {
      toast({ title: "مطلوب تسجيل الدخول", description: "يرجى تسجيل الدخول أو إنشاء حساب لنقل ملكية هذه التذكرة والـ NFT إلى خزنتك." });
      router.push(`/login?returnTo=/claim/${ticketId}`);
      return;
    }

    if (!ticket) return;

    setIsClaiming(true);
    try {
      if (ticket.ownerId) {
        throw new Error("هذه التذكرة تمت المطالبة بملكيتها مسبقاً.");
      }

      await updateDoc(ticketRef, {
        ownerId: user.uid,
        status: "active",
        updatedAt: serverTimestamp()
      });

      setIsSuccess(true);
      toast({ title: "تم نقل الملكية بنجاح!", description: "التذكرة والـ NFT التذكاري الآن في خزنتك الرقمية." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "فشل المطالبة", description: err.message });
    } finally {
      setIsClaiming(false);
    }
  };

  if (isTicketLoading || !ticket || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-black animate-pulse">جاري التحقق من التوقيع الرقمي للبطاقة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="claim"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-xl"
            >
              <Card className="rounded-[3rem] border-white/5 bg-card/50 backdrop-blur-2xl overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.15)]">
                <div className="relative aspect-video">
                  <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-6 right-8 text-right space-y-1">
                    <h1 className="text-3xl font-black text-white">{event.name}</h1>
                  </div>
                </div>

                <CardContent className="p-10 space-y-8 text-right">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black text-center">مرحباً بك في <span className="text-primary">مستقبل الفعاليات!</span></h2>
                    <p className="text-muted-foreground text-center leading-relaxed font-bold">
                      أنت تحمل الآن تذكرة مادية موثقة بالبروتوكول. قم بالمطالبة بملكيتها الرقمية الآن لتأمين دخولك واستلام الـ NFT التذكاري الحصري.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2rem] my-6 shadow-inner">
                    <QRCodeSVG 
                      value={JSON.stringify({t: ticket.id, s: ticket.verificationCode})} 
                      size={180} 
                      level="H" 
                    />
                    <p className="mt-4 text-[10px] text-slate-400 font-black tracking-[0.2em]">VERITIX PROTOCOL AUTHENTICATED</p>
                  </div>

                  <Button 
                    onClick={handleClaim} 
                    disabled={isClaiming}
                    className="w-full h-16 rounded-2xl bg-primary text-xl font-black shadow-xl shadow-primary/20 gap-3 group"
                  >
                    {isClaiming ? <Loader2 className="animate-spin" /> : (
                      <>
                        {user ? "تأكيد نقل الملكية لخزنتي" : "سجل الدخول للمطالبة بالملكية"}
                        <ArrowRight className="h-6 w-6 rotate-180 group-hover:-translate-x-2 transition-transform" />
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] text-center text-muted-foreground font-bold">
                    بمطالبتك بالتذكرة، سيتم تسجيل هويتك كمالك شرعي للأصل الرقمي على السلسلة.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary animate-bounce">
                <PartyPopper className="h-12 w-12" />
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white">تمت المطالبة بنجاح!</h2>
                <p className="text-xl text-muted-foreground max-w-md mx-auto font-bold">
                  لقد انتقلت التذكرة الآن بالكامل من البطاقة الفيزيائية إلى هويتك الرقمية المؤمنة.
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg" className="h-14 px-10 rounded-xl bg-primary font-black">
                  <a href="/dashboard">افتح خزنوني الرقمية</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-xl font-black">
                  <a href="/">العودة للرئيسية</a>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
