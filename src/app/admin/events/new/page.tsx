
"use client";

import { Navbar } from "@/components/navbar";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Wand2, Loader2, Sparkles, Database, Fingerprint, Upload, AlertCircle, Clock, QrCode, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateEventDescription } from "@/ai/flows/admin-event-description-generator";
import { useFirestore, useStorage } from "@/firebase";
import { collection, addDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function NewEventPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [eventType, setEventType] = useState<'conference' | 'match'>('conference');
  const [formData, setFormData] = useState({
    name: "",
    theme: "",
    keywords: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    price: "0",
    capacity: "100",
    imageUrl: "",
    nftTitle: "",
    nftDescription: "",
    numericId: Math.floor(Math.random() * 1000000).toString()
  });

  const handleAiGenerate = async () => {
    if (!formData.name && !formData.theme) return;
    setIsGenerating(true);
    try {
      const result = await generateEventDescription({
        theme: formData.theme || formData.name,
        keywords: formData.keywords.split(",").map(k => k.trim()),
        existingDescription: formData.description
      });
      setFormData(prev => ({ ...prev, description: result.generatedDescription }));
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `events/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        }, 
        (error) => {
          console.error("Upload Error:", error);
          setIsUploading(false);
          toast({ variant: "destructive", title: "فشل الرفع" });
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
          setIsUploading(false);
          toast({ title: "تم الرفع بنجاح" });
        }
      );
    } catch (error: any) {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.date || !formData.capacity) {
      toast({ variant: "destructive", title: "حقول ناقصة", description: "الاسم والتاريخ والعدد مطلوبة." });
      return;
    }

    setIsSaving(true);
    try {
      const eventData = {
        name: formData.name,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        totalCapacity: parseInt(formData.capacity) || 0,
        ticketPrice: eventType === 'conference' ? 0 : parseFloat(formData.price) || 0,
        numericId: formData.numericId,
        imageUrl: formData.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/600`,
        status: 'active',
        eventType: eventType,
        nftConfig: {
          title: formData.nftTitle || formData.name,
          description: formData.nftDescription || formData.description,
          attributes: formData.keywords.split(",").map(k => k.trim())
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const eventRef = await addDoc(collection(firestore, "events"), eventData);
      
      const capacity = parseInt(formData.capacity);
      const batch = writeBatch(firestore);
      
      for (let i = 1; i <= capacity; i++) {
        const ticketId = doc(collection(firestore, "tickets")).id;
        const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase();
        const prefix = eventType === 'conference' ? 'INV' : 'TKT';
        const vtxCode = `VTX-${prefix}-${formData.numericId}-${randomHash}`;
        
        batch.set(doc(firestore, "tickets", ticketId), {
          id: ticketId,
          eventId: eventRef.id,
          ownerId: null,
          seatNumber: eventType === 'conference' ? `INV-${i.toString().padStart(3, '0')}` : `S-${i.toString().padStart(3, '0')}`,
          priceAtPurchase: eventType === 'conference' ? 0 : (parseFloat(formData.price) || 0),
          verificationCode: vtxCode,
          status: "physical_unclaimed",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      
      toast({ 
        title: eventType === 'conference' ? "تم نشر الدعوة بنجاح" : "تم نشر الفعالية بنجاح", 
        description: `تم توليد ${capacity} باركود موثق بنجاح.` 
      });
      router.push("/admin");
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في الحفظ", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8">
          <ChevronRight className="ml-2 h-4 w-4" /> العودة
        </Button>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-headline font-bold">إعداد <span className="text-primary">تجربة جديدة</span></h1>
              
              <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
                <button 
                  onClick={() => setEventType('conference')}
                  className={cn(
                    "px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2",
                    eventType === 'conference' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                  )}
                >
                  <ShieldCheck className="h-4 w-4" /> مؤتمر / دعوة خاصة
                </button>
                <button 
                  onClick={() => setEventType('match')}
                  className={cn(
                    "px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2",
                    eventType === 'match' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                  )}
                >
                  <Ticket className="h-4 w-4" /> مباراة / فعالية عامة
                </button>
              </div>
            </div>

            <div className="space-y-6 bg-card/50 p-8 rounded-3xl border border-white/5">
              <h3 className="text-lg font-bold flex items-center gap-2 text-right justify-end">
                <Sparkles className="h-5 w-5 text-primary" /> تفاصيل {eventType === 'conference' ? 'الدعوة' : 'الحدث'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>الاسم</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/5 text-right h-12" placeholder={eventType === 'conference' ? "مثلاً: مؤتمر الابتكار 2024" : "مثلاً: ديربي الرياض"} />
                </div>
                <div className="space-y-2">
                  <Label>الموقع</Label>
                  <Input value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="bg-white/5 text-right" />
                </div>
                <div className="space-y-2">
                  <Label>{eventType === 'conference' ? 'عدد المدعوين' : 'سعة الحضور'}</Label>
                  <Input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="bg-white/5 text-right font-black" />
                </div>
                {eventType === 'match' && (
                  <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                    <Label>سعر التذكرة (ر.س)</Label>
                    <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white/5 text-right font-black border-primary/20" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center flex-row-reverse">
                  <Label>الوصف</Label>
                  <Button variant="outline" size="sm" onClick={handleAiGenerate} disabled={isGenerating} className="h-8 text-xs gap-2">
                    {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />} تحسين AI
                  </Button>
                </div>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-white/5 min-h-[120px] text-right" />
              </div>
            </div>

            <div className="space-y-6 bg-primary/5 p-8 rounded-3xl border border-primary/20">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary justify-end">
                <QrCode className="h-5 w-5" /> الهوية البصرية للـ NFT
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>الصورة الرئيسية</Label>
                  <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="gap-2 shrink-0 border-primary/20">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      رفع صورة
                    </Button>
                    <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="bg-white/5 border-primary/20 flex-1 text-right" placeholder="رابط الصورة" />
                  </div>
                </div>

                {formData.imageUrl && !isUploading && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-primary/20 bg-black/20">
                    <img src={formData.imageUrl} alt="Event Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="font-bold flex items-center gap-2 justify-end">
                <Clock className="h-4 w-4 text-primary" /> الجدولة
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">التاريخ</Label>
                  <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-white/5 h-11" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">وقت البدء</Label>
                  <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-white/5 h-11" />
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving || isUploading} className="w-full h-16 bg-primary text-primary-foreground font-black text-xl shadow-xl shadow-primary/20 rounded-2xl">
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : eventType === 'conference' ? "نشر وتوليد الدعوات" : "نشر وتوليد التذاكر"}
            </Button>
            
            {eventType === 'conference' && (
              <p className="text-[10px] text-center text-muted-foreground font-bold leading-relaxed px-4">
                * ملاحظة: المؤتمرات لا تتطلب شراء أو تحديد مقاعد. سيتم توليد باركودات دعوة عامة موثقة.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
