// Mock data for local development without API
// Usage: Set NEXT_PUBLIC_MOCK_MODE=true in .env.local

import { Event, Announcement, RSVP, Settlement, SettlementWithPayment, User, Circle, AnnouncementDetail, ChatResponse } from './client';

const now = new Date();
const tomorrow = new Date(now.getTime() + 86400000);
const nextWeek = new Date(now.getTime() + 7 * 86400000);
const lastWeek = new Date(now.getTime() - 7 * 86400000);

export const MOCK_EVENTS: Event[] = [
    {
        id: 'mock-event-1',
        circleId: 'mock-circle',
        title: '【通常練習】土曜テニス練習',
        startAt: tomorrow.toISOString(),
        location: '東京都立公園テニスコート',
        coverImageUrl: 'https://picsum.photos/seed/tennis1/400/300',
        rsvpTargetUserIds: ['demo-user-1', 'demo-user-2', 'demo-user-3', 'demo-user-4'],
        createdBy: 'demo-user-1',
        createdAt: now.toISOString(),
    },
    {
        id: 'mock-event-2',
        circleId: 'mock-circle',
        title: '【特別イベント】春季テニス大会',
        startAt: nextWeek.toISOString(),
        location: '品川スポーツセンター',
        coverImageUrl: 'https://picsum.photos/seed/tennis2/400/300',
        rsvpTargetUserIds: ['demo-user-1', 'demo-user-2', 'demo-user-3'],
        createdBy: 'demo-user-1',
        createdAt: now.toISOString(),
    },
    {
        id: 'mock-event-3',
        circleId: 'mock-circle',
        title: '【通常練習】水曜夜練習',
        startAt: lastWeek.toISOString(),
        location: '渋谷区スポーツセンター',
        coverImageUrl: '',
        rsvpTargetUserIds: ['demo-user-1', 'demo-user-2'],
        createdBy: 'demo-user-2',
        createdAt: lastWeek.toISOString(),
    },
    {
        id: 'mock-event-4',
        circleId: 'mock-circle',
        title: '【特別イベント】新歓BBQ',
        startAt: new Date(now.getTime() + 14 * 86400000).toISOString(),
        location: '代々木公園',
        coverImageUrl: 'https://picsum.photos/seed/bbq/400/300',
        rsvpTargetUserIds: ['demo-user-1', 'demo-user-2', 'demo-user-3', 'demo-user-4'],
        createdBy: 'demo-user-1',
        createdAt: now.toISOString(),
    },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: 'mock-ann-1',
        circleId: 'mock-circle',
        eventId: 'mock-event-1',
        title: '練習場所の変更について',
        body: '今週の練習場所が変更になりました。詳細はこちらをご確認ください。新しい場所は東京都立公園テニスコートA面です。',
        createdBy: 'demo-user-1',
        createdAt: now.toISOString(),
    },
    {
        id: 'mock-ann-2',
        circleId: 'mock-circle',
        eventId: 'mock-event-2',
        title: '大会エントリー締切',
        body: '春季テニス大会のエントリー締切は来週金曜日です。参加希望の方は早めに登録をお願いします。',
        createdBy: 'demo-user-1',
        createdAt: lastWeek.toISOString(),
    },
];

export const MOCK_RSVPS: Record<string, RSVP | null> = {
    'mock-event-1': { id: 'mock-rsvp-1', eventId: 'mock-event-1', userId: 'demo-user-1', status: 'GO', note: '', updatedAt: now.toISOString() },
    'mock-event-2': null, // 未登録
    'mock-event-3': { id: 'mock-rsvp-3', eventId: 'mock-event-3', userId: 'demo-user-1', status: 'NO', note: '仕事', updatedAt: lastWeek.toISOString() },
    'mock-event-4': null, // 未登録
};

export const MOCK_ALL_RSVPS: Record<string, RSVP[]> = {
    'mock-event-1': [
        { id: 'r1', eventId: 'mock-event-1', userId: 'demo-user-1', status: 'GO', note: '', updatedAt: now.toISOString() },
        { id: 'r2', eventId: 'mock-event-1', userId: 'demo-user-2', status: 'GO', note: '', updatedAt: now.toISOString() },
        { id: 'r3', eventId: 'mock-event-1', userId: 'demo-user-3', status: 'LATE', note: '30分遅れます', updatedAt: now.toISOString() },
        { id: 'r4', eventId: 'mock-event-1', userId: 'demo-user-4', status: 'NO', note: '', updatedAt: now.toISOString() },
    ],
    'mock-event-2': [
        { id: 'r5', eventId: 'mock-event-2', userId: 'demo-user-2', status: 'GO', note: '', updatedAt: now.toISOString() },
    ],
    'mock-event-3': [
        { id: 'r6', eventId: 'mock-event-3', userId: 'demo-user-1', status: 'NO', note: '仕事', updatedAt: lastWeek.toISOString() },
        { id: 'r7', eventId: 'mock-event-3', userId: 'demo-user-2', status: 'GO', note: '', updatedAt: lastWeek.toISOString() },
    ],
};

export const MOCK_SETTLEMENTS: Settlement[] = [
    {
        id: 'mock-settle-1',
        circleId: 'mock-circle',
        eventId: 'mock-event-1',
        title: 'コート代',
        amount: 500,
        dueAt: nextWeek.toISOString(),
        targetUserIds: ['demo-user-1', 'demo-user-2', 'demo-user-3'],
        bankInfo: '三菱UFJ 1234567',
        paypayInfo: '@tanaka-tennis',
        createdAt: now.toISOString(),
    },
    {
        id: 'mock-settle-2',
        circleId: 'mock-circle',
        eventId: 'mock-event-3',
        title: 'ボール代',
        amount: 300,
        dueAt: lastWeek.toISOString(),
        targetUserIds: ['demo-user-1', 'demo-user-2'],
        bankInfo: '三菱UFJ 1234567',
        paypayInfo: '',
        createdAt: lastWeek.toISOString(),
    },
];

export const MOCK_MY_SETTLEMENTS: { unpaid: SettlementWithPayment[]; paid: SettlementWithPayment[] } = {
    unpaid: [
        {
            settlement: MOCK_SETTLEMENTS[0],
            payment: null,
        },
    ],
    paid: [
        {
            settlement: MOCK_SETTLEMENTS[1],
            payment: {
                id: 'mock-pay-1',
                settlementId: 'mock-settle-2',
                userId: 'demo-user-1',
                status: 'CONFIRMED',
                method: 'PAYPAY',
                note: '',
                reportedAt: lastWeek.toISOString(),
            },
        },
    ],
};

export const MOCK_CIRCLE: Circle = {
    id: 'mock-circle',
    name: 'CIRCLE',
    description: 'テニスサークル',
    logoUrl: '',
    createdAt: now.toISOString(),
};

export function isMockMode(): boolean {
    return process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
}
