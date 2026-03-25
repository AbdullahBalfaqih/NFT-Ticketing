
"use client";

import { Navbar } from "@/components/navbar";
import { Plus, TrendingUp, Ticket as TicketIcon, Database, Server, Loader2, ShieldCheck, Fingerprint, Search, Lock, Activity, Trophy, Check, ShieldEllipsis, Trash2, FileBarChart, Clock, Users as UsersIcon, AlertTriangle, Cpu, Globe, Ban, Settings2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Event, Order, Ticket as TicketType } from "@/lib/types";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const eventsQuery = useMemoFirebase(() => collection(firestore, "events"), [firestore]);
  const ordersQuery = useMemoFirebase(() => query(collection(firestore, "orders"), orderBy("createdAt", "desc")), [firestore]);
  const ticketsQuery = useMemoFirebase(() => collection(firestore, "tickets"), [firestore]);

  const { data: events, isLoading: isEventsLoading } = useCollection<Event>(eventsQuery);
  const { data: orders } = useCollection<Order>(ordersQuery);
  const { data: tickets } = useCollection<TicketType>(ticketsQuery);

  // إعدادات الأمان
  const securityRef = useMemoFirebase(() => doc(firestore, "settings", "security"), [firestore]);
  const { data: securitySettings } = useDoc<any>(securityRef);

  const [selectedReportEvent, setSelectedReportEvent] = useState<Event | null>(null);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

  const totalSales = orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
  const totalTicketsSold = tickets?.length || 0;

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(firestore, "events", eventId));
      toast({ title: "تم حذف الفعالية", description: "تمت إزالة الفعالية من البروتوكول بنجاح." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في الحذف", description: error.message });
    }
  };

  const toggleSecurityFeature = async (feature: string, value: boolean) => {
    setIsUpdatingSecurity(true);
    try {
      await setDoc(securityRef, { [feature]: value, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "تم تحديث البروتوكول", description: `تم ${value ? 'تفعيل' : 'تعطيل'} ميزة ${feature} بنجاح.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ في التحديث", description: err.message });
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const updateTicketLimit = async (limit: string) => {
    const numLimit = parseInt(limit);
    if (isNaN(numLimit) || numLimit < 1) return;
    try {
      await setDoc(securityRef, { maxTicketsPerUser: numLimit, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "تم تحديث الحدود", description: `تم تحديد سقف الشراء بـ ${numLimit} تذاكر لكل هوية.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-end md:justify-start">
              <Badge className="bg-primary/20 text-primary border-none text-[10px] px-3 font-black">بروتوكول v1.5</Badge>
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-black">نظام الحماية المتقدم VTX-Guardian</Badge>
            </div>
            <h1 className="text-4xl font-headline font-black">كونسول <span className="text-primary">التحكم والتحليل</span></h1>
            <p className="text-muted-foreground font-black">مراقبة حية للمبيعات، الحضور، ومحاربة البوتات.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-primary font-black h-12 px-8 rounded-2xl shadow-lg shadow-primary/20">
              <Link href="/admin/events/new"><Plus className="ml-2 h-5 w-5 text-white" /> نشر تجربة جديدة</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1 h-14 rounded-2xl gap-2">
            <TabsTrigger value="overview" className="rounded-xl px-8 font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="h-4 w-4 ml-2 text-primary" /> نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="audit" className="rounded-xl px-8 font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShieldCheck className="h-4 w-4 ml-2 text-primary" /> الأمن والتدقيق
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="إجمالي الإيرادات" value={`$${totalSales.toLocaleString()}`} icon={<TrendingUp className="text-primary h-6 w-6" />} trend="حجم البروتوكول" />
              <StatCard title="الأصول الرقمية" value={totalTicketsSold.toString()} icon={<TicketIcon className="text-primary h-6 w-6" />} trend="تصاريح مؤمنة" />
              <StatCard title="الفعاليات النشطة" value={events?.length.toString() || "0"} icon={<Database className="text-primary h-6 w-6" />} trend="نشر ذكي" />
              <StatCard title="حالة العقد" value="متصل" icon={<Server className="text-primary h-6 w-6" />} trend="زمن استجابة < 20ms" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-white/5 bg-card/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between flex-row-reverse">
                  <div>
                    <CardTitle className="font-black">مخزون الفعاليات المطور</CardTitle>
                    <CardDescription className="font-black">تحليل الأداء الميداني والمبيعات لكل تجربة.</CardDescription>
                  </div>
                  <Badge variant="outline" className="h-6 font-black">تحليل حي</Badge>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  {isEventsLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
                  ) : (
                    <div className="grid gap-6">
                      {events?.map((event) => (
                        <EventAdminListItem 
                          key={event.id} 
                          event={event} 
                          tickets={tickets || []} 
                          onDelete={() => handleDeleteEvent(event.id)}
                          onReport={() => setSelectedReportEvent(event)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 space-y-4">
                   <div className="flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-primary" />
                      <h3 className="font-black text-lg">هيمنة السوق</h3>
                   </div>
                   <p className="text-sm font-black text-muted-foreground leading-relaxed">
                     فيري تيكس يوفر **أدوات تدقيق لحظية** للمنظمين لمراقبة الحضور ومنع التلاعب بالتذاكر في السوق الثانوي.
                   </p>
                </div>
                <Card className="border-white/5 bg-card/50 rounded-[2.5rem]">
                   <CardHeader><CardTitle className="text-sm font-black">روابط سريعة</CardTitle></CardHeader>
                   <CardContent className="space-y-2">
                     <Button variant="outline" className="w-full justify-start rounded-xl font-black border-white/10" asChild>
                       <Link href="/verify"><Search className="ml-2 h-4 w-4 text-primary" /> صفحة التحقق العامة</Link>
                     </Button>
                     <Button variant="outline" className="w-full justify-start rounded-xl font-black border-white/10" asChild>
                       <Link href="/admin/scanner"><TicketIcon className="ml-2 h-4 w-4 text-primary" /> ماسح الدخول الميداني</Link>
                     </Button>
                   </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 bg-card/50 border-white/5 rounded-[2.5rem] p-8 space-y-8">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-4 flex-row-reverse">
                    <div className="p-0"><Ban className="h-8 w-8 text-primary" /></div>
                    <div className="text-right">
                      <h3 className="text-2xl font-black">محارب البوتات (Anti-Bot Control)</h3>
                      <p className="text-xs font-black text-muted-foreground">التحكم في بروتوكولات التحقق البشري والفلترة.</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-none font-black px-4">نشط حالياً</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <SecuritySwitch 
                    title="تحدي VTX-PoW" 
                    description="فرض معالجة تشفيرية على جهاز العميل لمنع السك الآلي."
                    icon={<Cpu className="text-primary h-5 w-5" />}
                    checked={securitySettings?.powEnabled ?? true}
                    onCheckedChange={(val) => toggleSecurityFeature("powEnabled", val)}
                  />
                  <SecuritySwitch 
                    title="بصمة الجهاز (Fingerprint)" 
                    description="التعرف على المتصفح والجهاز بشكل فريد لمنع تعدد الحسابات."
                    icon={<Fingerprint className="text-primary h-5 w-5" />}
                    checked={securitySettings?.fingerprintEnabled ?? true}
                    onCheckedChange={(val) => toggleSecurityFeature("fingerprintEnabled", val)}
                  />
                  <SecuritySwitch 
                    title="فلترة IP الديناميكية" 
                    description="منع الطلبات المتكررة من نفس الشبكة خلال فترات زمنية قصيرة."
                    icon={<Globe className="text-primary h-5 w-5" />}
                    checked={securitySettings?.ipFilteringEnabled ?? true}
                    onCheckedChange={(val) => toggleSecurityFeature("ipFilteringEnabled", val)}
                  />
                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Label className="font-black text-sm">حد التذاكر لكل هوية</Label>
                      <Settings2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        defaultValue={securitySettings?.maxTicketsPerUser ?? 4} 
                        onBlur={(e) => updateTicketLimit(e.target.value)}
                        className="bg-black/20 border-white/10 text-center font-black text-lg h-12"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-black text-center">أقصى عدد تذاكر يمكن شراؤه من محفظة/جهاز واحد.</p>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="bg-card/50 border-white/5 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center gap-4 flex-row-reverse">
                    <Lock className="h-8 w-8 text-primary" />
                    <div className="text-right">
                      <h3 className="text-xl font-black">تدقيق العقود</h3>
                      <p className="text-[10px] font-black text-muted-foreground">حالة بروتوكول ERC-721</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <AuditItem label="منطق الملكية" status="موثق" />
                    <AuditItem label="صلاحيات السك" status="مقيد" />
                    <AuditItem label="فرض سقف السعر" status="موثق" />
                    <AuditItem label="سلامة البيانات" status="مشفر" />
                  </div>
                </Card>

                <div className="p-8 rounded-[2.5rem] bg-destructive/5 border border-destructive/20 space-y-4">
                   <div className="flex items-center gap-3 justify-end">
                      <h3 className="font-black text-lg">تحذير أمني</h3>
                      <ShieldAlert className="h-8 w-8 text-primary" />
                   </div>
                   <p className="text-xs font-black text-muted-foreground leading-relaxed text-right">
                     تعطيل بروتوكولات الأمان قد يعرض الفعالية لهجمات السك الآلي (Minting Bots) ونفاذ المخزون في ثوانٍ.
                   </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* تقرير الفعالية */}
      <Dialog open={!!selectedReportEvent} onOpenChange={(open) => !open && setSelectedReportEvent(null)}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10 bg-black border-white/5" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2 justify-end">
              تقرير تحليل الفعالية
              <FileBarChart className="h-6 w-6 text-primary" />
            </DialogTitle>
            <DialogDescription className="text-right font-black">ملخص البيانات التشفيرية والميدانية لـ {selectedReportEvent?.name}</DialogDescription>
          </DialogHeader>
          {selectedReportEvent && (
            <div className="space-y-8 pt-6">
              <div className="grid grid-cols-3 gap-4">
                <ReportStat label="المبيعات" value={`$${((tickets?.filter(t => t.eventId === selectedReportEvent.id).length || 0) * selectedReportEvent.ticketPrice).toLocaleString()}`} color="text-primary" />
                <ReportStat label="المقاعد المحجوزة" value={tickets?.filter(t => t.eventId === selectedReportEvent.id).length.toString() || "0"} color="text-primary" />
                <ReportStat label="الحضور الفعلي" value={tickets?.filter(t => t.eventId === selectedReportEvent.id && t.status === 'scanned').length.toString() || "0"} color="text-primary" />
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-right">
                <h4 className="font-black text-sm">بيانات البروتوكول</h4>
                <div className="space-y-2 text-xs text-muted-foreground font-black">
                  <div className="flex justify-between"><span>{selectedReportEvent.id}</span><span className="font-black text-white">ID النظام</span></div>
                  <div className="flex justify-between"><span>{selectedReportEvent.numericId || "N/A"}</span><span className="font-black text-white">ID البلوكشين</span></div>
                  <div className="flex justify-between"><span>Polygon Amoy</span><span className="font-black text-white">الشبكة</span></div>
                </div>
              </div>
              <Button onClick={() => setSelectedReportEvent(null)} className="w-full h-12 rounded-xl bg-primary font-black">إغلاق التقرير</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SecuritySwitch({ title, description, icon, checked, onCheckedChange }: { title: string, description: string, icon: React.ReactNode, checked: boolean, onCheckedChange: (val: boolean) => void }) {
  return (
    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-4 transition-all hover:bg-white/10">
      <div className="flex justify-between items-start flex-row-reverse">
        <div className="flex items-center gap-3 flex-row-reverse">
          <div className="p-0">{icon}</div>
          <h4 className="font-black text-sm">{title}</h4>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} className="data-[state=checked]:bg-primary" />
      </div>
      <p className="text-[10px] text-muted-foreground font-black text-right leading-relaxed">{description}</p>
    </div>
  );
}

function EventAdminListItem({ event, tickets, onDelete, onReport }: { event: Event, tickets: TicketType[], onDelete: () => void, onReport: () => void }) {
  const eventTickets = tickets.filter(t => t.eventId === event.id);
  const soldCount = eventTickets.length;
  const attendanceCount = eventTickets.filter(t => t.status === 'scanned').length;
  
  return (
    <div className="group relative p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-primary/20 transition-all space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 flex-row-reverse">
        <div className="flex items-center gap-4 flex-row-reverse w-full md:w-auto">
          <img src={event.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-white/5" />
          <div className="text-right">
            <h4 className="text-xl font-black">{event.name}</h4>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{event.venue}</p>
            <div className="mt-2">
              <CountdownTimer targetDate={`${event.date}T${event.time}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-right flex-1 md:px-12">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center justify-end gap-1">
              المبيعات <TicketIcon className="h-3 w-3 text-primary" />
            </p>
            <p className="text-lg font-black text-primary">
              {soldCount} <span className="text-[10px] text-muted-foreground font-black">/ {event.totalCapacity}</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center justify-end gap-1">
              الحضور <UsersIcon className="h-3 w-3 text-primary" />
            </p>
            <p className="text-lg font-black text-primary">
              {attendanceCount} <span className="text-[10px] text-muted-foreground font-black">({soldCount > 0 ? Math.round((attendanceCount/soldCount)*100) : 0}%)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button variant="ghost" size="icon" onClick={onReport} className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary p-0 border-none" title="تقرير الفعالية">
            <FileBarChart className="h-6 w-6" />
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-primary p-0 border-none" title="تعديل">
            <Link href={`/admin/events/${event.id}/edit`}><Server className="h-6 w-6 text-primary" /></Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-primary p-0 border-none" title="حذف">
                <Trash2 className="h-6 w-6 text-primary" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black border-white/10 rounded-[2rem]" dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-right flex items-center gap-2 justify-end font-black">تأكيد الحذف <AlertTriangle className="text-primary h-5 w-5" /></AlertDialogTitle>
                <AlertDialogDescription className="text-right font-black">هل أنت متأكد من حذف الفعالية؟ سيتم إزالتها نهائياً من البروتوكول ولا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse gap-2">
                <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl font-black">نعم، احذف الفعالية</AlertDialogAction>
                <AlertDialogCancel className="bg-white/5 border-none rounded-xl font-black">إلغاء</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) return "منتهية / جارية";

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      
      return `${days}ي ${hours}س ${minutes}د`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md w-fit ml-auto">
      <Clock className="h-3 w-3 text-amber-500" />
      <span>يبدأ في: {timeLeft}</span>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="border-white/5 bg-card/50 rounded-[2rem] hover:border-primary/20 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{title}</p>
          <div className="p-0 border-none">{icon}</div>
        </div>
        <h3 className="text-3xl font-black mb-1">{value}</h3>
        <p className="text-[9px] text-muted-foreground font-black flex items-center gap-1 justify-end">
          {trend} <Fingerprint className="h-3 w-3 text-primary" />
        </p>
      </CardContent>
    </Card>
  );
}

function AuditItem({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 flex-row-reverse">
      <span className="text-sm text-muted-foreground font-black">{label}</span>
      <Badge className="bg-primary/20 text-primary border-none h-5 text-[10px] font-black">{status}</Badge>
    </div>
  );
}

function ReportStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
      <p className="text-[9px] text-muted-foreground uppercase font-black">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}
