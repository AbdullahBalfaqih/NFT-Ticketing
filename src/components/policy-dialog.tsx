"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollText, X, ShieldCheck, FileText, Cookie } from "lucide-react";

export type PolicyType = 'privacy' | 'terms' | 'cookies' | 'all';

interface PolicyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  view?: PolicyType;
}

export function PolicyDialog({ isOpen, onClose, view = 'all' }: PolicyDialogProps) {
  const renderContent = () => {
    switch (view) {
      case 'privacy':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2 justify-end">
                مقدمة <ShieldCheck className="h-5 w-5 text-primary" />
              </h3>
              <p className="text-muted-foreground font-bold">
                نحن في "EvenTix Chain" (المشار إليها فيما بعد ب "المنصة"، "نحن"، أو "لنا") نضع حماية بياناتك الشخصية وخصوصيتك في مقدمة أولوياتنا. تهدف هذه السياسة لإعلامك بكيفية معالجة بياناتك وفقاً لنظام حماية البيانات الشخصية السعودي.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white">أولاً: جهة التحكم وبيانات التواصل</h3>
              <p className="text-muted-foreground font-bold">اسم الجهة: EvenTix Chain</p>
              <p className="text-muted-foreground font-bold">التواصل: eventixchain@gmail.com</p>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white">ثانياً: البيانات التي نجمعها</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground font-bold">
                <li>الهوية والتواصل: الاسم، البريد، ورقم الجوال.</li>
                <li>المحفظة الرقمية: العنوان العام لتسجيل ملكية التذاكر.</li>
                <li>المعاملات: تفاصيل الشراء وإعادة البيع على البلوكشين.</li>
                <li>بيانات تقنية: عنوان الـ IP ونوع الجهاز.</li>
              </ul>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white">ثالثاً: المسوغ النظامي</h3>
              <p className="text-muted-foreground font-bold">نعالج البيانات لتنفيذ العقد (إصدار التذاكر)، وبناءً على الموافقة الصريحة، وتحقيقاً للمصلحة المشروعة في حماية المنصة من الاحتيال.</p>
            </section>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2 justify-end">
                أحكام الاستخدام <FileText className="h-5 w-5 text-primary" />
              </h3>
              <p className="text-muted-foreground font-bold">مرحباً بك في "EvenTix Chain". استخدامك للمنصة يعني موافقتك الكاملة على هذه الشروط التي تشكل عقداً إلكترونياً ملزماً وفقاً للأنظمة السعودية.</p>
            </section>
            <div className="space-y-6">
              {[
                { t: "1. تعريف الخدمة", d: "منصة وسيطة لتداول التذاكر باستخدام البلوكشين." },
                { t: "2. الأهلية", d: "يجب أن تبلغ 18 عاماً على الأقل وتتمتع بالأهلية القانونية." },
                { t: "3. قواعد التداول", d: "تخضع إعادة البيع لسقف سعري (20%) وقفل زمني برمجياً." },
                { t: "4. الملكية الرقمية", d: "تذكرتك أصل رقمي مسجل باسمك، وتصميمها ملك للمنظم." },
                { t: "5. التحقق", d: "يتم مسح الهاش (VTX-Hash) عند الدخول لمنع الاستخدام المتكرر." }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="font-black text-primary mb-1">{item.t}</h4>
                  <p className="text-xs font-bold text-muted-foreground">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'cookies':
        return (
          <div className="space-y-8 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <Cookie className="h-10 w-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-white">سياسة ملفات الارتباط</h3>
              <p className="text-muted-foreground font-bold leading-relaxed max-w-md mx-auto">
                نستخدم ملفات الارتباط الضرورية فقط لتأمين جلسة دخولك وحماية هويتك الرقمية أثناء التعامل مع البلوكشين. نحن لا نستخدم ملفات تتبع إعلانية من جهات خارجية.
              </p>
            </div>
          </div>
        );
      default:
        return <div className="text-center text-muted-foreground py-10 font-bold">يرجى اختيار قسم للاطلاع عليه.</div>;
    }
  };

  const titles = {
    privacy: "سياسة الخصوصية",
    terms: "شروط الخدمة",
    cookies: "سياسة ملفات الارتباط",
    all: "السياسات القانونية"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0a0a0a] border-white/10 p-0 rounded-[2.5rem] overflow-hidden shadow-2xl" dir="rtl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <ScrollText className="h-6 w-6" />
            <DialogTitle className="text-xl font-black">{titles[view] || titles.all}</DialogTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[60vh] p-8">
          <div className="text-right text-sm leading-relaxed">
            {renderContent()}
          </div>
        </ScrollArea>
        <div className="p-6 bg-white/5 border-t border-white/5 text-center">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 font-black px-12 rounded-xl h-12">فهمت المكتوب</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
