"use client";

import { Navbar } from "@/components/navbar";
import { ShoppingBag, Search, SlidersHorizontal, Loader2, ShieldCheck, Zap, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, where, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { ResaleListing, Ticket, Event } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MarketplacePage() {
  const firestore = useFirestore();
  const { isLoading } = useCollection<ResaleListing>(useMemoFirebase(() => query(collection(firestore, "resales"), where("status", "==", "active")), [firestore]));

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Marketplace Hero */}
        <section className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mx-auto">
            <Zap className="h-4 w-4" />
            بروتوكول إعادة البيع الداخلي الرسمي
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight">
            السوق <span className="text-primary">الموثق</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            تداول التذاكر بأمان مع معجبين آخرين. يضمن بروتوكولنا أصالة 100% ويفرض سقفاً بنسبة 20% لمنع التلاعب بالأسعار.
          </p>
          
          <div className="flex max-w-md mx-auto gap-2 flex-row-reverse">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ابحث في قوائم إعادة البيع..." className="pr-10 h-12 bg-white/5 border-white/10 text-right" />
            </div>
            <Button size="icon" variant="outline" className="h-12 w-12 border-white/10">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Info Box */}
        <div className="mb-12 p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-6 flex-row-reverse">
           <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
             <Info className="h-6 w-6" />
           </div>
           <div className="flex-1 text-sm text-muted-foreground">
             <strong className="text-primary">ملاحظة البروتوكول:</strong> جميع معاملات إعادة البيع تخضع لتحويل ملكية فوري في خزنة فيري تيكس. يتم تحديث الملكية أيضاً على شبكة بوليفون.
           </div>
           <Badge variant="outline" className="border-primary/30 text-primary">تم فرض سقف 20%</Badge>
        </div>

        <ResaleList />
      </main>
    </div>
  );
}

function ResaleList() {
  const firestore = useFirestore();
  const resalesQuery = useMemoFirebase(() => query(collection(firestore, "resales"), where("status", "==", "active")), [firestore]);
  const { data: resales, isLoading } = useCollection<ResaleListing>(resalesQuery);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  
  if (!resales || resales.length === 0) {
    return (
      <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-[3rem]">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-muted-foreground">لا توجد تذاكر معروضة حالياً. عد لاحقاً!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {resales.map((resale) => (
        <ResaleCard key={resale.id} resale={resale} />
      ))}
    </div>
  );
}

function ResaleCard({ resale }: { resale: ResaleListing }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isBuying, setIsBuying] = useState(false);

  const { data: event } = useDoc<Event>(useMemoFirebase(() => doc(firestore, "events", resale.eventId), [firestore, resale.eventId]));
  const { data: ticket } = useDoc<Ticket>(useMemoFirebase(() => doc(firestore, "tickets", resale.ticketId), [firestore, resale.ticketId]));

  if (!event || !ticket) return null;

  const handleBuy = async () => {
    if (!user) {
      toast({ title: "مطلوب تسجيل الدخول", description: "يرجى تسجيل الدخول للشراء من السوق." });
      router.push("/login");
      return;
    }

    if (user.uid === resale.sellerId) {
      toast({ variant: "destructive", title: "إجراء مرفوض", description: "لا يمكنك شراء تذكرتك الخاصة." });
      return;
    }

    setIsBuying(true);
    try {
      await addDoc(collection(firestore, "orders"), {
        userId: user.uid,
        eventId: resale.eventId,
        eventName: event.name,
        totalAmount: resale.price,
        numberOfTickets: 1,
        status: "completed",
        paymentStatus: "paid",
        transactionId: `resale_${resale.id}`,
        isResale: true,
        orderDate: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(firestore, "tickets", resale.ticketId), {
        ownerId: user.uid,
        status: "active",
        updatedAt: serverTimestamp()
      });

      await updateDoc(doc(firestore, "resales", resale.id), {
        status: "completed",
        buyerId: user.uid,
        updatedAt: serverTimestamp()
      });

      toast({ title: "تم الشراء بنجاح", description: "تم نقل التذكرة إلى خزنتك الرقمية." });
      router.push("/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "فشلت العملية", description: err.message });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="group rounded-[2.5rem] bg-card border border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-xl hover:shadow-primary/5 text-right">
      <div className="relative aspect-[16/10]">
        <Image src={event.imageUrl} alt={event.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary text-primary-foreground font-black">إعادة بيع رسمية</Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end flex-row-reverse">
          <div className="text-right">
            <h3 className="text-xl font-bold font-headline">{event.name}</h3>
            <p className="text-[10px] uppercase font-black text-muted-foreground">{event.venue}</p>
          </div>
          <Badge variant="outline" className="border-white/20 bg-black/40 backdrop-blur-md">المقعد {ticket.seatNumber}</Badge>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="space-y-1 text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">سعر إعادة البيع</p>
            <div className="text-3xl font-black text-primary">${resale.price}</div>
          </div>
          <div className="text-left space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">الأصلي</p>
            <div className="text-sm font-bold opacity-50 line-through">${ticket.priceAtPurchase}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest justify-end">
             موثق بالبروتوكول <ShieldCheck className="h-3 w-3 text-green-500" />
           </div>
           <p className="text-[9px] text-muted-foreground leading-relaxed">
             هذه التذكرة موقعة تشفيرياً. سيتم نقل الملكية بشكل فوري عند تأكيد الدفع.
           </p>
        </div>

        <Button 
          onClick={handleBuy} 
          disabled={isBuying}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
        >
          {isBuying ? <Loader2 className="animate-spin ml-2" /> : <ShoppingBag className="ml-2 h-5 w-5" />}
          شراء من السوق
        </Button>
      </div>
    </div>
  );
}
