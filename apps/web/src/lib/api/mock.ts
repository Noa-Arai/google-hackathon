import {
    Circle, Event, Announcement, RSVP, Settlement, Payment, SettlementWithPayment,
    ChatResponse, PracticeCategory, PracticeSeries, PracticeSession, PracticeRSVP, PracticeSeriesDetail,
    CreateEventRequest, CreateAnnouncementRequest, CreateSettlementRequest, CreatePracticeSeriesRequest,
    User, AnnouncementDetail
} from './types';

const CURRENT_USER_ID = 'demo-user-1';

// Mock Data Store
let categories: PracticeCategory[] = [
    { id: 'cat-1', circleId: 'circle-1', name: 'テニス', parentId: '', order: 1, createdBy: 'admin', createdAt: new Date().toISOString() },
    { id: 'cat-2', circleId: 'circle-1', name: 'シングルス', parentId: 'cat-1', order: 1, createdBy: 'admin', createdAt: new Date().toISOString() },
    { id: 'cat-3', circleId: 'circle-1', name: 'ダブルス', parentId: 'cat-1', order: 2, createdBy: 'admin', createdAt: new Date().toISOString() },
];

let seriesList: PracticeSeries[] = [
    { id: 'series-1', circleId: 'circle-1', categoryId: 'cat-2', name: '土曜シングルス練', dayOfWeek: 6, startTime: '14:00', location: '有明テニスの森', fee: 1500, createdBy: 'admin', createdAt: new Date().toISOString() },
    { id: 'series-2', circleId: 'circle-1', categoryId: 'cat-3', name: '平日ナイター', dayOfWeek: 3, startTime: '19:00', location: '日比谷公園', fee: 1000, createdBy: 'admin', createdAt: new Date().toISOString() },
];

let sessions: PracticeSession[] = [
    { id: 'sess-1', seriesId: 'series-1', date: '2024-04-06T14:00:00Z', cancelled: false, note: '', createdAt: new Date().toISOString() },
    { id: 'sess-2', seriesId: 'series-1', date: '2024-04-13T14:00:00Z', cancelled: false, note: '', createdAt: new Date().toISOString() },
    { id: 'sess-3', seriesId: 'series-1', date: '2024-04-20T14:00:00Z', cancelled: true, note: '雨天中止', createdAt: new Date().toISOString() },
    { id: 'sess-4', seriesId: 'series-1', date: '2024-04-27T14:00:00Z', cancelled: false, note: '', createdAt: new Date().toISOString() },
];

let rsvps: PracticeRSVP[] = [
    { id: 'rsvp-1', sessionId: 'sess-1', userId: CURRENT_USER_ID, status: 'GO', updatedAt: new Date().toISOString() },
    { id: 'rsvp-2', sessionId: 'sess-2', userId: CURRENT_USER_ID, status: 'NO', updatedAt: new Date().toISOString() },
];

let settlements: Settlement[] = [];

