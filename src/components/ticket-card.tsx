"use client";

import { QRCodeSVG } from "qrcode.react";
import { Ticket, Event } from "@/lib/types";
import { useDoc, useMemoFirebase, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import "@/app/ticket-dashboard.css";

const SAR_LOGO = "https://res.cloudinary.com/ddznxtb6f/image/upload/v1774472727/image-removebg-preview_78_zqzygb.png";

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  className?: string;
  hideQR?: boolean;
}

export function TicketCard({ ticket, onClick, className, hideQR = false }: TicketCardProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const eventRef = useMemoFirebase(() => doc(firestore, "events", ticket.eventId), [firestore, ticket.eventId]);
  const { data: event } = useDoc<Event>(eventRef);

  const getQRData = () => {
    return JSON.stringify({
      t: ticket.nftTokenId || ticket.id,
      e: ticket.eventId,
      s: ticket.verificationCode,
      h: ticket.mintTransactionHash
    });
  };

  if (!event) return <div className="h-[150px] w-full max-w-[360px] bg-white/5 animate-pulse rounded-[1.5rem] mx-auto" />;

  return (
    <div className={`container-cards-ticket ${className}`} onClick={onClick} dir="ltr">
      <div className="card-ticket">
        <div className="ticket-image-side">
          <img src={event.imageUrl} alt={event.name} />
        </div>
        <div className="separator">
          <span className="span-lines"></span>
        </div>
        <div className="content-ticket">
          <div className="content-data">
            <div className="destination">
              <div className="dest start">
                <p className="country">EVENT</p>
                <p className="acronym">{event.name.length > 12 ? event.name.substring(0, 12) + "..." : event.name}</p>
                <div className="hour flex items-center gap-1">
                  {event.ticketPrice}
                  <img src={SAR_LOGO} style={{ height: '14px', width: 'auto' }} className="object-contain" alt="ر.س" />
                </div>
              </div>
              <svg
                style={{ flexShrink: 0 }}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="#aeaeae"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="m18 8l4 4l-4 4M2 12h20"
                ></path>
              </svg>
              <div className="dest end">
                <p className="country">VENUE</p>
                <p className="acronym">{event.venue.length > 12 ? event.venue.substring(0, 12) + "..." : event.venue}</p>
                <p className="hour">{event.time}</p>
              </div>
            </div>
            <div style={{ borderBottom: "2px solid #e8e8e8" }}></div>
            <div className="data-flex-col">
              <div className="data-flex">
                <div className="data">
                  <p className="title">VTX-ID</p>
                  <p className="subtitle">{ticket.verificationCode || `#${ticket.id.substring(0, 6)}`}</p>
                </div>
                <div className="data passenger">
                  <p className="title">HOLDER</p>
                  <p className="subtitle truncate max-w-[120px]">{user?.displayName || user?.email?.split('@')[0] || 'GUEST'}</p>
                </div>
              </div>
              <div className="data-flex">
                <div className="data">
                  <p className="title">EVENTID</p>
                  <p className="subtitle">{event.numericId || event.id.substring(0, 5)}</p>
                </div>
                <div className="data">
                  <p className="title">DATE</p>
                  <p className="subtitle">{event.date.split('-').reverse().join('/')}</p>
                </div>
                <div className="data">
                  <p className="title">SEAT</p>
                  <p className="subtitle">{ticket.seatNumber}</p>
                </div>
              </div>
            </div>
          </div>
          {!hideQR && (
            <div className="container-icons">
              <div className="qr-wrapper">
                <QRCodeSVG value={getQRData()} size={45} level="M" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
