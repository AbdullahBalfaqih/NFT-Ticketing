
"use client";

import { QRCodeSVG } from "qrcode.react";
import { Ticket, Event } from "@/lib/types";
import { useDoc, useMemoFirebase, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import "@/app/ticket-dashboard.css";

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  className?: string;
}

export function TicketCard({ ticket, onClick, className }: TicketCardProps) {
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

  // إذا كانت التذكرة قد تحولت إلى NFT تذكاري
  if (ticket.status === 'minted') {
    return (
      <div className={`ticket-canvas font-body ${className}`} onClick={onClick}>
        <div className="ticket-wrapper">
          <div className="ticket-nft" dir="ltr">
            <div className="t-main" style={{ backgroundImage: `url(${event.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="t-overlay"></div>
              <div className="t-content">
                <div className="t-header">
                  <div className="t-logo">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    VERITIX
                  </div>
                  <div className="t-type">MEMORIAL NFT</div>
                </div>
                
                <div className="t-title-container">
                  <h2 className="t-title-ar">{event.name}</h2>
                  <p className="t-subtitle">Blockchain-Verified Collectible</p>
                </div>

                <div className="t-details-grid">
                  <div className="t-item">
                    <span className="t-label">HOLDER</span>
                    <span className="t-value">{user?.displayName || user?.email?.split('@')[0] || 'VeriTix Fan'}</span>
                  </div>
                  <div className="t-item">
                    <span className="t-label">DATE</span>
                    <span className="t-value">{event.date}</span>
                  </div>
                  <div className="t-item">
                    <span className="t-label">VENUE</span>
                    <span className="t-value">{event.venue}</span>
                  </div>
                  <div className="t-item">
                    <span className="t-label">HASH</span>
                    <span className="t-value font-mono text-[8px]">{ticket.verificationCode}</span>
                  </div>
                </div>
              </div>
              
              <div className="t-perforation-wrapper">
                <div className="t-perf-circle-l"></div>
                <div className="t-perf-line"></div>
                <div className="t-perf-circle-r"></div>
              </div>
            </div>
            
            <div className="t-stub">
              <div className="t-barcode-area">
                <div className="t-barcode-visual">
                  <div className="barcode-bars"></div>
                </div>
                <div className="t-barcode-id">VTX-{ticket.nftTokenId || ticket.id.substring(0,6)}</div>
              </div>
              <div className="t-admit-box">
                <div className="t-admit-label">SEAT</div>
                <div className="t-admit-val">{ticket.seatNumber}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // التصميم الجديد المستوحى من تذكرة الطيران (Boarding Pass) للتذاكر النشطة
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
                <p className="acronym">{event.name.substring(0, 3).toUpperCase()}</p>
                <p className="hour">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 1024 1024">
                    <path fill="currentColor" d="M768 256H353.6a32 32 0 1 1 0-64H800a32 32 0 0 1 32 32v448a32 32 0 0 1-64 0z"></path>
                    <path fill="currentColor" d="M777.344 201.344a32 32 0 0 1 45.312 45.312l-544 544a32 32 0 0 1-45.312-45.312z"></path>
                  </svg>
                  {event.time}
                </p>
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
                <p className="acronym">{event.venue.substring(0, 3).toUpperCase()}</p>
                <p className="hour">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 1024 1024">
                    <path fill="currentColor" d="M352 768a32 32 0 1 0 0 64h448a32 32 0 0 0 32-32V352a32 32 0 0 0-64 0v416z"></path>
                    <path fill="currentColor" d="M777.344 822.656a32 32 0 0 0 45.312-45.312l-544-544a32 32 0 0 0-45.312 45.312z"></path>
                  </svg>
                  LIVE
                </p>
              </div>
            </div>
            <div style={{ borderBottom: "2px solid #e8e8e8" }}></div>
            <div className="data-flex-col">
              <div className="data-flex">
                <div className="data">
                  <p className="title">ID</p>
                  <p className="subtitle">#{ticket.id.substring(0, 6)}</p>
                </div>
                <div className="data passenger">
                  <p className="title">Passenger</p>
                  <p className="subtitle">{user?.displayName || user?.email?.split('@')[0] || 'GUEST'}</p>
                </div>
              </div>
              <div className="data-flex">
                <div className="data">
                  <p className="title">EventID</p>
                  <p className="subtitle">{event.numericId || event.id.substring(0, 5)}</p>
                </div>
                <div className="data">
                  <p className="title">Date</p>
                  <p className="subtitle">{event.date.split('-').reverse().join('/')}</p>
                </div>
                <div className="data">
                  <p className="title">Seat</p>
                  <p className="subtitle">{ticket.seatNumber}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="container-icons">
            <div className="qr-wrapper">
              <QRCodeSVG value={getQRData()} size={45} level="M" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
