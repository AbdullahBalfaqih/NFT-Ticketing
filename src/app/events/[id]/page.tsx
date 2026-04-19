
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
        description: "يرجى تسجيل الدخول لإتمام عملية حجز التذاكر الموثقة.",
      });
      const returnUrl = `/checkout?eventId=${event.id}&seats=${selectedSeats.join(",")}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
      return;
    }

    router.push(`/checkout?eventId=${event.id}&seats=${selectedSeats.join(",")}`);
  };

  const isConference = event.eventType === 'conference';

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-6 hover:bg-white/5 font-black gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          العودة للفعاليات
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <Image 
                src={event.imageUrl} 
                alt={event.name} 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 text-right">
                <Badge className="bg-primary text-white mb-3 font-black text-xs md:text-sm px-4 py-1">
                  {isConference ? 'مؤتمر موثق' : 'تجربة موثقة'}
                </Badge>
                <h1 className="text-2xl md:text-5xl font-headline font-black text-white">{event.name}</h1>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoBox icon={<Calendar className="h-5 w-5" />} title="التاريخ والوقت" value={`${event.date} | ${event.time}`} />
              <InfoBox icon={<MapPin className="h-5 w-5" />} title="الموقع" value={event.venue} />
              <InfoBox icon={<Users className="h-5 w-5" />} title={isConference ? 'عدد المدعوين' : 'السعة'} value={`${event.totalCapacity.toLocaleString()} إجمالي`} />
            </div>

            {/* Description */}
            <div className="space-y-4 bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/5">
              <h2 className="text-xl md:text-2xl font-headline font-black">عن {isConference ? 'هذا المؤتمر' : 'هذه التجربة'}</h2>
              <p className="text-muted-foreground leading-relaxed font-bold text-sm md:text-base">
                {event.description}
              </p>
            </div>

            {/* Seat Map */}
            {!isConference && (
              <div className="space-y-6 pt-4">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-headline font-black">اختر مقاعدك</h2>
                  <p className="text-xs md:text-sm text-muted-foreground font-bold">يمكنك اختيار حتى 4 مقاعد كحد أقصى.</p>
                </div>
                <div className="rounded-[2rem] md:rounded-[3rem] bg-card border border-white/5 overflow-hidden">
                  <SeatMap onSeatSelect={setSelectedSeats} maxSeats={4} />
                </div>
              </div>
            )}

            {isConference && (
              <div className="p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-primary/5 border border-primary/10 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black">دخول عبر البطاقات المادية</h3>
                  <p className="text-muted-foreground font-bold text-sm md:text-base leading-relaxed">
                    هذا المؤتمر مخصص لأصحاب الدعوات الموثقة. يرجى إبراز بطاقتك عند الدخول لمسح الباركود والمطالبة بملكية الـ NFT.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 p-6 md:p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl space-y-6 text-slate-900">
              <h3 className="text-xl md:text-2xl font-headline font-black">{isConference ? 'حالة الدعوة' : 'ملخص الطلب'}</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold flex-row-reverse">
                  <span className="text-slate-500">نوع الفعالية</span>
                  <span className="text-primary font-black">{isConference ? 'مؤتمر / دعوة خاصة' : 'بيع عام'}</span>
                </div>

                {!isConference ? (
                  <>
                    <div className="flex justify-between items-center text-sm font-bold flex-row-reverse">
                      <span className="text-slate-500">سعر التذكرة</span>
                      <div className="flex items-center gap-1 font-black">
                        {event.ticketPrice}
                        <img src={SAR_LOGO} className="h-3.5 w-auto object-contain" alt="ر.س" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold flex-row-reverse">
                      <span className="text-slate-500">المقاعد المختارة</span>
                      <span className="text-primary font-black">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "لا يوجد"}</span>
                    </div>
                    <Separator className="bg-slate-100" />
                    <div className="flex justify-between items-center pt-2 flex-row-reverse">
                      <span className="font-black text-lg">الإجمالي</span>
                      <div className="flex items-center gap-1">
                        <span className="text-3xl font-black text-primary">{selectedSeats.length * event.ticketPrice}</span>
                        <img src={SAR_LOGO} className="h-5 w-auto object-contain" alt="ر.س" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-center font-black text-slate-400 text-xs">
                    لا تتوفر مبيعات رقمية لهذا الحدث
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                <div className="flex items-center justify-end gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                  أمان البلوكشين
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                  سيتم توثيق كافة {isConference ? 'الدعوات' : 'العمليات'} عبر سجلات البلوكشين لضمان عدم التلاعب.
                </p>
              </div>

              {!isConference ? (
                <Button 
                  onClick={handleCheckout}
                  disabled={selectedSeats.length === 0}
                  className="w-full h-14 md:h-16 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  {user ? "المتابعة للدفع" : "سجل الدخول للشراء"}
                </Button>
              ) : (
                <Button 
                  disabled
                  className="w-full h-14 md:h-16 text-lg font-black bg-slate-100 text-slate-400 rounded-2xl cursor-not-allowed"
                >
                  دخول بالبطاقة فقط
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoBox({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-white/5 flex flex-col items-center md:items-start text-center md:text-right gap-2">
      <div className="text-primary">{icon}</div>
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</div>
        <div className="text-sm font-bold">{value}</div>
      </div>
    </div>
  );
}
