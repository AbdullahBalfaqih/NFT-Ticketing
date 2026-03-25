"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Loader2, User, Globe, Coins } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { sendWelcomeEmail } from "@/app/actions/email";
import Image from "next/image";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "خطأ", description: "كلمات المرور غير متطابقة." });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const entropy = ethers.randomBytes(16);
      const mnemonic = ethers.Mnemonic.entropyToPhrase(entropy);
      const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
      
      await setDoc(doc(firestore, "users", user.uid), {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        vaultAddress: wallet.address,
        vaultPrivateKey: wallet.privateKey,
        vaultMnemonic: mnemonic,
        balance: 100,
        burnedCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      sendWelcomeEmail(formData.email, formData.name).catch(console.error);

      toast({ 
        title: "تم إنشاء الحساب والخزنة", 
        description: `مرحباً بك! تم إرسال بريد ترحيبي لعناونك الإلكتروني.` 
      });
      router.push(returnTo);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل التسجيل",
        description: error.message || "تعذر إنشاء الحساب، يرجى المحاولة لاحقاً."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">إنشاء حساب جديد</CardTitle>
        <CardDescription>احصل على هويتك الرقمية وابدأ تجربتك الموثقة.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="name" 
                placeholder="فلان الفلاني" 
                className="pr-10 bg-white/5 border-white/10 text-right"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                className="pr-10 bg-white/5 border-white/10 text-right"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pr-10 bg-white/5 border-white/10 text-right"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  className="pr-10 bg-white/5 border-white/10 text-right"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full h-11 font-bold bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء الحساب وتأمين الخزنة"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-white/5 pt-6 mt-4">
        <p className="text-sm text-muted-foreground">
          لديك حساب بالفعل؟ <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="text-primary font-bold hover:underline">تسجيل الدخول</Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Image 
                src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1774396174/image-removebg-preview_75_yghhlp.png" 
                alt="EvenTix Chain" 
                fill 
                className="object-contain" 
              />
            </div>
            <h1 className="text-3xl font-headline font-bold">انضم إلى <span className="text-primary">EvenTix Chain</span></h1>
            <p className="text-muted-foreground text-sm">ابدأ رحلتك في عالم تجارب الفعاليات الموثقة.</p>
          </div>

          <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>}>
            <SignupForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}