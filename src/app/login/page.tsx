"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Mail, Lock, Loader2, Wallet } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(returnTo);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: "بيانات الاعتماد غير صالحة."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveWalletToProfile = async (userId: string, walletAddress: string) => {
    const userRef = doc(firestore, "users", userId);
    await setDoc(userRef, {
      id: userId,
      walletAddress: walletAddress,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const connectMetaMask = async () => {
    if (typeof window === "undefined") return;
    
    const provider = (window as any).ethereum;
    if (provider) {
      try {
        setIsLoading(true);
        const accounts = await provider.request({ method: 'eth_requestAccounts' }).catch((err: any) => {
          if (err.code === 4001) throw new Error("تم رفض الطلب من قبل المستخدم.");
          throw err;
        });

        if (!accounts || accounts.length === 0) throw new Error("لم يتم العثور على حسابات نشطة.");
        
        const walletAddress = accounts[0];
        const credential = await signInAnonymously(auth);
        await saveWalletToProfile(credential.user.uid, walletAddress);
        
        toast({ 
          title: "تم ربط المحفظة", 
          description: `تم الدخول بالعنوان ${walletAddress.substring(0, 6)}...` 
        });
        router.push(returnTo);
      } catch (error: any) {
        console.error("Wallet connection error:", error);
        toast({ 
          variant: "destructive", 
          title: "خطأ في الاتصال", 
          description: error.message || "فشل ربط المحفظة، يرجى التأكد من فتح الإضافة." 
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  return (
    <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">تسجيل الدخول</CardTitle>
        <CardDescription>أدخل بياناتك أو استخدم محفظة Web3.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                className="pr-10 bg-white/5 border-white/10 text-right"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-row-reverse">
              <Label htmlFor="password">كلمة المرور</Label>
              <Link href="#" className="text-xs text-primary hover:underline">نسيت كلمة المرور؟</Link>
            </div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                className="pr-10 bg-white/5 border-white/10 text-right"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">أو المتابعة عبر Web3</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button 
            variant="outline" 
            className="border-white/10 hover:bg-white/5 gap-2" 
            onClick={connectMetaMask}
            disabled={isLoading}
          >
            <Wallet className="h-4 w-4 text-orange-400" />
            محفظة MetaMask
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center border-t border-white/5 pt-6 mt-4">
        <p className="text-sm text-muted-foreground">
          ليس لديك حساب؟ <Link href={`/signup?returnTo=${encodeURIComponent(returnTo)}`} className="text-primary font-bold hover:underline">إنشاء حساب</Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground text-right" dir="rtl">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground mb-4">
              <Ticket className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-headline font-bold">مرحباً بك في <span className="text-primary">فيري تيكس</span></h1>
            <p className="text-muted-foreground text-sm">وصول آمن إلى خزنتك الرقمية للفعاليات.</p>
          </div>

          <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
