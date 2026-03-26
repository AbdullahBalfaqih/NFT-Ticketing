
"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, User, Loader2, Wallet } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { sendWelcomeEmail } from "@/app/actions/email";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import "@/app/auth-loader.css";

function AuthContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("جاري التحميل");
  const [activeTab, setActiveTab] = useState(searchParams.get("mode") === "signup" ? "signup" : "login");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingText("جاري تسجيل الدخول");
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      toast({ title: "أهلاً بك مجدداً", description: "تم تسجيل الدخول بنجاح." });
      router.push(returnTo);
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل تسجيل الدخول", description: "بيانات الاعتماد غير صالحة." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast({ variant: "destructive", title: "خطأ", description: "كلمات المرور غير متطابقة." });
      return;
    }

    setIsLoading(true);
    setLoadingText("جاري إنشاء حساب ومحفظة");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      const user = userCredential.user;

      const entropy = ethers.randomBytes(16);
      const mnemonic = ethers.Mnemonic.entropyToPhrase(entropy);
      const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
      
      await setDoc(doc(firestore, "users", user.uid), {
        id: user.uid,
        name: signupData.name,
        email: signupData.email,
        vaultAddress: wallet.address,
        vaultPrivateKey: wallet.privateKey,
        vaultMnemonic: mnemonic,
        balance: 100,
        burnedCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      sendWelcomeEmail(signupData.email, signupData.name).catch(console.error);

      toast({ title: "تم إنشاء الخزنة", description: "مرحباً بك في فيري تيكس! تم تأمين هويتك الرقمية." });
      router.push(returnTo);
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل التسجيل", description: error.message || "تعذر إنشاء الحساب." });
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined") return;
    
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      setIsLoading(true);
      setLoadingText("جاري ربط المحفظة");

      const provider = ethereum.providers?.find((p: any) => p.isMetaMask) || ethereum;

      if (typeof provider.request !== 'function') {
        throw new Error("لم يتم العثور على طريقة الاتصال في مزود المحفظة.");
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' }).catch((reqErr: any) => {
        throw new Error(reqErr?.message || "تم رفض طلب الاتصال من قبل المستخدم أو الإضافة.");
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("لم يتم اختيار أي حساب للاتصال.");
      }

      const walletAddress = accounts[0];
      const credential = await signInAnonymously(auth);
      
      await setDoc(doc(firestore, "users", credential.user.uid), {
        id: credential.user.uid,
        walletAddress: walletAddress,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "تم ربط المحفظة", description: "تم الدخول عبر المحفظة بنجاح." });
      router.push(returnTo);
    } catch (err: any) {
      console.warn("Wallet connection error:", err);
      toast({ 
        variant: "destructive", 
        title: "خطأ في الاتصال", 
        description: err.message || "تعذر الاتصال بالمحفظة. تأكد من فتح الإضافة وتسجيل الدخول فيها." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-4">
        <div className="relative w-full h-24 mb-2">
          <Image 
            src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1774396174/image-removebg-preview_75_yghhlp.png" 
            alt="VeriTix" 
            fill 
            className="object-contain" 
            priority
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-white">مرحباً بك في <span className="text-primary">فيري تيكس</span></h1>
          <p className="text-muted-foreground text-sm font-bold">وصول آمن إلى خزنتك الرقمية للفعاليات.</p>
        </div>
      </div>

      <Card className="border-white/5 bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem] shadow-2xl">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="loader-page"
              >
                <div className="loader-container">
                  <div className="loader-ring"></div>
                  <div className="loader-ring"></div>
                  <div className="loader-ring"></div>
                  <div className="loader-ring"></div>
                  <h3 className="loader-text">{loadingText}</h3>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12 bg-white/5 p-1 rounded-xl mb-8">
                    <TabsTrigger value="login" className="rounded-lg font-black data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-primary transition-all">دخول</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg font-black data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-primary transition-all">إنشاء حساب</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="relative group">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="email" 
                          placeholder="البريد الإلكتروني" 
                          className="h-14 pr-12 bg-[#121212] border-white/5 rounded-xl font-bold text-right focus:border-primary/50"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="relative group">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="password" 
                          placeholder="كلمة المرور" 
                          className="h-14 pr-12 bg-[#121212] border-white/5 rounded-xl font-bold text-right focus:border-primary/50"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-xl shadow-lg shadow-primary/20">
                        تسجيل الدخول
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="relative group">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          placeholder="الاسم الكامل" 
                          className="h-12 pr-12 bg-[#121212] border-white/5 rounded-xl font-bold text-right focus:border-primary/50"
                          value={signupData.name}
                          onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="relative group">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="email" 
                          placeholder="البريد الإلكتروني" 
                          className="h-12 pr-12 bg-[#121212] border-white/5 rounded-xl font-bold text-right focus:border-primary/50"
                          value={signupData.email}
                          onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          type="password" 
                          placeholder="كلمة المرور" 
                          className="h-12 bg-[#121212] border-white/5 rounded-xl font-bold text-right text-xs focus:border-primary/50"
                          value={signupData.password}
                          onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                          required
                        />
                        <Input 
                          type="password" 
                          placeholder="تأكيد" 
                          className="h-12 bg-[#121212] border-white/5 rounded-xl font-bold text-right text-xs focus:border-primary/50"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl">
                        إنشاء الحساب
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute w-full border-t border-white/5" />
                  <span className="relative bg-[#0a0a0a] px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">أو عبر الشبكة</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={connectWallet}
                    className="h-14 bg-[#121212] border-white/5 hover:bg-white/5 rounded-xl flex items-center justify-center gap-3 font-black text-white group"
                  >
                    <div className="relative w-6 h-6 group-hover:scale-110 transition-transform">
                      <Image 
                        src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1774395637/MetaMask_Fox.svg_jx0cq7.png" 
                        alt="MetaMask" 
                        fill 
                        className="object-contain" 
                      />
                    </div>
                    دخول عبر MetaMask
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground text-right selection:bg-primary/30" dir="rtl">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div className="flex justify-center py-20 text-primary animate-pulse font-black">جاري تهيئة البروتوكول...</div>}>
          <AuthContainer />
        </Suspense>
      </main>
    </div>
  );
}