// API Implementation
export const mockApi = {
    // Circle
    getCircle: async (id: string): Promise<Circle> => ({
        id: 'circle-1',
        name: 'TENNIS CIRCLE',
        description: 'Mock Circle',
        logoUrl: '',
        createdAt: new Date().toISOString(),
    }),

    // Events (Empty for now)
    getEvents: async () => [],
    getEvent: async () => ({} as Event),
    createEvent: async () => ({} as Event),
    getEventsByUser: async () => [],
    updateEvent: async () => ({} as Event),
    deleteEvent: async () => { },

    // Announcements (Empty)
    getAnnouncements: async () => [],
    getEventAnnouncements: async () => [],
    createAnnouncement: async () => ({} as Announcement),
    getAnnouncement: async () => ({} as AnnouncementDetail),

    // RSVP (Event)
    submitRSVP: async () => ({} as RSVP),
    getMyRSVP: async () => null,
    getEventRSVPs: async () => [],

    // Settlements
    getEventSettlements: async () => [],
    getMySettlements: async () => ({ unpaid: [], paid: [] }),
    createSettlement: async () => ({} as Settlement),
    reportPayment: async () => ({} as Payment),
    updateSettlement: async () => ({} as Settlement),

    // Chat
    chat: async () => ({ assistantMessage: 'Mock response', references: [] }),

    // User
    updateUser: async () => ({} as User),
    getUser: async (id: string) => ({ id, name: 'Demo User', avatarUrl: '' }),

    // Practice API
    getPracticeCategories: async (circleId: string) => [...categories],

    createPracticeCategory: async (data: any) => {
        const newCat = { ...data, id: `cat-${Date.now()}`, createdBy: CURRENT_USER_ID, createdAt: new Date().toISOString() };
        categories.push(newCat);
        return newCat;
    },

    deletePracticeCategory: async (id: string) => {
        categories = categories.filter(c => c.id !== id);
    },

    getPracticeSeries: async (circleId: string) => [...seriesList],

    createPracticeSeries: async (data: CreatePracticeSeriesRequest) => {
        const newSeries = { ...data, id: `series-${Date.now()}`, createdBy: CURRENT_USER_ID, createdAt: new Date().toISOString() };
        seriesList.push(newSeries);
        // Create 4 initial sessions
        const start = new Date();
        for (let i = 0; i < 4; i++) {
            sessions.push({
                id: `sess-${Date.now()}-${i}`,
                seriesId: newSeries.id,
                date: new Date(start.setDate(start.getDate() + 7)).toISOString(),
                cancelled: false,
                note: '',
                createdAt: new Date().toISOString(),
            });
        }
        return newSeries;
    },

    getPracticeSeriesDetail: async (id: string): Promise<PracticeSeriesDetail> => {
        const series = seriesList.find(s => s.id === id);
        if (!series) throw new Error('Series not found');
        const sess = sessions.filter(s => s.seriesId === id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const myRsvps = rsvps.filter(r => r.userId === CURRENT_USER_ID && sess.some(s => s.id === r.sessionId));
        return { series, sessions: sess, myRsvps };
    },

    createPracticeSession: async (seriesId: string, data: { date: string; note?: string }) => {
        const newSess = {
            id: `sess-${Date.now()}`,
            seriesId,
            date: data.date,
            cancelled: false,
            note: data.note || '',
            createdAt: new Date().toISOString(),
        };
        sessions.push(newSess);
        return newSess;
    },

    submitPracticeRSVP: async (sessionId: string, status: string) => {
        const existingInfo = rsvps.find(r => r.sessionId === sessionId && r.userId === CURRENT_USER_ID);
        let result: PracticeRSVP;
        if (existingInfo) {
            existingInfo.status = status as 'GO' | 'NO';
            existingInfo.updatedAt = new Date().toISOString();
            result = existingInfo;
        } else {
            result = {
                id: `rsvp-${Date.now()}`,
                sessionId,
                userId: CURRENT_USER_ID,
                status: status as 'GO' | 'NO',
                updatedAt: new Date().toISOString(),
            };
            rsvps.push(result);
        }
        return result;
    },

    bulkPracticeRSVP: async (seriesId: string, items: { sessionId: string; status: string }[]) => {
        items.forEach(item => {
            const existing = rsvps.find(r => r.sessionId === item.sessionId && r.userId === CURRENT_USER_ID);
            if (existing) {
                existing.status = item.status as 'GO' | 'NO';
                existing.updatedAt = new Date().toISOString();
            } else {
                rsvps.push({
                    id: `rsvp-${Date.now()}-${item.sessionId}`,
                    sessionId: item.sessionId,
                    userId: CURRENT_USER_ID,
                    status: item.status as 'GO' | 'NO',
                    updatedAt: new Date().toISOString(),
                });
            }
        });
        return { status: 'ok' };
    },

    createPracticeSettlements: async (seriesId: string, month: string) => {
        // Mock logic: allow success
        console.log(`Created settlements for series ${seriesId} month ${month}`);
        return { status: 'ok' };
    },

    getSessionRSVPs: async (sessionId: string) => {
        return rsvps.filter(r => r.sessionId === sessionId);
    },
};
