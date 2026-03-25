import { Event, User, Ticket, Order } from './types';

// Mock initial data
const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Neon Summer Night Festival',
    description: 'Experience the most vibrant electronic music festival of the season under the city lights.',
    date: '2024-08-15',
    time: '20:00',
    venue: 'Electric Arena',
    totalCapacity: 5000,
    ticketPrice: 85,
    imageUrl: 'https://picsum.photos/seed/concert1/800/600',
    status: 'active'
  },
  {
    id: '2',
    name: 'Tech Summit 2024',
    description: 'Leading minds in AI, Blockchain, and Robotics gather for a three-day innovation journey.',
    date: '2024-10-12',
    time: '09:00',
    venue: 'Innovation Center',
    totalCapacity: 2000,
    ticketPrice: 250,
    imageUrl: 'https://picsum.photos/seed/tech1/800/600',
    status: 'active'
  },
  {
    id: '3',
    name: 'Championship Finals',
    description: 'The ultimate showdown of the season. Witness history in the making.',
    date: '2024-09-05',
    time: '18:30',
    venue: 'Stellar Stadium',
    totalCapacity: 45000,
    ticketPrice: 120,
    imageUrl: 'https://picsum.photos/seed/sports1/800/600',
    status: 'active'
  }
];

// Persistent mock store for demo purposes (using a global variable simulation)
class VeriTixStore {
  private static instance: VeriTixStore;
  public events: Event[] = INITIAL_EVENTS;
  public orders: Order[] = [];
  public tickets: Ticket[] = [];
  public users: User[] = [
    { id: 'user_1', name: 'John Doe', email: 'john@example.com', walletAddress: '0x1234...5678' }
  ];

  private constructor() {}

  public static getInstance(): VeriTixStore {
    if (!VeriTixStore.instance) {
      VeriTixStore.instance = new VeriTixStore();
    }
    return VeriTixStore.instance;
  }

  getEventById(id: string) {
    return this.events.find(e => e.id === id);
  }

  addEvent(event: Event) {
    this.events.push(event);
  }

  addOrder(order: Order) {
    this.orders.push(order);
  }

  addTicket(ticket: Ticket) {
    this.tickets.push(ticket);
  }

  getUserTickets(userId: string) {
    return this.tickets.filter(t => t.userId === userId);
  }
}

export const store = VeriTixStore.getInstance();
