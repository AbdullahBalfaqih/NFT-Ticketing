
"use client";

import { Navbar } from "@/components/navbar";
import { EventCard } from "@/components/event-card";
import { Search, SlidersHorizontal, Loader2, Zap, ArrowRight, ChevronLeft, Fingerprint, Plus, MessageSquare, Github, Coins, Globe, Wallet, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Event } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth-modal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

const rotatingWords = [
  "فعالياتك",
  "مؤتمرةك",
  "أنشطتك",
  "مناسباتك",
  "أحداثك",
  "برامجك",
  "عروضك",
  "تجمعاتك",
  "مشاركاتك",
];

// Scalloped Divider Component - Seamless Version
const ScallopDivider = ({ color, bgColor, flip }: { color: string, bgColor: string, flip?: boolean }) => (
  <div className={cn("w-full h-10 overflow-hidden leading-[0] relative z-10", flip ? "rotate-180" : "")} style={{ backgroundColor: bgColor }}>
    <svg viewBox="0 0 1200 30" preserveAspectRatio="none" className="w-full h-full block" shapeRendering="geometricPrecision">
      <path 
        d="M0,0 C15,30 35,30 50,0 C65,30 85,30 100,0 C115,30 135,30 150,0 C165,30 185,30 200,0 C215,30 235,30 250,0 C265,30 285,30 300,0 C315,30 335,30 350,0 C365,30 385,30 400,0 C415,30 435,30 450,0 C465,30 485,30 500,0 C515,30 535,30 550,0 C565,30 585,30 600,0 C615,30 635,30 650,0 C665,30 685,30 700,0 C715,30 735,30 750,0 C765,30 785,30 800,0 C815,30 835,30 850,0 C865,30 885,30 900,0 C915,30 935,30 950,0 C965,30 985,30 1000,0 C1015,30 1035,30 1050,0 C1065,30 1085,30 1100,0 C1115,30 1135,30 1150,0 C1165,30 1185,30 1200,0 L1200,30 L0,30 Z" 
        fill={color} 
      />
    </svg>
  </div>
);

