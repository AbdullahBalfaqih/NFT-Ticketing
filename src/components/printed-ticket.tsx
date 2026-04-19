
"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import "@/app/printed-ticket.css";

export function PrintedTicket() {
  return (
    <div className="ticket-system" dir="rtl">
      <div className="top">
        <h1 className="title">جاري استخراج تذكرتك الموثقة...</h1>
        <div className="printer" />
      </div>
      <div className="receipts-wrapper">
        <div className="receipts">
          <div className="receipt">
            <div className="flex justify-center mb-6">
              <Image 
                src="https://res.cloudinary.com/ddznxtb6f/image/upload/q_auto/f_auto/v1776511752/image-removebg-preview_98_zrfpns.png" 
                alt="VeriTix Logo" 
                width={140} 
                height={60} 
                className="object-contain"
              />
            </div>
            
            <div className="route" dir="ltr">
              <div className="relative w-20 h-20">
                <Image 
                  src="https://res.cloudinary.com/ddznxtb6f/image/upload/q_auto/f_auto/v1776511484/image-removebg-preview_99_r70dir.png" 
                  alt="Al-Hilal" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div className="flex flex-col items-center px-4">
                <span className="text-[10px] font-black text-primary uppercase">vs</span>
                <div className="h-0.5 w-12 bg-slate-100 rounded-full my-1" />
                <span className="text-[8px] font-black text-slate-400">Match 42</span>
              </div>
              <div className="relative w-20 h-20">
                <Image 
                  src="https://res.cloudinary.com/ddznxtb6f/image/upload/q_auto/f_auto/v1776511514/20201128145509_Alnassr_FC_Logo_2020_qco5xh.png" 
                  alt="Al-Nassr" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </div>

            <div className="details grid grid-cols-2 gap-y-6 gap-x-4 mt-8">
              <div className="item">
                <span>المشجع</span>
                <h3>EvenTix Fan</h3>
              </div>
              <div className="item">
                <span>الفعالية</span>
                <h3>ديربي الرياض</h3>
              </div>
              <div className="item">
                <span>التاريخ</span>
                <h3>01 / 12 / 2024</h3>
              </div>
              <div className="item">
                <span>الوقت</span>
                <h3>09:00 PM</h3>
              </div>
              <div className="item">
                <span>الملعب</span>
                <h3>المملكة أرينا</h3>
              </div>
              <div className="item">
                <span>المقعد</span>
                <h3>VIP-01</h3>
              </div>
            </div>
          </div>

          <div className="receipt qr-code">
            <div className="flex items-center gap-6 w-full flex-row-reverse">
              <div className="qr-wrapper bg-white p-1 rounded-lg border border-slate-100 shadow-inner">
                <QRCodeSVG 
                  value="https://nft-ticketing-six.vercel.app" 
                  size={70} 
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="description">
                <h2>VTX-AUTHENTIC</h2>
                <p>سجل ملكية نهائي على شبكة Polygon</p>
                <div className="mt-1 h-1 w-12 bg-primary/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
