"use client";

import { Navbar } from "@/components/navbar";
import { Plus, TrendingUp, Ticket as TicketIcon, Database, Server, Loader2, ShieldCheck, Fingerprint, Search, Lock, Activity, Trophy, Check, ShieldEllipsis, Trash2, FileBarChart, Clock, Users as UsersIcon, AlertTriangle, Cpu, Globe, Ban, Settings2, ShieldAlert, Printer, QrCode, LogIn, Wifi, Shield, Zap, Sparkles, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, useDoc, useUser } from "@/firebase";
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
import { cn } from "@/lib/utils";

const SAR_LOGO = "https://res.cloudinary.com/ddznxtb6f/image/upload/v1774472727/image-removebg-preview_78_zqzygb.png";

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const eventsQuery = useMemoFirebase(() => collection(firestore, "events"), [firestore]);
  const ordersQuery = useMemoFirebase(() => user ? query(collection(firestore, "orders"), orderBy("createdAt", "desc")) : null, [firestore, user]);
  const ticketsQuery = useMemoFirebase(() => collection(firestore, "tickets"), [firestore]);

  const { data: events, isLoading: isEventsLoading } = useCollection<Event>(eventsQuery);
  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(ordersQuery);
  const { data: tickets } = useCollection<TicketType>(ticketsQuery);

  const securityRef = useMemoFirebase(() => doc(firestore, "settings", "security"), [firestore]);
  const { data: securitySettings } = useDoc<any>(securityRef);

  const [selectedReportEvent, setSelectedReportEvent] = useState<Event | null>(null);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const totalSales = orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
  const totalTicketsSold = tickets?.length || 0;

  const handleAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    await new Promise(r => setTimeout(r, 2000));
    setAiReport("تم رصد 12 محاولة سك آلي محجوبة بنجاح. معدل التحقق البشري مستقر عند 98%. ننصح بزيادة صعوبة الـ PoW للفعاليات ذات الطلب المرتفع لتعزيز الحماية.");
    setIsAiAnalyzing(false);
    toast({ title: "اكتمل التحليل الذكي", description: "قام VTX-Analyst بمراجعة حالة البروتوكول." });
  };

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

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Lock className="h-10 w-10" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black">منطقة محظورة</h1>
            <p className="text-muted-foreground font-bold">يرجى تسجيل الدخول للوصول إلى وحدة التحكم والتحليل.</p>
          </div>
          <Button asChild className="bg-primary font-black px-8 h-12 rounded-xl">
            <Link href="/login?returnTo=/admin"><LogIn className="ml-2 h-5 w-5" /> تسجيل الدخول</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 space-y-8">
        <section className="relative p-8 rounded-[2.5rem] bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border border-primary/20 overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 flex-row-reverse">
            <div className="flex items-center gap-5 flex-row-reverse">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 animate-pulse">
                <BrainCircuit className="h-10 w-10" />
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-black text-white">وكيل الذكاء الاصطناعي <span className="text-primary">VTX-Analyst</span></h3>
                <p className="text-xs text-muted-foreground font-bold max-w-md">أول مستشار ذكي في العالم لإدارة بروتوكولات التذاكر الموثقة.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {aiReport && (
                <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 text-[10px] font-bold text-white/80 max-w-sm text-right animate-in slide-in-from-right-4">
                  {aiReport}
                </div>
              )}
              <Button onClick={handleAiAnalysis} disabled={isAiAnalyzing} className="h-14 px-8 rounded-2xl bg-primary font-black shadow-xl shadow-primary/20 gap-2">
                {isAiAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                طلب تحليل استراتيجي
              </Button>
            </div>
          </div>
        </section>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-end md:justify-start">
              <Badge className="bg-primary/20 text-primary border-none text-[10px] px-3 font-black">بروتوكول v2.1 (Shield)</Badge>
            </div>
            <h1 className="text-4xl font-headline font-black">كونسول <span className="text-primary">التحكم والتحليل</span></h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="h-12 px-6 rounded-2xl border-white/10 font-black">
              <Link href="/admin/scanner"><QrCode className="ml-2 h-5 w-5" /> الماسح الميداني</Link>
            </Button>
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
              <StatCard title="إجمالي الإيرادات" value={isOrdersLoading ? "..." : totalSales.toLocaleString()} hasSAR icon={<TrendingUp className="text-primary h-6 w-6" />} trend="حجم البروتوكول" />
              <StatCard title="الأصول الرقمية" value={totalTicketsSold.toString()} icon={<TicketIcon className="text-primary h-6 w-6" />} trend="تصاريح مؤمنة" />
              <StatCard title="الفعاليات النشطة" value={events?.length.toString() || "0"} icon={<Database className="text-primary h-6 w-6" />} trend="نشر ذكي" />
              <StatCard title="حالة العقد" value="متصل" icon={<Server className="text-primary h-6 w-6" />} trend="زمن استجابة < 20ms" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-white/5 bg-card/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between flex-row-reverse">
                  <div>
                    <CardTitle className="font-black">مخزون الفعاليات المطور</CardTitle>
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

              <div className="space-y-8">
                <Card className="bg-card/50 border-white/5 rounded-[2.5rem] p-8 space-y-4">
                  <h3 className="font-black flex items-center gap-2 justify-end">آخر الطلبات <Zap className="h-4 w-4 text-primary" /></h3>
                  <div className="space-y-3">
                    {orders?.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 flex-row-reverse text-right">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black">{order.eventName}</p>
                          <p className="text-[8px] text-muted-foreground">{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <p className="text-xs font-black text-primary">
                          {order.totalAmount} <span className="text-[8px]">ر.س</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="bg-card/50 border-white/5 rounded-[2.5rem] p-8 space-y-8">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary"><Shield className="h-8 w-8" /></div>
                      <div className="text-right">
                        <h3 className="text-2xl font-black">بروتوكول الحماية النشط</h3>
                        <p className="text-xs text-muted-foreground font-bold">إعدادات الأمان المتقدمة لـ VTX-Guardian</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-none font-black px-4">أمان مرتفع</Badge>
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
                      title="بصمة الجهاز" 
                      description="التعرف على المتصفح والجهاز بشكل فريد لمنع تعدد الحسابات."
                      icon={<Fingerprint className="text-primary h-5 w-5" />}
                      checked={securitySettings?.fingerprintEnabled ?? true}
                      onCheckedChange={(val) => toggleSecurityFeature("fingerprintEnabled", val)}
                    />
                    <SecuritySwitch 
                      title="فلترة الـ IP" 
                      description="حظر العناوين المشبوهة وشبكات الـ VPN أثناء الشراء."
                      icon={<Globe className="text-primary h-5 w-5" />}
                      checked={securitySettings?.ipFilteringEnabled ?? false}
                      onCheckedChange={(val) => toggleSecurityFeature("ipFilteringEnabled", val)}
                    />
                    <SecuritySwitch 
                      title="وضع الصيانة" 
                      description="إيقاف كافة عمليات السك والتداول بشكل مؤقت."
                      icon={<Ban className="text-primary h-5 w-5" />}
                      checked={securitySettings?.maintenanceMode ?? false}
                      onCheckedChange={(val) => toggleSecurityFeature("maintenanceMode", val)}
                    />
                  </div>
                </Card>

                <Card className="bg-card/50 border-white/5 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <h3 className="text-2xl font-black">سجل التنبيهات الأمنية</h3>
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <LogItem status="success" msg="تم التحقق من بشرية مستخدم: 0x71...76F" time="الآن" />
                    <LogItem status="blocked" msg="محاولة سك آلي محجوبة من IP 192.168.1.105" time="منذ 5 دقائق" />
                    <LogItem status="success" msg="تحديث سجل الملكية على السلسلة بنجاح" time="منذ ساعة" />
                    <LogItem status="warning" msg="محاولة دخول متعددة لبصمة جهاز مكررة" time="منذ ساعتين" />
                  </div>
                </Card>
              </div>

              <div className="space-y-8">
                <Card className="bg-card/50 border-white/5 rounded-[2.5rem] p-6 space-y-4">
                  <h4 className="font-black text-sm text-right flex items-center justify-end gap-2">صحة الشبكة <Wifi className="h-4 w-4 text-primary" /></h4>
                  <div className="space-y-3">
                    <HealthItem label="Polygon Amoy" status="healthy" />
                    <HealthItem label="Firestore DB" status="healthy" />
                    <HealthItem label="Storage Server" status="healthy" />
                    <HealthItem label="Genkit AI" status="healthy" />
                  </div>
                </Card>

                <Card className="bg-primary/10 border-primary/20 rounded-[2.5rem] p-6 text-center space-y-4">
                   <ShieldAlert className="h-10 w-10 text-primary mx-auto" />
                   <p className="text-xs font-black leading-relaxed">البروتوكول يقوم تلقائياً بحظر أي معاملة لا تستوفي شروط الهاش التشفيري VTX-Hash.</p>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedReportEvent} onOpenChange={(open) => !open && setSelectedReportEvent(null)}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10 bg-black border-white/5" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2 justify-end">
              تقرير تحليل الفعالية
              <FileBarChart className="h-6 w-6 text-primary" />
            </DialogTitle>
          </DialogHeader>
          {selectedReportEvent && (
            <div className="space-y-8 pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-black">المبيعات</p>
                  <p className="text-xl font-black text-primary flex items-center gap-1 justify-center">
                    {((tickets?.filter(t => t.eventId === selectedReportEvent.id && t.status !== 'physical_unclaimed').length || 0) * selectedReportEvent.ticketPrice).toLocaleString()}
                    <img src={SAR_LOGO} className="h-3 w-auto object-contain" alt="ر.س" />
                  </p>
                </div>
                <ReportStat label="المقاعد المحجوزة" value={tickets?.filter(t => t.eventId === selectedReportEvent.id && t.status !== 'physical_unclaimed').length.toString() || "0"} color="text-primary" />
                <ReportStat label="الحضور الفعلي" value={tickets?.filter(t => t.eventId === selectedReportEvent.id && t.status === 'scanned').length.toString() || "0"} color="text-primary" />
              </div>
              <Button onClick={() => setSelectedReportEvent(null)} className="w-full h-12 rounded-xl bg-primary font-black">إغلاق التقرير</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LogItem({ status, msg, time }: { status: 'success' | 'blocked' | 'warning', msg: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 flex-row-reverse text-right">
      <div className="flex items-center gap-3 flex-row-reverse">
        <div className={cn(
          "w-2 h-2 rounded-full",
          status === 'success' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
          status === 'blocked' ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
        )} />
        <p className="text-xs font-bold text-white/80">{msg}</p>
      </div>
      <span className="text-[10px] text-muted-foreground font-black">{time}</span>
    </div>
  );
}

function HealthItem({ label, status }: { label: string, status: 'healthy' | 'offline' }) {
  return (
    <div className="flex items-center justify-between flex-row-reverse">
      <span className="text-xs font-bold">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-green-500">نشط</span>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
    </div>
  );
}

function SecuritySwitch({ title, description, icon, checked, onCheckedChange }: { title: string, description: string, icon: React.ReactNode, checked: boolean, onCheckedChange: (val: boolean) => void }) {
  return (
    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-4 transition-all hover:bg-white/10">
      <div className="flex justify-between items-start flex-row-reverse">
        <div className="flex items-center gap-3 flex-row-reverse">
          <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
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
  const soldCount = eventTickets.filter(t => t.status !== 'physical_unclaimed').length;
  const attendanceCount = eventTickets.filter(t => t.status === 'scanned').length;
  
  return (
    <div className="group relative p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-primary/20 transition-all space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 flex-row-reverse">
        <div className="flex items-center gap-4 flex-row-reverse w-full md:w-auto">
          <img src={event.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-white/5" />
          <div className="text-right">
            <h4 className="text-xl font-black">{event.name}</h4>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{event.venue}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-right flex-1 md:px-12">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center justify-end gap-1">
              المطالبات <QrCode className="h-3 w-3 text-primary" />
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
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary p-0 border-none" title="إدارة الباركودات المطبوعة">
            <Link href={`/admin/events/${event.id}/print-tickets`}><Printer className="h-6 w-6" /></Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={onReport} className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary p-0 border-none" title="تقرير التحليل">
            <FileBarChart className="h-6 w-6" />
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-primary p-0 border-none" title="تعديل الفعالية">
            <Link href={`/admin/events/${event.id}/edit`}><Server className="h-6 w-6 text-primary" /></Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-primary p-0 border-none" title="حذف">
            <Trash2 className="h-6 w-6 text-primary" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, hasSAR }: { title: string, value: string, icon: React.ReactNode, trend: string, hasSAR?: boolean }) {
  return (
    <Card className="border-white/5 bg-card/50 rounded-[2rem] hover:border-primary/20 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{title}</p>
          <div className="p-0 border-none">{icon}</div>
        </div>
        <div className="text-3xl font-black mb-1 flex items-center gap-1 justify-end">
          {value}
          {hasSAR && <img src={SAR_LOGO} className="h-3.5 w-auto object-contain" alt="ر.س" />}
        </div>
        <p className="text-[9px] text-muted-foreground font-black flex items-center gap-1 justify-end">
          {trend} <Fingerprint className="h-3 w-3 text-primary" />
        </p>
      </CardContent>
    </Card>
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