export default function Home() {
  const firestore = useFirestore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [barcodeHeights, setBarcodeHeights] = useState<number[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const eventsQuery = useMemoFirebase(() => {
    return collection(firestore, "events");
  }, [firestore]);

  const { data: events, isLoading } = useCollection<Event>(eventsQuery);

  useEffect(() => {
    const heights = [4, 2, 6, 1, 8, 2, 4, 3, 7, 1, 5, 2, 4, 6, 2, 8, 3, 1, 4, 2, 6].map(() => 60 + Math.random() * 40);
    setBarcodeHeights(heights);

    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (date) {
      const eventDate = new Date(event.date);
      const isSameDate = eventDate.toDateString() === date.toDateString();
      return matchesSearch && isSameDate;
    }
    
    return matchesSearch;
  });

  const faqs = [
    {
      q: "ما هو بروتوكول فيري تيكس لتأمين التذاكر؟",
      a: "هو نظام هجين متطور يدمج بين سرعة الأنظمة السحابية وقوة توثيق البلوكشين. يهدف البروتوكول إلى حماية حقوق المعجبين والمنظمين عبر القضاء نهائياً على التزوير والتلاعب في السوق السوداء."
    },
    {
      q: "كيف يضمن نظام VTX-Guardian منع البوتات؟",
      a: "يعمل نظام Guardian كدرع حماية يفرض تحديات معالجة تشفيرية (Proof-of-Work) على جهاز المشتري، بالإضافة إلى فحص بصمة الجهاز، مما يمنع البرمجيات الآلية من الاستحواذ على التذاكر."
    },
    {
      q: "هل يمكنني إعادة بيع تذكرتي بأي سعر؟",
      a: "لضمان عدالة التوزيع، يفرض البروتوكول سقفاً سعرياً لا يتجاوز 20% فوق السعر الأصلي للتذكرة في سوق إعادة البيع الرسمي، مما يحد من ظاهرة التذاكر بأسعار خيالية."
    },
    {
      q: "ما هي مزايا التذكرة كأصل رقمي (NFT)؟",
      a: "بعد انتهاء الفعالية، تتحول تذكرتك إلى NFT تذكاري خالد. يمكنك الاحتفاظ به في مجموعتك، تداوله كأصل نادر، أو حرقه مقابل مكافآت ونقاط ولاء لاستخدامها في فعاليات مستقبلية."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground no-copy">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-20 overflow-hidden bg-black">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 text-right" dir="rtl">
                
                <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                  الــبـروتــوكــول النهائي لتأمين{" "}
                  <div className="h-[1.2em] inline-flex items-center align-middle overflow-hidden px-2 relative">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={rotatingWords[wordIndex]}
                        initial={{ opacity: 0, rotateX: -90, y: 30 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0 }}
                        exit={{ opacity: 0, rotateX: 90, y: -30 }}
                        transition={{ 
                          duration: 0.25, 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 20
                        }}
                        className="text-primary inline-block whitespace-nowrap"
                      >
                        {rotatingWords[wordIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  {" "}على الــبـلـوكـتـشـيـن
                </h1>
                
                <p className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed font-black">
                  إيفين تيكس تشين هو بروتوكول متقدم لإدارة التذاكر في الشرق الأوسط، حيث يتم إصدار جميع التذاكر على البلوكتشين لضمان الأمان والشفافية، مع خيار تحويلها إلى NFT لتمكين التداول الذكي وإعادة البيع المنظم
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4 justify-start">
                  <button onClick={() => setIsAuthOpen(true)} className="mac-button text-lg font-black">
                    ابدأ تجربتك الآن
                  </button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-white/10 hover:bg-white/5 text-lg font-black text-white">
                    <Link href="/verify">مركز التحقق</Link>
                  </Button>
                </div>
              </div>

              <div className="relative animate-in fade-in slide-in-from-left-8 duration-700 flex justify-center lg:justify-end">
                <div className="relative w-full aspect-square max-w-[600px] flex items-center justify-center">
                  <div className="relative group flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/30 blur-[100px] rounded-full -z-10 animate-pulse opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative z-10 drop-shadow-[0_0_35px_rgba(37,99,235,0.4)]">
                      <Image 
                        src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1773811328/image-removebg-preview_62_hgwa34.png"
                        alt="Logo Hero"
                        width={600}
                        height={600}
                        className="object-contain"
                        priority
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ScallopDivider color="#f5f5f5" bgColor="black" />

        {/* White Section: Search & Events */}
        <div className="bg-[#f5f5f5] pb-24 relative z-20">
          {/* Updated Horizontal Search Strip */}
          <section className="container mx-auto px-4 mb-20 -mt-10" dir="rtl">
            <div className="bg-white border border-black/5 p-2 px-4 md:pr-6 rounded-2xl md:rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-40 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-2 py-4 md:py-2">
              
              {/* Search Input Area */}
              <div className="flex-1 relative flex items-center w-full">
                <Search className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  placeholder="ابحث عن الفعاليات الموثقة..." 
                  className="pr-10 h-12 bg-transparent border-none text-base text-right font-bold text-slate-900 focus-visible:ring-0 placeholder:text-slate-300 w-full" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="hidden md:block h-8 w-px bg-slate-100" />

              {/* Date Picker Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-12 px-6 rounded-xl md:rounded-full text-black font-bold hover:bg-slate-50 gap-3 shrink-0 w-full md:w-auto">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="text-black">{date ? format(date, "PPP", { locale: arSA }) : "التاريخ"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-white/5 shadow-2xl" align="center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={arSA}
                    className="bg-white text-slate-900"
                  />
                </PopoverContent>
              </Popover>

              <div className="hidden md:block h-8 w-px bg-slate-100" />

              {/* Filter Button */}
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-slate-50 shrink-0 hidden md:flex">
                <SlidersHorizontal className="h-5 w-5 text-slate-600" />
              </Button>

              {/* Action Search Button */}
              <button 
                onClick={() => {
                  const element = document.getElementById('events-grid');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-primary hover:bg-primary/90 text-white font-black h-12 px-10 rounded-xl md:rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap w-full md:w-auto"
              >
                اعثر على تجربتك
              </button>
            </div>
          </section>

          <section id="events-grid" className="container mx-auto px-4 py-12" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div className="text-right">
                <h2 className="font-headline text-3xl font-bold mb-2 text-slate-900">تجارب حية</h2>
                <p className="text-muted-foreground font-black">فعاليات مختارة وموثقة عبر شبكة EvenTix Chain.</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-[0.2em] text-xs">جاري مزامنة العقد...</p>
              </div>
            ) : filteredEvents && filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredEvents.map((event) => (<EventCard key={event.id} event={event} />))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">لا توجد نتائج مطابقة لبحثك.</p>
              </div>
            )}
          </section>
        </div>

        <ScallopDivider color="black" bgColor="#f5f5f5" />

        {/* Black Section: Feature Showcase */}
        <section className="container mx-auto px-4 py-20 bg-black" dir="rtl">
          <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-headline font-black text-white leading-tight">تقنيات الغد، <span className="text-primary">بروح الابتكار</span></h2>
            <p className="text-muted-foreground text-base md:text-lg font-black max-w-xl mx-auto leading-relaxed">
              نحن ندرك التحديات التي يواجهها منظمو الفعاليات والمعجبون. لذلك بنينا بروتوكولاً يسهل سير العمل ويمنحك السيطرة الكاملة.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="lg:col-span-1 group relative overflow-hidden rounded-[2.5rem] bg-[#0A0D12] border border-white/10 flex flex-col justify-between p-8 transition-all hover:border-primary/30 h-[280px]">
              <div className="flex justify-center pt-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                <div className="barcode-bars h-20 text-primary flex items-end gap-1">
                  {[4, 2, 6, 1, 8, 2, 4, 3, 7, 1, 5, 2, 4, 6, 2, 8, 3, 1, 4, 2, 6].map((w, i) => (
                    <div key={i} style={{ width: `${w}px`, height: barcodeHeights.length > 0 ? `${barcodeHeights[i]}%` : '80%' }} className="bg-current rounded-[1px]" />
                  ))}
                </div>
              </div>
              <div className="relative z-10 space-y-2">
                <h3 className="text-xl md:text-2xl font-headline font-black leading-tight text-white">بناء تجارب <br /><span className="text-primary">أفضل، أسرع</span></h3>
                <div className="flex gap-2">
                  <div className="h-1 w-6 rounded-full bg-primary" /><div className="h-1 w-1 rounded-full bg-white/10" /><div className="h-1 w-1 rounded-full bg-white/10" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-[#0A0D12] border border-white/10 flex flex-col justify-center p-8 transition-all hover:border-primary/30 h-[280px]">
              <div className="grid md:grid-cols-2 items-center gap-8">
                <div className="relative z-10 space-y-3 text-right">
                  <h3 className="text-xl font-black text-white leading-tight">التذاكر كأصول رقمية موثقة</h3>
                  <p className="text-muted-foreground text-[11px] font-black leading-relaxed">
                    كل التذاكر مسجلة بالبلوكشين وبإمكان سكها كـ NFT بعد المباراة وتجميعها وتداولها وحرقها مقابل مكافآت حصرية داخل التطبيق.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="terminal-loader scale-75 md:scale-90">
                    <div className="terminal-header">
                      <div className="terminal-title text-[10px]">Status</div>
                      <div className="terminal-controls"><div className="control close"></div><div className="control minimize"></div><div className="control maximize"></div></div>
                    </div>
                    <div className="terminal-text text-[12px]">vtx install sdk</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ScallopDivider color="#f5f5f5" bgColor="black" />

        {/* White Section: CTA */}
        <section className="bg-[#f5f5f5] relative z-10 px-4 pb-20 pt-20">
          <div className="container mx-auto flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full scale-150 -z-10" />
              <Image src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1774396174/image-removebg-preview_75_yghhlp.png" alt="Logo CTA" width={120} height={120} className="relative z-10" onContextMenu={(e) => e.preventDefault()} />
            </div>
            <h2 className="text-3xl md:text-5xl font-headline font-black text-slate-900 max-w-2xl leading-tight mb-6">ابدأ تأمين <span className="text-primary">تجربتك الرقمية</span> اليوم</h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 font-black">انضم لآلاف المعجبين الذين يؤمنون تذاكرهم عبر بروتوكول EvenTix Chain.</p>
            <div className="flex gap-4 flex-col sm:flex-row">
              <button onClick={() => setIsAuthOpen(true)} className="mac-button text-lg font-black">سجل الآن مجاناً</button>
              <Button variant="ghost" asChild className="h-14 px-10 rounded-full text-slate-600 font-black text-lg hover:bg-black/5">
                <Link href="/verify" className="flex items-center gap-2">مركز التحقق <ArrowRight className="h-5 w-5 rotate-180" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <ScallopDivider color="black" bgColor="#f5f5f5" />

        {/* Black Section: FAQ */}
        <section className="bg-black py-24 relative z-10" dir="rtl">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-headline font-black text-white">الأسئلة <span className="text-primary">الشائعة</span></h2>
              <p className="text-muted-foreground font-black">كل ما تريد معرفته عن بروتوكول EvenTix Chain.</p>
            </div>
            <div className="flex flex-col w-full divide-y divide-neutral-800 divide-opacity-50">
              {faqs.map((faq, i) => (
                <article key={i} className="flex flex-col pb-5 first:pt-0 pt-5">
                  <div 
                    className="flex justify-between gap-4 items-center cursor-pointer group"
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  >
                    <h3 className={cn("text-lg md:text-xl font-black transition-colors duration-300", openFaqIndex === i ? "text-primary" : "text-white group-hover:text-primary/70")}>{faq.q}</h3>
                    <button type="button" className={cn("rounded-full border flex-shrink-0 w-[40px] h-[40px] lg:w-[60px] lg:h-[60px] flex items-center justify-center transition-all duration-300", openFaqIndex === i ? "bg-white text-black border-white" : "text-neutral-500 border-neutral-800")}>
                      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("fill-current lg:w-5 lg:h-5 w-3 h-3 transition-transform duration-300", openFaqIndex === i ? "rotate-90" : "rotate-45")}>
                        <path d="M2.46967 3.53033L16.4697 17.5303L17.5303 16.4697L3.53033 2.46967L2.46967 3.53033Z"></path>
                        <path d="M16.4697 2.46967L2.46967 16.4697L3.53033 17.5303L17.5303 3.53033L16.4697 2.46967Z"></path>
                      </svg>
                    </button>
                  </div>
                  <div className={cn("overflow-hidden transition-all duration-500 ease-in-out", openFaqIndex === i ? "max-h-[300px] opacity-100 mt-6" : "max-h-0 opacity-0")}>
                    <div className="font-body text-base lg:text-lg text-neutral-400 font-black leading-relaxed pr-2 border-r-2 border-primary/20">{faq.a}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ScallopDivider color="#f5f5f5" bgColor="black" />

        {/* Supported Networks (White Section) */}
        <section className="bg-[#f5f5f5] py-20 lg:py-32 transition-all duration-700 ease-linear" dir="rtl">
          <div className="container mx-auto px-4 lg:grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black w-fit rounded-full uppercase tracking-widest">
                  مكافح للبوتات (Anti-Bot)
                </div>
                <h2 className="text-slate-900 font-headline font-black text-4xl lg:text-6xl leading-[1.1]">
                  أكثر طرق التداول والسك <br className="hidden lg:block" /> 
                  <em className="text-primary not-italic">مرونة وموثوقية</em>
                </h2>
                
                <p className="text-neutral-500 text-lg font-black leading-relaxed">
                  يضمن بروتوكول فيري تيكس حماية عمليات البيع خارج المنصة الرسمية عبر العقود الذكية، مع إمكانية تحويل التذكرة بالكامل لأصل رقمي إذا كنت تملك محفظة Web3. نظامنا مكافح للبوتات (Anti-Bot) لضمان عدالة الوصول للجميع.
                </p>
              </div>

              <button className="mac-button w-full lg:w-fit text-lg font-black">
                <Link href="/verify">استكشف كافة الشبكات</Link>
              </button>
            </div>

            <div className="relative flex justify-center items-center p-4">
              <Image 
                src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1774403492/image-removebg-preview_65_urvqyp.png"
                alt="Supported Networks"
                width={600}
                height={500}
                className="w-full h-auto drop-shadow-2xl pointer-events-none"
                priority
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </section>

        <ScallopDivider color="black" bgColor="#f5f5f5" />

        {/* Digital Solutions Section (Black/Footer Transition) */}
        <section className="bg-black py-24 px-4 relative z-10" dir="rtl">
          <div className="container mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-headline font-black text-white leading-tight">حلول تذاكر رقمية <br className="md:hidden" /> <span className="text-primary">تناسب اعمالك</span></h2>
              <p className="text-muted-foreground text-lg font-black max-w-xl mx-auto leading-relaxed">نوفر لك كافة الأدوات اللازمة لإدارة فعالياتك بأمان وكفاءة عالية.</p>
            </div>
            <div className="max-w-6xl mx-auto rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5 bg-white/5">
              <Image 
                src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1774405552/Screenshot_2026-03-25_052558_ovsq2l.png"
                alt="Digital Ticketing Solutions"
                width={1200}
                height={600}
                className="w-full h-auto hover:scale-105 transition-transform duration-1000 pointer-events-none"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </section>

        {/* Black Section: Footer */}
        <footer className="relative z-10 pt-16 pb-12 px-4 bg-black border-t border-white/5">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16" dir="rtl">
              <div className="space-y-6 text-right"><h4 className="text-white text-xs font-black uppercase tracking-widest">المنصة</h4>
                <ul className="space-y-4 text-sm font-black text-muted-foreground">
                  <li><Link href="/marketplace" className="hover:text-primary transition-colors">السوق الموثق</Link></li>
                  <li><Link href="/developers" className="hover:text-primary transition-colors">بوابة المطورين</Link></li>
                  <li><Link href="/verify" className="hover:text-primary transition-colors">مركز التحقق</Link></li>
                </ul>
              </div>
              <div className="space-y-6 text-right"><h4 className="text-white text-xs font-black uppercase tracking-widest">قانوني</h4>
                <ul className="space-y-4 text-sm font-black text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">سياسة ملفات الارتباط</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">شروط الخدمة</Link></li>
                </ul>
              </div>
              <div className="space-y-6 text-right"><h4 className="text-white text-xs font-black uppercase tracking-widest">دعم</h4>
                <ul className="space-y-4 text-sm font-black text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary transition-colors">الأسئلة الشائعة</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">اتصل بنا</Link></li>
                </ul>
              </div>
              <div className="flex flex-col items-start lg:items-end text-left lg:text-right">
                <Link href="/" className="flex items-center group mb-8">
                  <div className="relative w-64 h-24">
                    <Image src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1774396174/image-removebg-preview_75_yghhlp.png" alt="Footer Logo" fill className="object-contain" onContextMenu={(e) => e.preventDefault()} />
                  </div>
                </Link>
                
                {/* Social Login Icons - White containers with black icons */}
                <div className="social-login-icons mt-4">
                  <div className="socialcontainer">
                    <div className="icon">
                      <svg viewBox="0 0 512 512" height="1.5em" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="socialcontainer">
                    <div className="icon">
                      <svg fill="#000000" viewBox="0 0 448 512" height="1.5em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="socialcontainer">
                    <div className="icon">
                      <svg viewBox="0 0 384 512" fill="#000000" height="1.5em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="socialcontainer">
                    <div className="icon">
                      <svg fill="#000000" viewBox="0 0 496 512" height="1.5em">
                        <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest" dir="rtl">
              <p>جميع الحقوق محفوظة لبروتوكول EvenTix Chain © 2024</p>
              <div className="flex gap-8">
                <Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                <Link href="#" className="hover:text-white transition-colors">سياسة ملفات الارتباط</Link>
                <Link href="#" className="hover:text-white transition-colors">شروط الخدمة</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
