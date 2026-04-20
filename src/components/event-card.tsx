
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
    <div className="ticket-widget no-copy" dir="rtl">
      <div className="top --flex-column">
        {/* العناوين العلوية */}
        <div className="space-y-2">
          <div className="bandname">{event.name}</div>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black">
              <Calendar className="h-3 w-3 text-primary" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black">
              <Clock className="h-3 w-3 text-primary" />
              <span>{event.time}</span>
            </div>
          </div>
        </div>
        
        {/* الصورة */}
        <div className="relative">
          <img 
            src={event.imageUrl} 
            alt={event.name} 
            className="event-banner"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
        </div>

        {/* البيانات السفلية */}
        <div className="deetz">
          {/* السعر */}
          {!isConference && (
            <div className="text-right">
              <div className="label">سعر التذكرة</div>
              <div className="flex items-center gap-1">
                <span className="cost">{event.ticketPrice}</span>
                <img src={SAR_LOGO} className="h-5 w-auto object-contain" alt="ر.س" />
              </div>
            </div>
          )}

          {/* الموقع */}
          <div className="flex-1 text-left">
            <div className="label flex items-center gap-1 justify-end">
              <span>الموقع</span>
              <MapPin className="h-2.5 w-2.5" />
            </div>
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {event.venue}
            </div>
          </div>
        </div>
      </div>

      <div className="rip"></div>

      <div className="bottom">
        <div className="barcode"></div>
        <Link className="buy" href={`/events/${event.id}`}>
          {isConference ? 'تفاصيل الدعوة' : 'احجز تذكرتك'}
        </Link>
      </div>

      {isConference && (
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] px-2 py-0.5">
            بدعوة خاصة
          </Badge>
        </div>
      )}
    </div>
  );
}
