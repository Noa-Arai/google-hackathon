'use client';

import { useState, useEffect } from 'react';
import { api, Event, RSVP } from '@/lib/api/client';
import { apiRequest } from '@/lib/api/client';
import { DEFAULT_CIRCLE_ID } from '@/lib/constants';
import Link from 'next/link';
import { useUser } from '@/components/providers/UserContext';
import { MOCK_USERS } from '@/lib/constants/users';
import ChatPanel from '@/components/ChatPanel';

import CalendarView from '@/components/CalendarView';

// Extended Event type to include participants
interface EventWithParticipants extends Event {
    participantCount: number;
    participantAvatars: string[];
}

export default function EventsPage() {
    const { currentUser } = useUser();
    const [events, setEvents] = useState<EventWithParticipants[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'SPECIAL' | 'PRACTICE'>('ALL');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const data = await api.getEvents(DEFAULT_CIRCLE_ID);

                // Enhance events with participant info (mock logic for MVP)
                // In a real app, backend should return this count/list
                const enhancedEvents = await Promise.all(data.map(async (event) => {
                    // Try to fetch RSVPs to show avatars
                    // This is N+1, but fine for MVP
                    let participants: string[] = [];
                    try {
                        const rsvps = await Promise.all(
                            MOCK_USERS.map(u =>
                                apiRequest<RSVP | null>(`/events/${event.id}/rsvp/me`, { userId: u.id })
                                    .catch(() => null)
                            )
                        );

                        const attendingUserIds = new Set<string>();
                        rsvps.forEach((r, i) => {
                            if (r && ['GO', 'LATE', 'EARLY'].includes(r.status)) {
                                attendingUserIds.add(MOCK_USERS[i].id);
                            }
                        });

                        participants = MOCK_USERS.filter(u => attendingUserIds.has(u.id)).map(u => u.avatarUrl);
                    } catch (e) {
                        // ignore
                    }

                    return {
                        ...event,
                        participantCount: participants.length,
                        participantAvatars: participants.slice(0, 3) // Show first 3
                    };
                }));

                const sortedEvents = enhancedEvents.sort(
                    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
                );

                setEvents(sortedEvents);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event => {
        if (filter === 'ALL') return true;
        // Simple tag logic based on title for MVP
        if (filter === 'SPECIAL') return !event.title.includes('通常練習');
        if (filter === 'PRACTICE') return event.title.includes('通常練習');
        return true;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        return { month, day, weekday, fullDate: `${date.getFullYear()}年${month}月${day}日` };
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">イベント一覧</h1>
                    <p className="text-[#8b98b0]">サークルの活動スケジュール</p>
                </div>

                <div className="flex bg-[#1a1f2e] p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                            ? 'bg-[#3b82f6] text-white'
                            : 'text-[#8b98b0] hover:text-white'
                            }`}
                    >
                        リスト
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar'
                            ? 'bg-[#3b82f6] text-white'
                            : 'text-[#8b98b0] hover:text-white'
                            }`}
                    >
                        カレンダー
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {[
                    { id: 'ALL', label: 'すべて' },
                    { id: 'PRACTICE', label: '通常練習' },
                    { id: 'SPECIAL', label: '特別イベント' },
                ].map((tab: { id: string; label: string }) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filter === tab.id
                            ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                            : 'bg-[#1a1f2e] border-white/10 text-[#8b98b0] hover:border-white/30 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}

                {/* Add Event Button (Inline) */}
                <Link
                    href="/events/new"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 hover:bg-[#3b82f6] hover:text-white transition-all ml-2"
                    aria-label="イベントを作成"
                >
                    <span className="text-xl font-light">+</span>
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-[#1a1f2e] rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-[#1a1f2e] rounded-2xl border border-white/10">
                    <p className="text-[#8b98b0]">該当するイベントはありません</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="space-y-4">
                    {filteredEvents.map(event => {
                        const { month, day, weekday, fullDate } = formatDate(event.startAt);
                        const isPractice = event.title.includes('通常練習');

                        return (
                            <Link key={event.id} href={`/events/${event.id}`}>
                                <div className="group bg-[#1a1f2e] border border-white/10 hover:border-[#3b82f6]/50 rounded-xl p-5 transition-all hover:bg-[#1f2536]">
                                    <div className="flex items-start gap-4">
                                        {/* Date Box */}
                                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-black/30 rounded-lg border border-white/5 group-hover:border-[#3b82f6]/30">
                                            <span className="text-[10px] text-[#8b98b0] leading-none">{month}月</span>
                                            <span className="text-xl font-bold text-white leading-tight">{day}</span>
                                            <span className="text-[10px] text-[#8b98b0] leading-none">{weekday}曜</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs px-2 py-0.5 rounded ${isPractice
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                    }`}>
                                                    {isPractice ? '通常練習' : '特別イベント'}
                                                </span>
                                                <span className="text-xs text-[#8b98b0]">{fullDate} start</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-[#3b82f6] transition-colors mb-2">
                                                {event.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-[#8b98b0]">
                                                <span>📍 {event.location || '場所未定'}</span>
                                            </div>
                                        </div>

                                        {/* Participants Preview */}
                                        <div className="hidden sm:flex items-center -space-x-2">
                                            {event.participantAvatars.map((url, i) => (
                                                <img
                                                    key={i}
                                                    src={url}
                                                    alt="participant"
                                                    className="w-8 h-8 rounded-full border-2 border-[#1a1f2e]"
                                                />
                                            ))}
                                            {event.participantCount > 3 && (
                                                <div className="w-8 h-8 rounded-full bg-[#2a3040] border-2 border-[#1a1f2e] flex items-center justify-center text-xs text-white">
                                                    +{event.participantCount - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="animate-fade-in">
                    <CalendarView events={filteredEvents} />
                </div>
            )}


            {/* AI Chat Panel - Fixed Bottom Right */}
            <div className="fixed bottom-6 right-6 z-50">
                <ChatPanel circleId={DEFAULT_CIRCLE_ID} />
            </div>
        </div>
    );
}
