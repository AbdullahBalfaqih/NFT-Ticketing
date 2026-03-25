"use client";

import { Navbar } from "@/components/navbar";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Wand2, Loader2, Sparkles, Database, Fingerprint, Upload, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateEventDescription } from "@/ai/flows/admin-event-description-generator";
import { useFirestore, useStorage } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  
  const [formData, setFormData] = useState({
    name: "",
    theme: "",
    keywords: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    price: "",
    capacity: "",
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

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "ملف كبير جداً", description: "يرجى اختيار صورة أقل من 5 ميجابايت." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // إضافة تايم أوت لضمان عدم التعليق للأبد
    const timeoutId = setTimeout(() => {
      if (isUploading) {
        setIsUploading(false);
        toast({ 
          variant: "destructive", 
          title: "انتهت مهلة الرفع", 
          description: "يبدو أن هناك مشكلة في الاتصال أو إعدادات CORS في Firebase Storage." 
        });
      }
    }, 30000); // 30 ثانية

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `events/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storageRef = ref(storage, fileName);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          clearTimeout(timeoutId);
          console.error("Upload Task Error:", error);
          setIsUploading(false);
          toast({ 
            variant: "destructive", 
            title: "فشل الرفع", 
            description: "تأكد من تفعيل Storage في كونسول Firebase وضبط قواعد الأمان." 
          });
        }, 
        async () => {
          clearTimeout(timeoutId);
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
          setIsUploading(false);
          toast({ title: "تم الرفع بنجاح", description: "تم تحديث رابط صورة الـ NFT." });
        }
      );
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Upload Catch Error:", error);
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.date || !formData.price) {
      toast({ variant: "destructive", title: "حقول ناقصة", description: "الاسم والتاريخ والسعر مطلوبة." });
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
        ticketPrice: parseFloat(formData.price) || 0,
        numericId: formData.numericId,
        imageUrl: formData.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/600`,
        status: 'active',
        nftConfig: {
          title: formData.nftTitle || formData.name,
          description: formData.nftDescription || formData.description,
          attributes: formData.keywords.split(",").map(k => k.trim())
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(firestore, "events"), eventData);
      
      toast({ title: "تم نشر الفعالية", description: "مجموعة الـ NFT والفعالية متاحة الآن." });
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
            <div className="space-y-2">
              <h1 className="text-4xl font-headline font-bold">نشر <span className="text-primary">فعالية</span></h1>
              <p className="text-muted-foreground">قم بتهيئة تجربتك على السلسلة.</p>
            </div>

            <div className="space-y-6 bg-card/50 p-8 rounded-3xl border border-white/5">
              <h3 className="text-lg font-bold flex items-center gap-2 text-right justify-end">
                <Sparkles className="h-5 w-5 text-primary" /> المعلومات الأساسية
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>اسم الفعالية</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/5 text-right" />
                </div>
                <div className="space-y-2">
                  <Label>الثيم (Theme)</Label>
                  <Input value={formData.theme} onChange={e => setFormData({...formData, theme: e.target.value})} className="bg-white/5 text-right" />
                </div>
                <div className="space-y-2">
                  <Label>كلمات مفتاحية</Label>
                  <Input value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="bg-white/5 text-right" placeholder="VIP, حصري, تقني" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center flex-row-reverse">
                  <Label>وصف الفعالية</Label>
                  <Button variant="outline" size="sm" onClick={handleAiGenerate} disabled={isGenerating} className="h-8 text-xs gap-2">
                    {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />} تحسين بالذكاء الاصطناعي
                  </Button>
                </div>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-white/5 min-h-[120px] text-right" />
              </div>
            </div>

            <div className="space-y-6 bg-primary/5 p-8 rounded-3xl border border-primary/20">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary justify-end">
                <Fingerprint className="h-5 w-5" /> أصول الـ NFT المرئية
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>صورة الـ NFT</Label>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isUploading}
                      className="gap-2 shrink-0 border-primary/20 hover:bg-primary/10"
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      رفع من الجهاز
                    </Button>
                    <Input 
                      value={formData.imageUrl} 
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                      className="bg-white/5 border-primary/20 flex-1 text-right" 
                      placeholder="أو الصق رابط الصورة"
                    />
                  </div>
                </div>

                {isUploading && (
                  <Alert className="bg-primary/10 border-primary/20 animate-pulse">
                    <Clock className="h-4 w-4 text-primary" />
                    <AlertTitle>جاري الرفع ({Math.round(uploadProgress)}%)...</AlertTitle>
                    <AlertDescription>يرجى الانتظار، سيتم إلغاء العملية تلقائياً في حال عدم الاستجابة بعد 30 ثانية.</AlertDescription>
                  </Alert>
                )}

                {formData.imageUrl && !isUploading && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-primary/20 bg-black/20">
                    <img src={formData.imageUrl} alt="NFT Preview" className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="space-y-2 pt-4">
                  <Label>اسم التوكن (NFT)</Label>
                  <Input 
                    value={formData.nftTitle} 
                    onChange={e => setFormData({...formData, nftTitle: e.target.value})} 
                    className="bg-white/5 border-primary/20 text-right" 
                    placeholder={formData.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوصف على السلسلة</Label>
                  <Textarea 
                    value={formData.nftDescription} 
                    onChange={e => setFormData({...formData, nftDescription: e.target.value})} 
                    className="bg-white/5 border-primary/20 text-right" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="font-bold flex items-center gap-2 justify-end">
                <Database className="h-4 w-4 text-primary" /> اللوجستيات
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">الموقع</Label>
                  <Input value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="bg-white/5 h-9 text-right" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">التاريخ</Label>
                    <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-white/5 h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">الوقت</Label>
                    <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-white/5 h-9" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">السعر ($)</Label>
                    <Input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white/5 h-9 text-right" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">الإمداد</Label>
                    <Input value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="bg-white/5 h-9 text-right" />
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving || isUploading} className="w-full h-14 bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20">
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : "نشر التجربة"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
