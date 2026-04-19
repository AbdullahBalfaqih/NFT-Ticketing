
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { sendWelcomeEmail } from "@/app/actions/email";
import { Checkbox } from "@/components/ui/checkbox";
import { PolicyDialog, type PolicyType } from "@/components/policy-dialog";
import "@/app/auth-loader.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("جاري التحميل");
  const [policyConfig, setPolicyConfig] = useState<{ isOpen: boolean, type: PolicyType }>({ isOpen: false, type: 'terms' });
  const [isAccepted, setIsAccepted] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setLoadingText("جاري تسجيل الدخول");
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      toast({ title: "أهلاً بك مجدداً", description: "تم تسجيل الدخول بنجاح." });
      onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: "بيانات الاعتماد غير صالحة." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!isAccepted) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى الموافقة على شروط الاستخدام." });
      return;
    }
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

      sendWelcomeEmail(signupData.email, signupData.name).catch(() => {});

      toast({ title: "تم إنشاء الخزنة", description: "تم تأمين هويتك الرقمية بنجاح." });
      onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل التسجيل", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || isConnectingWallet) return;
    
    setIsConnectingWallet(true);
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        .catch((err: any) => {
          if (err.code === -32002) return null;
          throw err;
        });

      if (accounts && accounts.length > 0) {
        const walletAddress = accounts[0];
        setIsLoading(true);
        setLoadingText("جاري الربط بالبروتوكول");
        
        const credential = await signInAnonymously(auth);
        
        await setDoc(doc(firestore, "users", credential.user.uid), {
          id: credential.user.uid,
          walletAddress: walletAddress,
          updatedAt: serverTimestamp()
        }, { merge: true });

        toast({ title: "تم الربط بنجاح" });
        onClose();
      }
    } catch (err: any) {
      console.warn("Wallet Connection Suppressed");
    } finally {
      setIsConnectingWallet(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[440px] p-0 bg-[#0a0a0a] border-white/5 overflow-hidden rounded-[2.5rem]" dir="rtl">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="loader-page py-20">
                <div className="loader-container">
                  <div className="loader-ring"></div><div className="loader-ring"></div><div className="loader-ring"></div><div className="loader-ring"></div>
                  <h3 className="loader-text">{loadingText}</h3>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 space-y-6 md:space-y-8">
                <DialogHeader className="flex flex-col items-center text-center space-y-4">
                  <div className="relative w-full h-20 mb-2">
                    <Image src="https://res.cloudinary.com/ddznxtb6f/image/upload/q_auto/f_auto/v1776511752/image-removebg-preview_98_zrfpns.png" alt="EvenTix Logo" fill className="object-contain" />
                  </div>
                  <DialogTitle className="text-xl font-headline font-black">دخول البروتوكول</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12 bg-white/5 p-1 rounded-xl mb-6">
                    <TabsTrigger value="login" className="rounded-lg font-black">دخول</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg font-black">إنشاء حساب</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <Input type="email" placeholder="البريد الإلكتروني" className="h-12 md:h-14 bg-[#121212] border-white/5 rounded-xl font-bold text-right" value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} required />
                      <Input type="password" placeholder="كلمة المرور" className="h-12 md:h-14 bg-[#121212] border-white/5 rounded-xl font-bold text-right" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
                      <Button type="submit" className="w-full h-12 md:h-14 bg-primary font-black text-lg rounded-xl">تسجيل الدخول</Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <Input placeholder="الاسم الكامل" className="h-12 bg-[#121212] border-white/5 rounded-xl font-bold text-right" value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})} required />
                      <Input type="email" placeholder="البريد الإلكتروني" className="h-12 bg-[#121212] border-white/5 rounded-xl font-bold text-right" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} required />
                      <div className="grid grid-cols-2 gap-3">
                        <Input type="password" placeholder="كلمة المرور" className="h-12 bg-[#121212] border-white/5 rounded-xl font-bold text-right text-[10px]" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} required />
                        <Input type="password" placeholder="تأكيد" className="h-12 bg-[#121212] border-white/5 rounded-xl font-bold text-right text-[10px]" value={signupData.confirmPassword} onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})} required />
                      </div>
                      <div className="flex items-start gap-3 py-2">
                        <Checkbox id="terms" checked={isAccepted} onCheckedChange={(val) => setIsAccepted(val as boolean)} />
                        <label htmlFor="terms" className="text-[10px] leading-relaxed text-muted-foreground font-bold cursor-pointer">
                          أوافق على <button type="button" onClick={() => setPolicyConfig({ isOpen: true, type: 'terms' })} className="text-primary font-black">شروط الاستخدام</button>
                        </label>
                      </div>
                      <Button type="submit" className="w-full h-12 bg-primary font-black rounded-xl">إنشاء الحساب</Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute w-full border-t border-white/5" />
                  <span className="relative bg-[#0a0a0a] px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">أو عبر الشبكة</span>
                </div>

                <Button 
                  variant="outline" 
                  onClick={connectWallet}
                  disabled={isConnectingWallet}
                  className="w-full h-12 md:h-14 bg-[#121212] border-white/5 hover:bg-white/5 rounded-xl flex items-center justify-center gap-3 font-black text-white"
                >
                  <Image src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1774395637/MetaMask_Fox.svg_jx0cq7.png" alt="MetaMask" width={20} height={20} />
                  {isConnectingWallet ? "جاري الاتصال..." : "دخول عبر MetaMask"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
      <PolicyDialog isOpen={policyConfig.isOpen} onClose={() => setPolicyConfig(prev => ({...prev, isOpen: false}))} view={policyConfig.type} />
    </>
  );
}
