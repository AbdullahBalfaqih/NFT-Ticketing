
"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { SeatMap } from "@/components/seat-map";
import { Calendar, MapPin, Users, ChevronLeft, CreditCard, ShieldCheck, Loader2, LogIn, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { Event } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const SAR_LOGO = "https://res.cloudinary.com/ddznxtb6f/image/upload/v1774472727/image-removebg-preview_78_zqzygb.png";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const eventId = params.id as string;
  
  const eventRef = useMemoFirebase(() => {
    return eventId ? doc(firestore, "events", eventId) : null;
  }, [firestore, eventId]);

  const { data: event, isLoading: isEventLoading } = useDoc<Event>(eventRef);
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  if (isEventLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <Button onClick={() => router.push("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
    
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول أو إنشاء حساب لإتمام عملية حجز التذاكر الموثقة.",
      });
      const returnUrl = `/checkout?eventId=${event.id}&seats=${selectedSeats.join(",")}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
      return;
    }

    router.push(`/checkout?eventId=${event.id}&seats=${selectedSeats.join(",")}`);
  };

  const isConference = event.eventType === 'conference';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-6 hover:bg-white/5"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          العودة للفعاليات
        </Button>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8 text-right">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image 
                src={event.imageUrl} 
                alt={event.name} 
                fill 
                className="object-cover"
                data-ai-hint="event detail poster"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 right-8 text-right">
                <Badge className="bg-primary text-primary-foreground mb-4 font-bold">
                  {isConference ? 'مؤتمر موثق' : 'تجربة موثقة'}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-headline font-bold">{event.name}</h1>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-white/5">
                <Calendar className="h-6 w-6 text-primary mb-3" />
                <div className="text-sm font-bold">التاريخ والوقت</div>
                <div className="text-sm text-muted-foreground">{event.date} في {event.time}</div>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-white/5">
                <MapPin className="h-6 w-6 text-primary mb-3" />
                <div className="text-sm font-bold">الموقع</div>
                <div className="text-sm text-muted-foreground">{event.venue}</div>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-white/5">
                <Users className="h-6 w-6 text-primary mb-3" />
                <div className="text-sm font-bold">{isConference ? 'عدد المدعوين' : 'السعة'}</div>
                <div className="text-sm text-muted-foreground">{event.totalCapacity.toLocaleString()} إجمالي</div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-headline font-bold">عن {isConference ? 'هذا المؤتمر' : 'هذه الفعالية'}</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </div>

            {!isConference && (
              <div className="space-y-4 pt-8 border-t border-white/5 animate-in fade-in">
                <h2 className="text-2xl font-headline font-bold">اختر مقاعدك</h2>
                <p className="text-sm text-muted-foreground mb-4">يمكنك اختيار حتى 6 مقاعد. سيتم حجز اختياراتك لمدة 10 دقائق.</p>
                <div className="rounded-3xl bg-card border border-white/5 overflow-hidden">
                  <SeatMap onSeatSelect={setSelectedSeats} />
                </div>
              </div>
            )}

            {isConference && (
              <div className="p-10 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-6 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black">الدخول عبر البطاقات المادية</h3>
                  <p className="text-muted-foreground font-bold">هذا المؤتمر مخصص لأصحاب الدعوات فقط. يرجى إبراز بطاقتك الفيزيائية عند بوابة الدخول ومسح الباركود للمطالبة بملكية الـ NFT التذكاري.</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-6 text-right text-slate-900">
              <h3 className="text-2xl font-headline font-black">{isConference ? 'حالة الدعوة' : 'ملخص الطلب'}</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold flex-row-reverse">
                  <span className="text-slate-500">نوع الفعالية</span>
                  <span className="text-primary font-black">{isConference ? 'مؤتمر / دعوة خاصة' : 'بيع عام'}</span>
                </div>
                {!isConference ? (
                  <>
                    <div className="flex justify-between items-center text-sm font-bold flex-row-reverse">
                      <span className="text-slate-500">سعر التذكرة</span>
                      <span className="flex items-center gap-1">
                        {event.ticketPrice}
                        <img src={SAR_LOGO} className="h-3 w-auto object-contain" alt="ر.س" />
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold flex-row-reverse">
                      <span className="text-slate-500">المقاعد المختارة</span>
                      <span className="text-primary">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "لا يوجد"}</span>
                    </div>
                    <Separator className="bg-slate-100" />
                    <div className="flex justify-between items-center pt-2 flex-row-reverse">
                      <span className="font-black text-lg">الإجمالي</span>
                      <span className="flex items-center gap-1 text-3xl font-black text-primary">
                        {selectedSeats.length * event.ticketPrice}
                        <img src={SAR_LOGO} className="h-5 w-auto object-contain" alt="ر.س" />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-center font-black text-slate-400">
                    لا تتوفر مبيعات رقمية لهذا الحدث
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                <div className="flex items-center justify-end gap-2 text-primary font-black text-xs uppercase tracking-wider">
                  أمان البلوكشين
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-[11px] text-slate-500 font-bold text-right leading-relaxed">
                  سيتم توثيق كافة {isConference ? 'الدعوات' : 'عمليات الشراء'} عبر سجلات البلوكشين لضمان عدم التلاعب.
                </p>
              </div>

              {!isConference ? (
                <Button 
                  onClick={handleCheckout}
                  disabled={selectedSeats.length === 0}
                  className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 group transition-all"
                >
                  {user ? (
                    <>
                      المتابعة للدفع
                      <CreditCard className="ml-2 h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  ) : (
                    <>
                      سجل الدخول للشراء
                      <LogIn className="ml-2 h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  disabled
                  className="w-full h-16 text-lg font-black bg-slate-100 text-slate-400 rounded-2xl cursor-not-allowed"
                >
                  دخول بالبطاقة المادية فقط
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
