
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * Metadata API for NFT tokens.
 * This endpoint is what PolygonScan and marketplaces (like OpenSea) look for.
 * Standard: ERC-721 Metadata JSON Schema.
 * In Next.js 15, params must be awaited.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params;
  const { firestore } = initializeFirebase();

  try {
    // 1. Search for the ticket by nftTokenId in Firestore
    const ticketsRef = collection(firestore, 'tickets');
    const q = query(ticketsRef, where('nftTokenId', '==', tokenId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Token not found in database' }, { status: 404 });
    }

    const ticketData = querySnapshot.docs[0].data();
    
    // 2. Fetch the associated event details
    const eventRef = doc(firestore, 'events', ticketData.eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      return NextResponse.json({ error: 'Event details not found' }, { status: 404 });
    }

    const eventData = eventSnap.data();
    const origin = request.nextUrl.origin;

    // 3. Build the ERC-721 compliant JSON metadata
    const metadata = {
      name: `${eventData.nftConfig?.title || eventData.name} #${tokenId}`,
      description: eventData.nftConfig?.description || eventData.description,
      image: eventData.imageUrl,
      external_url: `${origin}/events/${ticketData.eventId}`,
      attributes: [
        {
          trait_type: "Event Name",
          value: eventData.name
        },
        {
          trait_type: "Venue",
          value: eventData.venue
        },
        {
          trait_type: "Seat Number",
          value: ticketData.seatNumber
        },
        {
          trait_type: "Event Date",
          value: eventData.date
        },
        {
          trait_type: "Verification Hash",
          value: ticketData.verificationCode || "VTX-AUTHENTIC"
        },
        {
          trait_type: "Authenticity",
          value: "Verified on VeriTix Protocol"
        }
      ]
    };

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*', // Allow external SDK calls
      }
    });
  } catch (error) {
    console.error('Metadata API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
