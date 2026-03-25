"use client";

import { Navbar } from "@/components/navbar";
import { useState } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Check, Eye, EyeOff, ShieldAlert, Wallet, ExternalLink, Download, Info, ArrowLeft, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function WalletManagementPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [firestore, user]
  );

  const { data: profile } = useDoc<any>(userProfileRef);

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "تم النسخ", description: "النص جاهز للصق الآن." });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const address = profile?.vaultAddress || "جاري التحميل...";
  const privateKey = profile?.vaultPrivateKey || "";
  const mnemonic = profile?.vaultMnemonic || "";

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-right">
            <h1 className="text-4xl font-headline font-bold">
              إدارة <span className="text-primary">الخزنة الرقمية</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              تحكم في مفاتيحك وأصولك الرقمية على السلسلة.
            </p>
          </div>

          <Button asChild variant="ghost" className="gap-2 flex-row-reverse">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              العودة للخزنة
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6">
            {/* Wallet Overview */}
            <Card className="bg-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4 text-right">
                <CardTitle className="text-lg flex items-center gap-2 flex-row-reverse">
                  <Wallet className="h-5 w-5 text-primary" />
                  نظرة عامة على الخزنة
                </CardTitle>
                <CardDescription>
                  العنوان العام والأصول المتاحة في خزنك الشخصي.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-4 space-y-6">
                <div className="p-6 rounded-2xl bg-[#0a0f1a] border border-white/5 space-y-4">
                  <Separator className="bg-white/5" />

                  <div className="space-y-2 text-right">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      عنوان البلوكشين (EOA)
                    </p>

                    <div className="flex items-center justify-between gap-4">
                      <code
                        className="text-xs font-mono break-all text-left flex-1"
                        dir="ltr"
                      >
                        {address}
                      </code>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(address, "address")}
                          className="h-8 w-8"
                        >
                          {copiedField === "address" ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>

                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-primary">
                          <a
                            href={`https://amoy.polygonscan.com/address/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR */}
                <div className="flex justify-center p-4 bg-white rounded-2xl w-fit mx-auto">
                  <QRCodeSVG value={address} size={150} />
                </div>
              </CardContent>
            </Card>

            {/* Sensitive Data */}
            <Card className="bg-card border-destructive/20 rounded-[2.5rem] overflow-hidden border-t-4 border-t-destructive">
              <CardHeader className="p-8 pb-4 text-right">
                <div className="flex items-center gap-2 text-destructive font-bold flex-row-reverse mb-2">
                  <ShieldAlert className="h-5 w-5" />
                  منطقة الخطر: مفاتيح الاستعادة
                </div>

                <CardTitle className="text-lg">
                  بيانات الاستيراد الخارجية
                </CardTitle>

                <CardDescription>
                  استخدم عبارة الاسترداد أو المفتاح الخاص لاستيراد محفظتك. لا تشاركها أبداً.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-4 space-y-8">
                {/* Mnemonic */}
                <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold flex items-center gap-2 flex-row-reverse">
                      <KeyRound className="h-3 w-3 text-primary" />
                      عبارة الاسترداد (12 كلمة)
                    </Label>

                    {showSensitive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(mnemonic, "mnemonic")}
                        className="h-6 text-[10px] gap-1 flex-row-reverse"
                      >
                        {copiedField === "mnemonic" ? <Check /> : <Copy />}
                        نسخ
                      </Button>
                    )}
                  </div>

                  <div
                    className={`p-6 rounded-2xl bg-white/5 border border-white/10 ${
                      !showSensitive ? "blur-md select-none" : ""
                    }`}
                  >
                    <p className="text-sm font-mono text-center" dir="ltr">
                      {mnemonic || "غير متوفرة"}
                    </p>
                  </div>
                </div>

                {/* Private Key */}
                <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold">المفتاح الخاص</Label>

                    {showSensitive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(privateKey, "pk")}
                        className="h-6 text-[10px] gap-1 flex-row-reverse"
                      >
                        {copiedField === "pk" ? <Check /> : <Copy />}
                        نسخ
                      </Button>
                    )}
                  </div>

                  <div
                    className={`p-6 rounded-2xl bg-destructive/5 border border-destructive/20 ${
                      !showSensitive ? "blur-md select-none" : ""
                    }`}
                  >
                    <code className="text-xs font-mono break-all text-left block" dir="ltr">
                      {privateKey || "جاري التحميل..."}
                    </code>
                  </div>
                </div>

                {/* Toggle */}
                {!showSensitive ? (
                  <Button
                    onClick={() => setShowSensitive(true)}
                    className="w-full flex-row-reverse gap-2"
                  >
                    <Eye />
                    كشف البيانات
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowSensitive(false)}
                    variant="ghost"
                    className="w-full flex-row-reverse gap-2"
                  >
                    <EyeOff />
                    إخفاء البيانات
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 space-y-6 text-right">
              <h3 className="text-xl font-bold flex items-center gap-2 flex-row-reverse">
                <Download className="h-6 w-6 text-primary" />
                كيفية الاستيراد
              </h3>

              <div className="space-y-4 text-sm">
                <ul className="list-disc pr-5 space-y-1">
                  <li>افتح MetaMask</li>
                  <li>اختر Import Wallet</li>
                  <li>الصق عبارة الاسترداد</li>
                </ul>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex gap-2 flex-row-reverse">
                  <Info className="h-4 w-4" />
                  استخدم العبارة لاستعادة المحفظة بالكامل
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}