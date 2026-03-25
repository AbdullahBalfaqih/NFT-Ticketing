
"use client";

import { Navbar } from "@/components/navbar";
import { QrCode, Loader2, Copy, Check, ExternalLink, Ticket as TicketIcon, Clock, Flame, Wallet, ShieldCheck, Globe, Database, Settings2, Coins, Sparkles, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { Ticket, Event, User as UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TicketCard } from "@/components/ticket-card";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isResaleDialogOpen, setIsResaleDialogOpen] = useState(false);
  const [isBurnDialogOpen, setIsBurnDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [resalePrice, setResalePrice] = useState("");
  const [isListing, setIsListing] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, "users", user.uid) : null, [firestore, user]);
  const { data: profile } = useDoc<any>(userProfileRef);

  const ticketsQuery = useMemoFirebase(() => user ? query(collection(firestore, "tickets"), where("ownerId", "==", user.uid)) : null, [firestore, user]);
  const { data: tickets, isLoading: isTicketsLoading } = useCollection<Ticket>(ticketsQuery);

  // تصنيف التذاكر بناءً على حالتها ودورة حياتها
  const activeTickets = tickets?.filter(t => t.status === 'active' || t.status === 'resale_listed') || [];
  const myNfts = tickets?.filter(t => t.status === 'minted') || [];
  const archiveTickets = tickets?.filter(t => t.status === 'scanned' || t.status === 'burned') || [];
  
  const burnedCount = profile?.burnedCount || 0;
  const burnProgress = (burnedCount % 5);
  const rewardsEarned = Math.floor(burnedCount / 5);

  const selectedTicket = tickets?.find(t => t.id === selectedTicketId);

  const handleOpenResale = () => {
    if (!selectedTicket) return;
    if (selectedTicket.status === 'scanned' || selectedTicket.status === 'minted') {
      toast({ variant: "destructive", title: "بروتوكول القفل", description: "لا يمكن بيع تذكرة مستخدمة أو محولة لـ NFT." });
      return;
    }
    const createdTime = selectedTicket.createdAt?.toDate ? selectedTicket.createdAt.toDate().getTime() : new Date(selectedTicket.createdAt).getTime();
    if ((new Date().getTime() - createdTime) / (1000 * 60 * 60) < 24) {
      toast({ variant: "destructive", title: "قفل الـ 24 ساعة", description: "التداول متاح فقط بعد 24 ساعة من الشراء." });
      return;
    }
    setIsResaleDialogOpen(true);
  };

  const handleListForResale = async () => {
    if (!selectedTicket || !resalePrice) return;
    setIsListing(true);
    try {
      const price = parseFloat(resalePrice);
      if (price > selectedTicket.priceAtPurchase * 1.2) {
        toast({ variant: "destructive", title: "تجاوز سقف السعر", description: "الحد الأقصى هو سعر الشراء + 20%." });
        return;
      }
      await addDoc(collection(firestore, "resales"), {
        ticketId: selectedTicket.id, eventId: selectedTicket.eventId, sellerId: user?.uid, price, status: 'active', createdAt: serverTimestamp()
      });
      await updateDoc(doc(firestore, "tickets", selectedTicket.id), { status: "resale_listed", updatedAt: serverTimestamp() });
      toast({ title: "تم الإدراج بنجاح" });
      setIsResaleDialogOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    } finally { setIsListing(false); }
  };

  const handleBurnTicket = async () => {
    if (!selectedTicket || isBurning) return;
    setIsBurning(true);
    try {
      await updateDoc(doc(firestore, "tickets", selectedTicket.id), { status: "burned", updatedAt: serverTimestamp() });
      if (user) await updateDoc(doc(firestore, "users", user.uid), { burnedCount: increment(1), updatedAt: serverTimestamp() });
      toast({ title: "تم الحرق بنجاح والمطالبة بالنقاط" });
      setIsBurnDialogOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    } finally { setIsBurning(false); }
  };

  const handleClaimNFT = async (ticketId: string) => {
    if (isMinting) return;
    setIsMinting(true);
    try {
      await updateDoc(doc(firestore, "tickets", ticketId), {
        status: "minted",
        updatedAt: serverTimestamp()
      });
      toast({ title: "تم التحويل بنجاح", description: "التذكرة الآن هي أصل NFT تذكاري في قسم MY NFTs." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "فشل التحويل", description: err.message });
    } finally {
      setIsMinting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayAddress = profile?.vaultAddress || "جاري التحميل...";
  const displayBalance = profile?.balance || 0;

  return (
    <div className="min-h-screen flex flex-col bg-black text-right" dir="rtl">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
          <div className="space-y-6 text-right w-full lg:flex-1">
            <h1 className="text-6xl font-headline font-bold">خزنتي <span className="text-primary">الرقمية</span></h1>
            
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="bg-[#0a0f1a] border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-2xl">
                
                
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">عنوان الخزنة</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/60 truncate max-w-[120px]">{displayAddress}</span>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(displayAddress)} className="h-6 w-6">
                        {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full border-white/5 bg-white/5 h-10 rounded-xl gap-2 text-xs">
                    <Link href="/dashboard/wallet"><Settings2 className="h-4 w-4" /> إدارة المفاتيح والرموز</Link>
                  </Button>
                </div>
              </div>

               
            </div>
          </div>
          
          <div className="w-full lg:w-[400px] p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 space-y-6 shadow-[0_0_50px_rgba(37,99,235,0.1)]">
            <div className="flex justify-between items-center flex-row-reverse">
              <h3 className="text-primary font-bold text-xl">مكافآت الحرق</h3>
              <Badge className="bg-primary text-white border-none text-[12px] px-4 py-1.5 rounded-full">{rewardsEarned} مكافأة</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-bold text-primary">{Math.round((burnProgress/5)*100)}%</span>
                <span className="text-[14px] font-bold text-primary">تذكرة مجانية ({burnProgress}/5)</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(burnProgress/5)*100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-[#0a0f1a] border border-white/5 p-1.5 h-14 rounded-full gap-2 px-2 flex w-fit">
              <TabsTrigger value="active" className="rounded-full px-10 h-11 text-base data-[state=active]:bg-primary data-[state=active]:text-white">التذاكر النشطة</TabsTrigger>
              <TabsTrigger value="nfts" className="rounded-full px-10 h-11 text-base data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> MY NFTs
              </TabsTrigger>
              <TabsTrigger value="archive" className="rounded-full px-10 h-11 text-base data-[state=active]:bg-primary data-[state=active]:text-white">الأرشيف</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active">
            {isTicketsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
            ) : activeTickets.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {activeTickets.map(ticket => (
                  <div key={ticket.id} className="space-y-6">
                    <div className="relative group">
                      <TicketCard 
                        ticket={ticket} 
                        onClick={() => setSelectedTicketId(ticket.id === selectedTicketId ? null : ticket.id)}
                        className={selectedTicketId === ticket.id ? 'scale-[1.05]' : ''}
                      />
                    </div>
                    {selectedTicketId === ticket.id && (
                      <div className="flex flex-wrap gap-2 justify-center animate-in fade-in slide-in-from-top-2">
                        <Button size="sm" variant="outline" className="h-10 rounded-xl border-primary/20 bg-primary/5 gap-2" onClick={() => setIsQRDialogOpen(true)}>
                          <QrCode className="h-4 w-4 text-primary" /> كود الدخول
                        </Button>
                        <Button size="sm" variant="outline" className="h-10 rounded-xl border-primary/20 bg-primary/5" onClick={handleOpenResale}>إعادة تداول</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem]">
                <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">لا توجد تذاكر نشطة حالياً.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="nfts">
            {myNfts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {myNfts.map(ticket => (
                  <div key={ticket.id} className="space-y-6">
                    <TicketCard 
                      ticket={ticket} 
                      onClick={() => setSelectedTicketId(ticket.id === selectedTicketId ? null : ticket.id)}
                      className={selectedTicketId === ticket.id ? 'scale-[1.05]' : ''}
                    />
                    <div className="flex justify-center gap-4">
                      <Button size="sm" variant="ghost" className="h-10 text-destructive hover:bg-destructive/10 gap-2" onClick={() => { setSelectedTicketId(ticket.id); setIsBurnDialogOpen(true); }}>
                        <Flame className="h-4 w-4" /> حرق للمكافآت
                      </Button>
                      {ticket.mintTransactionHash && (
                        <Button asChild size="sm" variant="ghost" className="h-10 text-primary hover:bg-primary/10 gap-2">
                          <a href={`https://amoy.polygonscan.com/tx/${ticket.mintTransactionHash}`} target="_blank" rel="noopener noreferrer">
                            <ShieldCheck className="h-4 w-4" /> فحص السلسلة
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem]">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">خزنة الـ NFTs فارغة. استخدم تذاكرك لتحويلها لذكريات خالدة.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="archive">
            {archiveTickets.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {archiveTickets.map(ticket => (
                  <div key={ticket.id} className="space-y-6">
                    <div className="relative group">
                      <TicketCard 
                        ticket={ticket} 
                        onClick={() => setSelectedTicketId(ticket.id === selectedTicketId ? null : ticket.id)}
                        className={selectedTicketId === ticket.id ? 'scale-[1.05]' : ticket.status === 'burned' ? 'opacity-50 grayscale' : ''}
                      />
                      {ticket.status === 'scanned' && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">تم الحضور</div>
                      )}
                      {ticket.status === 'burned' && (
                        <div className="absolute top-4 right-4 bg-destructive text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">تم الحرق</div>
                      )}
                    </div>
                    {selectedTicketId === ticket.id && ticket.status === 'scanned' && (
                      <div className="flex justify-center animate-in fade-in slide-in-from-top-2">
                        <Button size="sm" variant="outline" className="h-10 rounded-xl border-primary/20 bg-primary/10 gap-2 font-bold" onClick={() => handleClaimNFT(ticket.id)} disabled={isMinting}>
                          {isMinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />} 
                          تحويل لـ NFT تذكاري
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem]">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">الأرشيف فارغ حالياً. الفعاليات التي تحضرها ستظهر هنا.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 border-white/5 text-center bg-black" dir="rtl">
          <DialogHeader><DialogTitle className="text-2xl font-bold mb-4 font-headline">كود الدخول الموثق</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2rem] my-6">
            <QRCodeSVG value={selectedTicket ? JSON.stringify({t: selectedTicket.id, s: selectedTicket.verificationCode}) : ""} size={200} level="H" />
            <div className="mt-4 text-black font-mono font-bold text-sm tracking-widest">{selectedTicket?.verificationCode}</div>
          </div>
          <Button onClick={() => setIsQRDialogOpen(false)} className="w-full bg-primary font-bold h-12 rounded-xl">إغلاق</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isResaleDialogOpen} onOpenChange={setIsResaleDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 border-white/5 text-right bg-black" dir="rtl">
          <DialogHeader><DialogTitle className="text-2xl font-bold font-headline">عرض للتداول الرسمي</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-primary p-3 rounded-xl bg-primary/5 text-xs">
              <Clock className="h-4 w-4" /> بروتوكول مكافحة الجشع: السعر الأقصى هو سعر الشراء + 20%.
            </div>
            <Input type="number" value={resalePrice} onChange={(e) => setResalePrice(e.target.value)} className="h-14 bg-white/5 text-right font-headline" placeholder="السعر المطلوب ($)" />
          </div>
          <Button onClick={handleListForResale} disabled={isListing} className="w-full h-14 bg-primary font-bold">{isListing ? <Loader2 className="animate-spin" /> : "إدراج في السوق"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isBurnDialogOpen} onOpenChange={setIsBurnDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 border-white/5 text-right bg-black" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary font-headline">بروتوكول الحرق النهائي</DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">بمجرد حرق الـ NFT، ستتم أرشفته وستحصل على نقاط مكافأة في حسابك فوراً.</DialogDescription>
          </DialogHeader>
          <Button onClick={handleBurnTicket} disabled={isBurning} className="w-full h-14 bg-primary mt-6 font-bold">{isBurning ? <Loader2 className="animate-spin" /> : "تأكيد الحرق والمطالبة بالنقاط"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
