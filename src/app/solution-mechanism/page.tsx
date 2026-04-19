"use client";

import { Navbar } from "@/components/navbar";
import { 
  Cpu, 
  Zap, 
  QrCode,
  ShieldCheck,
  Lock,
  Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function SolutionMechanismPage() {
  const fanSteps = [
    {
      title: "اكتشاف الفعالية",
      desc: "يتصفح المستخدم الفعاليات الموثقة ويختار مقاعده عبر خريطة تفاعلية مدعومة بأنظمة سحابية سريعة.",
    },
    {
      title: "تحدي VTX-Guardian",
      desc: "يخضع المستخدم لاختبار بصمة الجهاز وPoW للتأكد من هويته البشرية ومنع البوتات من الشراء بالجملة.",
    },
    {
      title: "توثيق البلوكشين (تلقائي)",
      desc: "يتم تسجيل كل تذكرة فورياً على شبكة Polygon لضمان الأصالة المطلقة ومنع التزوير نهائياً.",
    },
    {
      title: "الخزنة والتحويل (اختياري)",
      desc: "بعد الفعالية، يملك المستخدم خيار سك التذكرة كـ NFT تذكاري، أو تداولها، أو حرقها مقابل مكافآت.",
    }
  ];

  const adminSteps = [
    {
      title: "نشر التجربة",
      desc: "يقوم المنظم بإنشاء الفعالية وتحديد السعة والأسعار، مع استشارة مساعد الوصف المعتمد على AI.",
    },
    {
      title: "مراقبة السيولة",
      desc: "لوحة تحليلية حية تظهر حجم المبيعات والهاشات الصادرة والنشاط العام للبروتوكول على السلسلة.",
    },
    {
      title: "التحقق الميداني",
      desc: "عند البوابة، يتم مسح كود QR لمطابقة التوقيع الرقمي وتغيير حالة التذكرة إلى 'مستخدمة'.",
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-black pt-24 pb-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-150 -z-10" />
          <div className="container mx-auto px-4 space-y-6">
            <Badge variant="outline" className="border-primary/30 text-primary px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
              دليل بروتوكول VeriTix
            </Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-black leading-tight">
              كيف يعمل <span className="text-primary">الحل الهجين؟</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-black">
              رحلة متكاملة تدمج بين سهولة الويب التقليدي وقوة توثيق البلوكشين لحماية حقوق الجميع.
            </p>
          </div>
        </section>

        <ScallopDivider color="#f5f5f5" bgColor="black" />

        {/* User Flow Section - White */}
        <section className="bg-[#f5f5f5] py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-headline font-black text-slate-900">رحلة <span className="text-primary">المشجع</span></h2>
              <p className="text-slate-500 font-black">توثيق فوري عند الشراء.. وملكية دائمة اختيارية بعد الحضور.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Connector Line (Hidden on mobile) */}
              <div className="hidden lg:block absolute top-1/4 left-0 w-full h-0.5 bg-slate-200 -z-0" />
              
              {fanSteps.map((step, idx) => (
                <div key={idx} className="relative z-10 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-primary/5 transition-all group flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 font-black text-2xl group-hover:bg-primary transition-all duration-500">
                    {idx + 1}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-black leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ScallopDivider color="black" bgColor="#f5f5f5" />

        {/* Technical Layers - Black */}
        <section className="bg-black py-24 text-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-headline font-black leading-tight">هيكل <br /><span className="text-primary">البروتوكول الهجين</span></h2>
                  <p className="text-muted-foreground text-lg font-black leading-relaxed">
                    يعمل فيري تيكس على ثلاث طبقات متناغمة تضمن السرعة الفائقة والتوثيق الذي لا يقبل الجدل.
                  </p>
                </div>

                <div className="space-y-6">
                  <LayerItem 
                    title="الطبقة السحابية (Web2 Speed)" 
                    desc="إدارة البيانات الضخمة، معالجة الصور، وواجهات المستخدم السلسة لضمان استجابة أقل من 20ms."
                    icon={<Globe className="h-5 w-5" />}
                  />
                  <LayerItem 
                    title="طبقة التوثيق (Web3 Trust)" 
                    desc="تسجيل كافة المعاملات على شبكة Polygon كهاشات فريدة تضمن الأصالة وعدم قابلية التكرار."
                    icon={<ShieldCheck className="h-5 w-5" />}
                  />
                  <LayerItem 
                    title="طبقة الحماية (VTX-Guardian)" 
                    desc="خوارزميات مكافحة البوتات والتحقق من بصمة الجهاز لضمان عدالة التوزيع للمعجبين الحقيقيين."
                    icon={<Lock className="h-5 w-5" />}
                  />
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10 bg-[#0A0D12] border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><Cpu className="h-6 w-6" /></div>
                      <div className="text-right">
                        <div className="font-black text-white">معالجة البروتوكول</div>
                        <div className="text-[10px] text-muted-foreground">Polygon Amoy Network</div>
                      </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="grid gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-right space-y-1">
                        <div className="text-[10px] text-primary font-black uppercase">Transaction Status</div>
                        <div className="text-sm font-mono text-white/80">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-right space-y-1">
                        <div className="text-[10px] text-primary font-black uppercase">Verification Hash</div>
                        <div className="text-sm font-mono text-white/80">VTX-EE959A-B82C</div>
                      </div>
                    </div>
                    <div className="flex justify-center pt-4">
                      <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center p-2">
                        <QrCode className="w-full h-full text-black" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-0" />
              </div>
            </div>
          </div>
        </section>

        <ScallopDivider color="#f5f5f5" bgColor="black" />

        {/* Organizer Flow - White */}
        <section className="bg-[#f5f5f5] py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-headline font-black text-slate-900">رحلة <span className="text-primary">الجهة المنظمة</span></h2>
              <p className="text-slate-500 font-black">أدوات احترافية للتحكم الكامل في تجربة المعجبين وأمن الفعالية.</p>
            </div>

            <div className="max-w-5xl mx-auto space-y-12">
              {adminSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex-row-reverse text-right">
                  <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-black text-4xl">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">{step.title}</h3>
                    <p className="text-slate-500 font-black leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="text-6xl font-headline font-black text-slate-100 px-4">0{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ScallopDivider color="black" bgColor="#f5f5f5" />

        {/* Final CTA - Black */}
        <section className="bg-black py-32 text-center relative overflow-hidden">
          <div className="container mx-auto px-4 space-y-10 relative z-10">
            <h2 className="text-4xl md:text-6xl font-headline font-black text-white leading-tight">
              هل أنت مستعد <br /> لتأمين <span className="text-primary">مستقبل فعالياتك؟</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="h-16 px-12 rounded-2xl bg-primary text-xl font-black shadow-2xl shadow-primary/20">
                <a href="/login?mode=signup">ابدأ الآن مجاناً</a>
              </Button>
              <Button variant="outline" asChild className="h-16 px-12 rounded-2xl border-white/10 text-xl font-black text-white">
                <a href="/developers">بوابة المطورين</a>
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </section>
      </main>

      <footer className="bg-black py-12 border-t border-white/5 text-center">
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">بروتوكول فيري تيكس لتأمين التذاكر © 2024</p>
      </footer>
    </div>
  );
}

function LayerItem({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="flex gap-4 flex-row-reverse text-right group">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="font-black text-white">{title}</h4>
        <p className="text-xs text-muted-foreground font-black leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
