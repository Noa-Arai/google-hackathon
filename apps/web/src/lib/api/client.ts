// API Client for Circle App
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Default user ID for MVP
const DEFAULT_USER_ID = 'demo-user-1';

interface RequestOptions {
    method?: string;
    body?: unknown;
    userId?: string;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, userId = DEFAULT_USER_ID } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text || text === 'null') {
        return null as T;
    }

    return JSON.parse(text);
}

// API functions
export const api = {
    // Circle
    getCircle: (circleId: string) =>
        apiRequest<Circle>(`/circles/${circleId}`),

    // Events
    getEvents: (circleId: string) =>
        apiRequest<Event[]>(`/circles/${circleId}/events`),

    getEvent: (eventId: string) =>
        apiRequest<Event>(`/events/${eventId}`),

    createEvent: (data: CreateEventRequest) =>
        apiRequest<Event>('/events', { method: 'POST', body: data }),

    // Announcements
    getAnnouncements: (circleId: string, limit = 10) =>
        apiRequest<Announcement[]>(`/circles/${circleId}/announcements?limit=${limit}`),

    getEventAnnouncements: (eventId: string) =>
        apiRequest<Announcement[]>(`/events/${eventId}/announcements`),

    createAnnouncement: (data: CreateAnnouncementRequest) =>
        apiRequest<Announcement>('/announcements', { method: 'POST', body: data }),

    getAnnouncement: (id: string, userId?: string) =>
        apiRequest<AnnouncementDetail>(`/announcements/${id}`, { userId }),

    // RSVP
    submitRSVP: (eventId: string, status: string, note?: string) =>
        apiRequest<RSVP>(`/events/${eventId}/rsvp`, { method: 'POST', body: { status, note } }),

    getMyRSVP: (eventId: string) =>
        apiRequest<RSVP | null>(`/events/${eventId}/rsvp/me`),

    // Settlements
    getEventSettlements: (eventId: string) =>
        apiRequest<Settlement[]>(`/events/${eventId}/settlements`),

    getMySettlements: () =>
        apiRequest<{ unpaid: SettlementWithPayment[]; paid: SettlementWithPayment[] }>('/settlements/me'),

    createSettlement: (data: CreateSettlementRequest) =>
        apiRequest<Settlement>('/settlements', { method: 'POST', body: data }),

    reportPayment: (settlementId: string, method: string, note?: string) =>
        apiRequest<Payment>(`/settlements/${settlementId}/report`, { method: 'POST', body: { method, note } }),

    // AI Chat
    chat: (circleId: string, message: string) =>
        apiRequest<ChatResponse>('/ai/chat', { method: 'POST', body: { circleId, message } }),
};

// Request Types
export interface CreateEventRequest {
    circleId: string;
    title: string;
    startAt: string;
    location?: string;
    coverImageUrl?: string;
    rsvpTargetUserIds: string[];
    createdBy: string;
}

export interface CreateAnnouncementRequest {
    circleId: string;
    eventId: string;
    title: string;
    body: string;
    createdBy: string;
}

export interface CreateSettlementRequest {
    circleId: string;
    eventId: string;
    title: string;
    amount: number;
    dueAt: string;
    targetUserIds: string[];
    bankInfo?: string;
    paypayInfo?: string;
}

// Types
export interface Circle {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
    createdAt: string;
}

export interface Event {
    id: string;
    circleId: string;
    title: string;
    startAt: string;
    location: string;
    coverImageUrl: string;
    rsvpTargetUserIds: string[];
    createdBy: string;
    createdAt: string;
}

export interface Announcement {
    id: string;
    circleId: string;
    eventId: string;
    title: string;
    body: string;
    imageUrl?: string;
    targetUserIds?: string[];
    createdBy: string;
    createdAt: string;
}

export interface AnnouncementDetail {
    announcement: Announcement;
    attendance?: RSVP;
    payments?: AnnouncementPayment[];
    isTarget: boolean;
}

export interface AnnouncementPayment {
    id: string;
    announcementId: string;
    userId: string;
    amount: number;
    description: string;
    isPaid: boolean;
    bankInfo: string;
    paypayInfo: string;
}

export interface RSVP {
    id: string;
    eventId: string;
    userId: string;
    status: 'GO' | 'NO' | 'LATE' | 'EARLY';
    note: string;
    updatedAt: string;
}

export interface Settlement {
    id: string;
    circleId: string;
    eventId: string;
    title: string;
    amount: number;
    dueAt: string;
    targetUserIds: string[];
    bankInfo: string;
    paypayInfo: string;
    createdAt: string;
}

export interface Payment {
    id: string;
    settlementId: string;
    userId: string;
    status: 'UNPAID' | 'PAID_REPORTED' | 'CONFIRMED';
    method: 'BANK' | 'PAYPAY';
    note: string;
    reportedAt: string;
}

export interface SettlementWithPayment {
    settlement: Settlement;
    payment: Payment | null;
}

export interface ChatReference {
    title: string;
    eventId?: string;
}

export interface ChatResponse {
    assistantMessage: string;
    references: ChatReference[];
}
