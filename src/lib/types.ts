
export type EventStatus = 'active' | 'sold_out' | 'cancelled';

export interface NFTConfig {
  title: string;
  description: string;
  attributes: string[];
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  totalCapacity: number;
  ticketPrice: number;
  imageUrl: string;
  status: EventStatus;
  numericId?: string;
  nftConfig?: NFTConfig;
}

export interface User {
  id: string;
  name: string;
  email: string;
  walletAddress?: string; // محفظة خارجية (MetaMask)
  vaultAddress?: string;  // عنوان الخزنة الشخصية المولد آلياً
  vaultPrivateKey?: string;
  vaultMnemonic?: string; // عبارة الاسترداد السرية (12 كلمة)
  balance?: number;       // الرصيد الرقمي الداخلي (VTX)
  burnedCount?: number;
}

export interface ResaleListing {
  id: string;
  ticketId: string;
  eventId: string;
  sellerId: string;
  price: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: any;
}

export interface Order {
  id: string;
  eventId: string;
  eventName: string;
  userId: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  isBlockchain?: boolean;
  orderDate: any;
  createdAt: any;
}

export interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  ownerId: string;
  seatNumber: string;
  priceAtPurchase: number;
  nftTokenId?: string;
  mintTransactionHash?: string;
  verificationCode?: string;
  isBlockchain?: boolean;
  status: 'pending_mint' | 'minted' | 'transferred' | 'scanned' | 'active' | 'resale_listed' | 'burned';
  lockedUntil?: any; 
  createdAt: any;
  updatedAt: any;
}
