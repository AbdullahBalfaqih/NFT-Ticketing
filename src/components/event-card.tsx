"use client";

import Link from "next/link";
import { Event } from "@/lib/types";
import "@/app/ticket.css";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="ticket-widget no-copy" dir="rtl">
      <div className="top --flex-column">
        <div className="bandname -bold">{event.name}</div>
        <div className="tourname">{event.venue}</div>
        <img 
          src={event.imageUrl} 
          alt={event.name} 
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
        <div className="deetz">
          <div className="event --flex-column">
            <div className="date">{event.date} • {event.time}</div>
            <div className="location -bold">{event.venue}</div>
          </div>
          <div className="price --flex-column">
            <div className="label">سعر التذكرة</div>
            <div className="cost -bold">${event.ticketPrice}</div>
          </div>
        </div>
      </div>
      <div className="rip"></div>
      <div className="bottom">
        <div className="barcode"></div>
        <Link className="buy" href={`/events/${event.id}`}>
          احجز تذكرتك
        </Link>
      </div>
    </div>
  );
}