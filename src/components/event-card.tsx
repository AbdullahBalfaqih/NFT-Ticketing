"use client";

import Link from "next/link";
import { Event } from "@/lib/types";
import "@/app/ticket.css";
import { MapPin, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SAR_LOGO = "https://res.cloudinary.com/ddznxtb6f/image/upload/v1774472727/image-removebg-preview_78_zqzygb.png";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isConference = event.eventType === 'conference';

  return (
    <div className="ticket-widget no-copy h-full" dir="rtl">
      <div className="top --flex-column h-full">
        {/* العناوين العلوية */}
        <div className="space-y-1">
          <div className="bandname -bold">{event.name}</div>
          {/* التاريخ في المساحة الفارغة العلوية */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black">
            <Calendar className="h-3 w-3 text-primary" />
            <span>{event.date}</span>
            <span className="opacity-30">|</span>
            <Clock className="h-3 w-3 text-primary" />
            <span>{event.time}</span>
          </div>
        </div>
        
        {/* الصورة */}
        <div className="relative group mt-4">
          <img 
            src={event.imageUrl} 
            alt={event.name} 
            className="event-banner w-full rounded-lg"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
        </div>

        {/* البيانات السفلية (Deetz) */}
        <div className="deetz mt-auto flex items-end justify-between gap-4 py-4 px-[18px]">
          {/* اليمين: الموقع - يظهر كاملاً */}
          <div className="flex-1 text-right space-y-1 overflow-hidden">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-black uppercase">
              <span>الموقع</span>
              <MapPin className="h-2.5 w-2.5" />
            </div>
            <div className="text-xs font-bold text-slate-900 leading-tight break-words">
              {event.venue}
            </div>
            {isConference && (
              <div className="pt-1">
                <Badge className="bg-primary text-white border-none font-black text-[8px] px-2 py-0.5 shadow-lg shadow-primary/10">
                  بدعوة خاصة
                </Badge>
              </div>
            )}
          </div>
          
          {/* اليسار: السعر - الرقم يليه الرمز (SAR بعد الرقم) */}
          {!isConference && (
            <div className="shrink-0 text-left space-y-1">
              <div className="text-[10px] text-muted-foreground font-black uppercase">سعر التذكرة</div>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xl font-black text-primary leading-none">{event.ticketPrice}</span>
                <img src={SAR_LOGO} style={{ height: '16px', width: 'auto' }} className="object-contain" alt="ر.س" />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="rip"></div>
      <div className="bottom">
        <div className="barcode"></div>
        <Link className="buy" href={`/events/${event.id}`}>
          {isConference ? 'تفاصيل الدعوة' : 'احجز تذكرتك'}
        </Link>
      </div>
    </div>
  );
}
