
"use client";

import { Navbar } from "@/components/navbar";
import { Code2, Terminal, Cpu, Blocks, Copy, Check, Globe, ShieldCheck, Zap, Database, TestTube2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevelopersPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({ title: "تم النسخ", description: "الكود جاهز للصق." });
    setTimeout(() => setCopied(null), 2000);
  };

  const apiSnippet = `// Get Ticket Metadata (ERC-721 Compliant)
const response = await fetch('https://veritix.app/api/nft/1234');
const metadata = await response.json();

console.log(metadata.name); // "Neon Festival Ticket #1234"`;

  const sdkSnippet = `import { VeriTixProtocol } from '@veritix/sdk';

const protocol = new VeriTixProtocol({
  network: 'polygon-amoy',
  apiKey: 'vtx_live_...'
});

// Verify VTX-Hash
const isValid = await protocol.verifyTicket('VTX-A1-B2');`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-right" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-20">
          {/* Header */}
          <section className="text-center space-y-6">
            <Badge variant="outline" className="border-primary/20 text-primary py-1 px-4 rounded-full font-black">بوابة المطورين v1.0</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-black">ابنِ على <span className="text-primary">فيري تيكس</span></h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-black">
              ادمج أكثر بروتوكولات التذاكر أماناً في الشرق الأوسط في تطبيقاتك عبر واجهاتنا البرمجية المتقدمة.
            </p>
          </section>

          {/* Testing Guide Section */}
          <section className="grid md:grid-cols-2 gap-6">
            <Card className="bg-primary/5 border-primary/20 rounded-[2rem] p-8 space-y-4">
              <div className="flex items-center gap-3 justify-end">
                <h3 className="text-xl font-black">اختبار الـ API</h3>
                <TestTube2 className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-black">
                يمكنك اختبار استجابة الميتا-داتا الخاصة بالتذاكر (ERC-721) عبر طلب أي Token ID نشط من خزنك الرقمية.
              </p>
              <Button asChild variant="outline" className="w-full rounded-xl border-primary/20 hover:bg-primary/10 font-black">
                <a href="/api/nft/1" target="_blank">تجربة طلب Metadata <ExternalLink className="mr-2 h-4 w-4" /></a>
              </Button>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 space-y-4">
              <div className="flex items-center gap-3 justify-end">
                <h3 className="text-xl font-black">دليل التحقق</h3>
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-black">
                استخدم صفحة التحقق العامة لاختبار الهاشات التشفيرية (VTX-Hash) التي يتم إنتاجها بعد عمليات السك.
              </p>
              <Button asChild className="w-full rounded-xl bg-primary font-black">
                <a href="/verify">اذهب لمركز التحقق</a>
              </Button>
            </Card>
          </section>

          {/* Managed Vault Protocol Info */}
          <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 space-y-6 text-right">
             <div className="flex items-center gap-4 justify-end">
               <h2 className="text-3xl font-black">بروتوكول الخزنة المدارة (Managed Vault)</h2>
               <div className="p-3 rounded-2xl bg-primary/20 text-primary"><Database className="h-8 w-8" /></div>
             </div>
             <p className="text-muted-foreground leading-relaxed font-black">
               نستخدم في فيري تيكس عناوين **EOA (Externally Owned Accounts)** حقيقية على شبكة Polygon. كل مستخدم يحصل على عنوان محفظة فريد يتم توليده تشفيرياً. هذا العنوان عام، مما يعني أنه يمكنك كشريك أو مطور إرسال مكافآت (Airdrops) أو تصاريح إضافية مباشرة لعنوان الخزنة الخاص بالمستخدم، وسيراها فوراً في تطبيقه.
             </p>
             <div className="grid md:grid-cols-2 gap-4">
               <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                 <h4 className="font-black mb-2">قابلية التصدير</h4>
                 <p className="text-xs text-muted-foreground font-black">العناوين ليست حبيسة نظامنا؛ يمكن للمستخدم مستقبلاً تصدير مفتاحه الخاص لأي محفظة Web3.</p>
               </div>
               <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                 <h4 className="font-black mb-2">التوافق القياسي</h4>
                 <p className="text-xs text-muted-foreground font-black">ندعم معايير ERC-721 و ERC-1155 بشكل كامل لضمان العمل مع كافة الأسواق العالمية.</p>
               </div>
             </div>
          </section>

          {/* API Documentation */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 justify-start">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-primary"><Terminal className="h-6 w-6" /></div>
              <h2 className="text-3xl font-black">واجهة بيانات التذاكر</h2>
            </div>
            
            <div className="bg-[#0A0D12] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 flex-row-reverse">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiSnippet, 'api')} className="h-8 gap-2 font-black">
                  {copied === 'api' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  نسخ
                </Button>
              </div>
              <pre className="p-8 overflow-x-auto text-left" dir="ltr">
                <code className="text-sm font-mono text-primary/90">{apiSnippet}</code>
              </pre>
            </div>
            <p className="text-muted-foreground text-sm font-black">
              تتبع واجهتنا البرمجية **معيار ERC-721**، مما يجعلها متوافقة أصلاً مع OpenSea وRarible والمنصات الأخرى.
            </p>
          </section>

          {/* SDK Documentation */}
          <section className="space-y-8 pb-20">
            <div className="flex items-center gap-4 justify-start">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-primary"><Cpu className="h-6 w-6" /></div>
              <h2 className="text-3xl font-black">VeriTix SDK</h2>
            </div>
            
            <div className="bg-[#0A0D12] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 flex-row-reverse">
                <Badge className="bg-primary/20 text-primary border-none font-black px-4">قريباً</Badge>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(sdkSnippet, 'sdk')} className="h-8 gap-2 font-black">
                  {copied === 'sdk' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  نسخ
                </Button>
              </div>
              <pre className="p-8 overflow-x-auto text-left" dir="ltr">
                <code className="text-sm font-mono text-primary/90">{sdkSnippet}</code>
              </pre>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 bg-black/20 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-black">مركز مطوري بروتوكول فيري تيكس v1.0</p>
        </div>
      </footer>
    </div>
  );
}
